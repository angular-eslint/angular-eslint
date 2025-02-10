import { writeFileSync } from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import bcd from '@mdn/browser-compat-data';

run().catch((ex) => {
  console.error(chalk.red(ex));
  process.exit(1);
});

async function run(): Promise<void> {
  const names = getEventNamesFromBrowserCompatData();
  const fileName = path.resolve(
    __dirname,
    '../../packages/utils/src/eslint-plugin/get-native-event-names.ts',
  );

  process.stdout.write(chalk.cyan(`Updating ${path.basename(fileName)}...\n`));

  writeFileSync(
    fileName,
    `
let nativeEventNames: ReadonlySet<string> | null = null;

/**
 * Check MDN events page for details https://developer.mozilla.org/en-US/docs/Web/Events
 *
 * Event names sourced from @mdn/browser-compat-data@${bcd.__meta.version}
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

  process.stdout.write(chalk.green('Event names updated successfully.\n'));
}

function getEventNamesFromBrowserCompatData(): string[] {
  const eventNames = new Set<string>();

  process.stdout.write(chalk.cyan(`Finding native event names...\n`));

  for (const name of Object.keys(bcd.api).sort((a, b) => a.localeCompare(b))) {
    if (
      name === 'Document' ||
      name === 'Node' ||
      name === 'Window' ||
      name.endsWith('Element')
    ) {
      let hasEvents = false;
      const data = bcd.api[name];
      for (const key of Object.keys(data)) {
        const match = /^(\w+)_event$/.exec(key);

        if (match) {
          if (!hasEvents) {
            hasEvents = true;
            process.stdout.write(`  ${chalk.yellow.dim(name)}\n`);
          }

          const eventName = match[1];
          eventNames.add(eventName);

          const status = data[key].__compat?.status;
          const statusType = status?.deprecated
            ? 'deprecated'
            : status?.experimental
              ? 'experimental'
              : undefined;

          process.stdout.write(
            `    ${chalk.white(eventName)}${statusType !== undefined ? ` ${chalk.gray(`(${statusType})`)}` : ''}\n`,
          );
        }
      }
    }
  }

  return [...eventNames];
}
