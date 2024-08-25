const { spawn } = require('node:child_process');
const { platform } = require('node:os');

// In certain circumstances we want to skip the below the steps and it may not always
// be possible to use --ignore-scripts (e.g. if another tool is what is invoking the
// install command, such as when nx migrate runs). We therefore use and env var for this.
if (process.env.SKIP_POSTINSTALL) {
  console.log('Skipping postinstall script...');
  process.exit(0);
}

(async function run() {
  // Build all the packages ready for use
  await pnpm('build');

  // Check for a clean workspace after install and build
  await pnpm('check-clean-workspace-after-install');
})().catch((ex) => {
  console.error(ex);
  process.exit(1);
});

async function pnpm(...args) {
  return new Promise((resolve, reject) => {
    let p = spawn(platform() === 'win32' ? 'pnpm.cmd' : 'pnpm', args, {
      shell: true,
    });

    p.stdout
      .setEncoding('utf8')
      .on('data', (data) => process.stdout.write(data));

    p.stderr
      .setEncoding('utf8')
      .on('data', (data) => process.stderr.write(data));

    p.on('exit', (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `Command "pnpm ${args.join(' ')}" exited with code ${code}`,
          ),
        );
      } else {
        resolve();
      }
    });
  });
}
