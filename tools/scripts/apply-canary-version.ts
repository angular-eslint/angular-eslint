import execa from 'execa';
import semver from 'semver';

const preid = 'alpha';
const distTag = 'canary';

(async function main() {
  const currentLatestVersion = execa
    .sync('npm', ['view', '@angular-eslint/eslint-plugin@latest', 'version'])
    .stdout?.trim();

  const currentCanaryVersion = execa
    .sync('npm', [
      'view',
      `@angular-eslint/eslint-plugin@${distTag}`,
      'version',
    ])
    .stdout?.trim();

  console.log('\nResolved current versions: ', {
    currentLatestVersion,
    currentCanaryVersion,
  });

  let nextCanaryVersion: string | null;

  if (semver.gte(currentLatestVersion, currentCanaryVersion)) {
    console.log(
      '\nLatest version is greater than or equal to the current canary version, starting new prerelease base...',
    );
    // Determine next minor version above the currentLatestVersion
    nextCanaryVersion = semver.inc(
      currentLatestVersion,
      'prerelease',
      undefined,
      preid,
    );
  } else {
    console.log(
      '\nLatest version is less than the current canary version, incrementing the existing prerelease base...',
    );
    // Determine next prerelease version above the currentCanaryVersion
    nextCanaryVersion = semver.inc(
      currentCanaryVersion,
      'prerelease',
      undefined,
      preid,
    );
  }

  if (!nextCanaryVersion) {
    console.log(`Error: Unable to determine next canary version`);
    process.exit(1);
  }

  console.log(`\nApplying next canary version with Nx`);

  const command = `nx release version ${nextCanaryVersion}`;

  console.log(`\n> ${command}\n`);

  execa.sync('yarn', command.split(' '), {
    stdio: 'inherit',
  });
})();
