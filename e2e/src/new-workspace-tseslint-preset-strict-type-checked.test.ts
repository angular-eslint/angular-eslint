import path from 'node:path';
import { setWorkspaceRoot } from 'nx/src/utils/workspace-root';
import { beforeAll, describe, expect, it, vi } from 'vitest';
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

const fixtureDirectory = 'new-workspace-tseslint-preset-strict-type-checked';
let fixture: Fixture;

describe('new-workspace with --tseslint-preset=strictTypeChecked', () => {
  vi.setConfig({ testTimeout: LONG_TIMEOUT_MS });

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

    await runNgAdd(['--tseslint-preset=strictTypeChecked']);
  });

  it('should generate the strict type-checked preset with the Project Service and pass linting', async () => {
    const eslintConfig = fixture.readFile('eslint.config.js');
    expect(eslintConfig).toContain('tseslint.configs.strictTypeChecked');
    expect(eslintConfig).toContain('tseslint.configs.stylisticTypeChecked');
    expect(eslintConfig).toContain('projectService: true');
    expect(eslintConfig).toContain(
      'Enable typed linting via the typescript-eslint Project Service',
    );

    const lintOutput = await runLint(fixtureDirectory);
    expect(lintOutput).toContain('All files pass linting');
  });
});
