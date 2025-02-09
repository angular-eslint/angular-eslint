import { writeFileSync } from 'node:fs';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import chalk from 'chalk';

const SOURCE_REPOSITORY_NAME = 'mdn/browser-compat-data';

run().catch((ex) => {
  console.error(chalk.red(ex));
  process.exit(1);
});

async function run(): Promise<void> {
  const repositoryRoot = await checkout();

  try {
    const commit = await getCommitSha(repositoryRoot);
    const names = await getEventNamesFromBrowserCompatData(repositoryRoot);

    process.stdout.write(chalk.cyan(`Updating source file...\n`));

    writeFileSync(
      path.resolve(
        __dirname,
        '../../packages/utils/src/eslint-plugin/get-native-event-names.ts',
      ),
      `
let nativeEventNames: ReadonlySet<string> | null = null;

/**
 * Check MDN events page for details https://developer.mozilla.org/en-US/docs/Web/Events
 *
 * Event names sourced from https://github.com/${SOURCE_REPOSITORY_NAME}/tree/${commit}/api
 */
export function getNativeEventNames(): ReadonlySet<string> {
  return (
    nativeEventNames ??
    (nativeEventNames = new Set<string>([${[...names]
      .sort((a, b) => a.localeCompare(b))
      .map((x) => `\n      '${x}',`)
      .join('')}
    ]))
  );
}
`.trimStart(),
    );
  } finally {
    process.stdout.write(
      chalk.cyan(`Removing ${SOURCE_REPOSITORY_NAME} repository...\n`),
    );
    await fs.rm(repositoryRoot, {
      recursive: true,
      force: true,
      maxRetries: 10,
    });
  }

  process.stdout.write(chalk.green('Event names updated successfully.\n'));
}

async function checkout(): Promise<string> {
  const parent = os.tmpdir();
  const repositoryRoot = randomUUID();

  process.stdout.write(
    chalk.cyan(`Cloning ${SOURCE_REPOSITORY_NAME} repository...\n`),
  );

  await git(
    [
      'clone',
      '--depth',
      '1',
      `https://github.com/${SOURCE_REPOSITORY_NAME}`,
      repositoryRoot,
    ],
    parent,
  );

  return path.join(parent, repositoryRoot);
}

async function getCommitSha(repositoryRoot: string): Promise<string> {
  return (await git(['rev-parse', '--verify', 'HEAD'], repositoryRoot)).trim();
}

async function git(args: string[], cwd: string): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const git = spawn('git', args, { cwd });

    git.stdout.setEncoding('utf-8');
    git.stdout.on('data', (data: string) => stdout.push(data));

    git.stderr.setEncoding('utf-8');
    git.stderr.on('data', (data: string) => stderr.push(data));

    git
      .on('exit', (code) => {
        if (code === 0) {
          resolve(stdout.join(''));
        } else {
          reject(new Error(`git failed with code ${code}: ${stderr.join('')}`));
        }
      })
      .on('error', reject);
  });
}

async function getEventNamesFromBrowserCompatData(
  repositoryRoot: string,
): Promise<string[]> {
  const eventNames = new Set<string>();

  process.stdout.write(chalk.cyan(`Finding native event names...\n`));

  const files = (
    await fs.readdir(path.join(repositoryRoot, 'api'), {
      withFileTypes: true,
    })
  )
    .filter((entry) => entry.isFile())
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of files) {
    const extension = path.extname(entry.name);

    if (extension !== '.json') {
      continue;
    }

    const name = path.basename(entry.name, extension);

    if (
      name === 'Document' ||
      name === 'Node' ||
      name === 'Window' ||
      name.endsWith('Element')
    ) {
      const data: BrowserCompatData = JSON.parse(
        await fs.readFile(path.join(entry.parentPath, entry.name), 'utf-8'),
      );

      if (name in data.api) {
        let hasEvents = false;
        const typeData = data.api[name];
        for (const key of Object.keys(typeData)) {
          const match = /^(\w+)_event$/.exec(key);

          if (match) {
            if (!hasEvents) {
              hasEvents = true;
              process.stdout.write(`  ${chalk.yellow.dim(name)}\n`);
            }

            const eventName = match[1];
            eventNames.add(eventName);

            const status = typeData[key].__compat.status;
            const statusType = status.deprecated
              ? 'deprecated'
              : status.experimental
                ? 'experimental'
                : undefined;

            process.stdout.write(
              `    ${chalk.white(eventName)}${statusType !== undefined ? ` ${chalk.gray(`(${statusType})`)}` : ''}\n`,
            );
          }
        }
      }
    }
  }

  return [...eventNames];
}

interface BrowserCompatData {
  api: Record<
    string,
    Record<
      string,
      {
        __compat: {
          status: {
            experimental: boolean;
            standard_track: boolean;
            deprecated: boolean;
          };
        };
      }
    >
  >;
}
