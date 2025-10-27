import path from 'node:path';
import { setWorkspaceRoot } from 'nx/src/utils/workspace-root';
import {
  FIXTURES_DIR,
  Fixture,
  resetFixtureDirectory,
} from '../utils/fixtures';
import {
  LONG_TIMEOUT_MS,
  runNgAdd,
  runNgNew,
} from '../utils/local-registry-process';
import { runLint } from '../utils/run-lint';
import { normalizeVersionsOfPackagesWeDoNotControl } from '../utils/snapshot-serializers';

expect.addSnapshotSerializer(normalizeVersionsOfPackagesWeDoNotControl);

const fixtureDirectory = 'new-workspace-typescript-config';
let fixture: Fixture;

describe('new-workspace with TypeScript config', () => {
  jest.setTimeout(LONG_TIMEOUT_MS);

  beforeAll(async () => {
    resetFixtureDirectory(fixtureDirectory);
    process.chdir(FIXTURES_DIR);

    await runNgNew(fixtureDirectory);

    process.env.NX_DAEMON = 'false';
    process.env.NX_CACHE_PROJECT_GRAPH = 'false';

    const workspaceRoot = path.join(FIXTURES_DIR, fixtureDirectory);
    process.chdir(workspaceRoot);
    process.env.NX_WORKSPACE_ROOT_PATH = workspaceRoot;
    setWorkspaceRoot(workspaceRoot);

    fixture = new Fixture(workspaceRoot);

    await runNgAdd();

    // Replace the default eslint.config.js with a TypeScript version
    fixture.deleteFileOrDirectory('eslint.config.js');

    // Create a TypeScript config with the same content
    const tsConfig = `import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  }
);`;

    fixture.writeFile('eslint.config.ts', tsConfig);
  });

  it('should show an error when linting using a TypeScript config before the user installs jiti', async () => {
    const result = await runLint(fixtureDirectory);
    expect(result).toMatchSnapshot();
  });

  it('should pass linting with TypeScript config after the user installs jiti', async () => {
    fixture.runCommand('npm install -D jiti');
    const result = await runLint(fixtureDirectory);
    expect(result).toMatchSnapshot();
  });
});
