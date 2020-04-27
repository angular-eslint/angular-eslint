import * as execa from 'execa';
import path from 'path';

const FIXTURES_DIR = path.join(__dirname, '../fixtures/');

function normalizeOutput(value: string = ''): string {
  return String(value).replace(new RegExp(FIXTURES_DIR, 'g'), '__ROOT__/');
}

function runCommandsAndNormalizeOutput(
  directory: string,
  cb: (cwd: string) => string,
): string {
  try {
    const cwd = path.join(FIXTURES_DIR, directory);
    process.chdir(cwd);

    return normalizeOutput(cb(cwd));
  } catch (error) {
    return normalizeOutput(error.stdout || error);
  }
}

function runNgAdd(directory: string): unknown {
  return runCommandsAndNormalizeOutput(directory, (cwd: string) => {
    execa.sync(path.join(cwd, '../../install-schematics-deps.sh'), {
      cwd,
    });

    const { stdout } = execa.sync(
      'npx',
      ['ng', 'add', './node_modules/@angular-eslint/schematics'],
      {
        cwd,
      },
    );
    return stdout;
  });
}

function runMigrateProjectToESLint(
  directory: string,
  projectName: string,
): unknown {
  return runCommandsAndNormalizeOutput(directory, (cwd: string) => {
    const { stdout } = execa.sync(
      'npx',
      [
        'ng',
        'g',
        '@angular-eslint/schematics:migrate-project-to-eslint',
        '--project',
        projectName,
      ],
      {
        cwd,
      },
    );
    return stdout;
  });
}

describe('tslint-to-eslint-migration schematics', () => {
  it('should transform an existing Angular CLI workspace to use ESLint', () => {
    /**
     * Run ng-add to add the required dependencies and root level config file
     */
    const ngAddOutput = runNgAdd('tslint-to-eslint-migration');
    expect(ngAddOutput).toContain('Installing packages for tooling');
    expect(ngAddOutput).toContain('Installed packages for tooling');
    expect(ngAddOutput).toContain('CREATE .eslintrc.json');
    expect(ngAddOutput).toContain('UPDATE package.json');
    /**
     * Run migrate-project-to-eslint to convert an existing Angular CLI project
     * to use ESlint for its lint target instead of TSLint
     */
    const migrateProjectToESLintOutput = runMigrateProjectToESLint(
      'tslint-to-eslint-migration',
      'another-app',
    );
    expect(migrateProjectToESLintOutput).toContain(
      'CREATE projects/another-app/.eslintrc.json',
    );
    expect(migrateProjectToESLintOutput).toContain('UPDATE angular.json');
  });
});
