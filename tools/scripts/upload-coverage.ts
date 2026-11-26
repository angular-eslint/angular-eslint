/**
 * Uploads the coverage reports to Codecov from Nx Cloud CI, which codecov-action does not support
 * and the Codecov CLI cannot detect the commit and pull request details of.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { globSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CLI_VERSION = 'v11.3.2';
const CLI_SHA256 =
  '8e1bfb71661378530f6ea21e82b414095899e565cbb4cf555c613064be17b973';

(async function run() {
  const files = globSync('coverage/packages/**/lcov.info');
  if (files.length === 0) {
    throw new Error('No coverage reports found to upload');
  }

  const { sha, branch, pr } = await getCommitDetails();
  const cli = await downloadCli();

  const args = [
    'upload-coverage',
    // Otherwise the CLI exits successfully when the upload is rejected
    '--fail-on-error',
    '--git-service',
    'github',
    '--slug',
    getEnv('NX_CLOUD_REPOSITORY'),
    '--sha',
    sha,
    '--branch',
    branch,
    '--flag',
    'unittest',
    '--name',
    'codecov',
    ...(pr ? ['--pr', pr] : []),
    ...files.flatMap((file) => ['--file', file]),
  ];
  console.log(`codecov ${args.join(' ')}`);

  // The CLI reads the token from the environment, an empty one must not be passed for forks
  const env = { ...process.env };
  if (!env.CODECOV_TOKEN) {
    delete env.CODECOV_TOKEN;
  }
  execFileSync(cli, args, { stdio: 'inherit', env });
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function downloadCli(): Promise<string> {
  const response = await fetch(
    `https://cli.codecov.io/${CLI_VERSION}/linux/codecov`,
  );
  if (!response.ok) {
    throw new Error(`Failed to download the Codecov CLI: ${response.status}`);
  }
  const contents = Buffer.from(await response.arrayBuffer());
  const sha256 = createHash('sha256').update(contents).digest('hex');
  if (sha256 !== CLI_SHA256) {
    throw new Error(`Unexpected Codecov CLI checksum: ${sha256}`);
  }
  const path = join(mkdtempSync(join(tmpdir(), 'codecov-')), 'codecov');
  writeFileSync(path, contents, { mode: 0o755 });
  return path;
}

async function getCommitDetails(): Promise<{
  sha: string;
  branch: string;
  pr?: string;
}> {
  const pr = getEnv('NX_CLOUD_REF').match(/^refs\/pull\/(\d+)\//)?.[1];
  if (!pr) {
    return {
      sha: getEnv('NX_CLOUD_SHA'),
      branch: getEnv('NX_CLOUD_REF_NAME'),
    };
  }

  const repository = getEnv('NX_CLOUD_REPOSITORY');
  const response = await fetch(
    `${getEnv('NX_CLOUD_VCS_API_URL')}/repos/${repository}/pulls/${pr}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(process.env.GITHUB_TOKEN && {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        }),
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to read pull request ${pr}: ${response.status}`);
  }
  const { head } = (await response.json()) as {
    head: {
      sha: string;
      ref: string;
      label: string;
      repo: { full_name: string } | null;
    };
  };
  // If the pull request has been pushed to since this run started, the coverage must not be
  // attributed to the newer commit
  if (!getCheckedOutCommits().includes(head.sha)) {
    throw new Error(`Pull request head ${head.sha} is not what was tested`);
  }
  return {
    sha: head.sha,
    // Codecov requires the `owner:branch` form for tokenless uploads from forks
    branch: head.repo?.full_name === repository ? head.ref : head.label,
    pr,
  };
}

/**
 * Returns the checked out commit and its parents, because for pull requests it can be the merge
 * commit of the pull request head and the base branch.
 */
function getCheckedOutCommits(): string[] {
  const git = (...args: string[]) =>
    execFileSync('git', args, { encoding: 'utf8' });
  // The raw commit includes the parents even in a shallow clone
  const parents = git('cat-file', 'commit', 'HEAD').matchAll(/^parent (.+)$/gm);
  return [
    git('rev-parse', 'HEAD').trim(),
    ...[...parents].map(([, parent]) => parent),
  ];
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}
