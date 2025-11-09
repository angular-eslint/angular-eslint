import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  vi,
} from 'vitest';
import { Architect } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { json, logging, schema } from '@angular-devkit/core';
import { workspaceRoot } from '@nx/devkit';
import type { ESLint } from 'eslint';
import * as fs from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, sep } from 'node:path';
import { setWorkspaceRoot } from 'nx/src/utils/workspace-root';
import type { Schema } from './schema';

// Add a placeholder file for the native workspace context within nx implementation details otherwise it will hang in CI
const testWorkspaceRoot = fs.mkdtempSync(join(tmpdir(), 'workspace'));
fs.writeFileSync(join(testWorkspaceRoot, 'package.json'), '{}', {
  encoding: 'utf-8',
});

// Mock fs methods - we need to do this after the initial file creation
vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return {
    ...actual,
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    existsSync: vi.fn(() => false),
  };
});

// Mock process.chdir
vi.spyOn(process, 'chdir').mockImplementation(() => undefined);

const mockFormatter = {
  format: vi
    .fn()
    .mockImplementation((results: ESLint.LintResult[]): string =>
      results
        .map(({ messages }) =>
          messages.map(({ message }) => message).join('\n'),
        )
        .join('\n'),
    ),
};
const mockLoadFormatter = vi.fn().mockReturnValue(mockFormatter);
const mockOutputFixes = vi.fn();

const VALID_ESLINT_VERSION = '7.6';

let mockReports: unknown[] = [
  { results: [], messages: [], usedDeprecatedRules: [] },
];

class MockESLint {
  static version = VALID_ESLINT_VERSION;
  static outputFixes = mockOutputFixes;
  loadFormatter = mockLoadFormatter;
  isPathIgnored = vi.fn().mockReturnValue(false);
  lintFiles = vi.fn().mockImplementation(() => mockReports);
}

const mockResolveAndInstantiateESLint = vi.fn().mockReturnValue(
  Promise.resolve({
    ESLint: MockESLint,
    eslint: new MockESLint(),
  }),
);

vi.mock(import('./utils/eslint-utils.js'), async (importOriginal) => {
  const { supportedFlatConfigNames } = await importOriginal();
  return {
    resolveAndInstantiateESLint: mockResolveAndInstantiateESLint,
    supportedFlatConfigNames,
  };
});

function createValidRunBuilderOptions(
  additionalOptions: Partial<Schema> = {},
): Schema {
  return {
    lintFilePatterns: [],
    eslintConfig: null,
    exclude: ['excludedFile1'],
    fix: true,
    cache: true,
    cacheLocation: 'cacheLocation1',
    cacheStrategy: 'content',
    format: 'stylish',
    force: false,
    quiet: false,
    maxWarnings: -1,
    silent: false,
    ignorePath: null,
    outputFile: null,
    stats: false,
    noEslintrc: false,
    rulesdir: [],
    resolvePluginsRelativeTo: null,
    reportUnusedDisableDirectives: null,
    useEslintrc: null,
    noConfigLookup: null,
    concurrency: null,
    ...additionalOptions,
  };
}

const registry = new json.schema.CoreSchemaRegistry();
registry.addPostTransform(schema.transforms.addUndefinedDefaults);

const mockGetProjectMetadata = vi.fn();
const testArchitectHost = new TestingArchitectHost(
  testWorkspaceRoot,
  testWorkspaceRoot,
  {
    getProjectMetadata: mockGetProjectMetadata,
  } as any,
);
const builderName = '@angular-eslint/builder:lint';

// Builder implementation will be loaded in beforeAll

const architect = new Architect(testArchitectHost, registry);

async function runBuilder(options: Schema) {
  const logger = new logging.Logger('');
  const run = await architect.scheduleBuilder(builderName, options, {
    logger,
  });
  return run.result;
}

describe('Linter Builder', () => {
  const previousWorkspaceRoot = workspaceRoot;
  beforeAll(async () => {
    // Dynamically import the implementation after mocks are set up
    // @ts-expect-error - This is valid
    const module = await import('./lint.impl');
    const builderImplementation = module.default;
    testArchitectHost.addBuilder(builderName, builderImplementation);
    setWorkspaceRoot(testWorkspaceRoot);
  });

  beforeEach(() => {
    MockESLint.version = VALID_ESLINT_VERSION;
    mockReports = [{ results: [], messages: [], usedDeprecatedRules: [] }];
    mockGetProjectMetadata.mockReturnValue({
      root: 'packages/test-project',
      sourceRoot: 'packages/test-project/src',
      projectType: 'application',
      name: 'test-project',
    });
    console.warn = vi.fn();
    console.error = vi.fn();
    console.info = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
    setWorkspaceRoot(previousWorkspaceRoot);
  });

  it('should fail if the eslint version is not supported', async () => {
    MockESLint.version = '1.6';
    const result = runBuilder(createValidRunBuilderOptions());
    await expect(result).resolves.toMatchInlineSnapshot(`
      {
        "error": "Error when running ESLint: ESLint must be version 7.6 or higher.",
        "info": {
          "builderName": "@angular-eslint/builder:lint",
          "description": "Testing only builder.",
          "optionSchema": {
            "type": "object",
          },
        },
        "success": false,
      }
    `);
  });

  it('should not fail if the eslint version is supported', async () => {
    const result = await runBuilder(createValidRunBuilderOptions());
    expect(result.error).toBeUndefined();
  });

  it('should resolve and instantiate ESLint with the options that were passed to the builder', async () => {
    await runBuilder(
      createValidRunBuilderOptions({
        lintFilePatterns: [],
        eslintConfig: './.eslintrc',
        exclude: ['excludedFile1'],
        fix: true,
        quiet: false,
        cache: true,
        cacheLocation: 'cacheLocation1',
        cacheStrategy: 'content',
        format: 'stylish',
        force: false,
        silent: false,
        stats: false,
        maxWarnings: -1,
        outputFile: null,
        ignorePath: null,
        noEslintrc: false,
        noConfigLookup: null,
        rulesdir: [],
        resolvePluginsRelativeTo: null,
      }),
    );
    expect(mockResolveAndInstantiateESLint).toHaveBeenCalledTimes(1);
    expect(mockResolveAndInstantiateESLint).toHaveBeenCalledWith(
      join(testWorkspaceRoot, '.eslintrc'),
      {
        lintFilePatterns: [],
        eslintConfig: './.eslintrc',
        exclude: ['excludedFile1'],
        fix: true,
        quiet: false,
        cache: true,
        cacheLocation: `cacheLocation1${sep}test-project`,
        cacheStrategy: 'content',
        format: 'stylish',
        force: false,
        silent: false,
        stats: false,
        useEslintrc: null,
        maxWarnings: -1,
        outputFile: null,
        ignorePath: null,
        noEslintrc: false,
        noConfigLookup: null,
        rulesdir: [],
        resolvePluginsRelativeTo: null,
        reportUnusedDisableDirectives: null,
        concurrency: null,
      },
      false,
    );
  });

  it('should resolve and instantiate ESLint with useFlatConfig=true if the root config is eslint.config.js', async () => {
    vi.mocked(fs.existsSync).mockImplementation((path) => {
      const pathStr = String(path);
      if (basename(pathStr) === 'eslint.config.js') {
        return true;
      }
      return false;
    });

    await runBuilder(createValidRunBuilderOptions({}));
    expect(mockResolveAndInstantiateESLint).toHaveBeenCalledTimes(1);
    expect(mockResolveAndInstantiateESLint).toHaveBeenCalledWith(
      undefined,
      {
        lintFilePatterns: [],
        eslintConfig: null,
        exclude: ['excludedFile1'],
        fix: true,
        quiet: false,
        cache: true,
        cacheLocation: `cacheLocation1${sep}test-project`,
        cacheStrategy: 'content',
        format: 'stylish',
        force: false,
        silent: false,
        stats: false,
        useEslintrc: null,
        maxWarnings: -1,
        outputFile: null,
        ignorePath: null,
        noEslintrc: false,
        noConfigLookup: null,
        rulesdir: [],
        resolvePluginsRelativeTo: null,
        reportUnusedDisableDirectives: null,
        concurrency: null,
      },
      true, // useFlatConfig
    );
  });

  it('should resolve and instantiate ESLint with useFlatConfig=true if the root config is eslint.config.mjs', async () => {
    vi.mocked(fs.existsSync).mockImplementation((path) => {
      const pathStr = String(path);
      if (basename(pathStr) === 'eslint.config.js') {
        return true;
      }
      return false;
    });

    await runBuilder(createValidRunBuilderOptions({}));
    expect(mockResolveAndInstantiateESLint).toHaveBeenCalledTimes(1);
    expect(mockResolveAndInstantiateESLint).toHaveBeenCalledWith(
      undefined,
      {
        lintFilePatterns: [],
        eslintConfig: null,
        exclude: ['excludedFile1'],
        fix: true,
        quiet: false,
        cache: true,
        cacheLocation: `cacheLocation1${sep}test-project`,
        cacheStrategy: 'content',
        format: 'stylish',
        force: false,
        silent: false,
        stats: false,
        useEslintrc: null,
        maxWarnings: -1,
        outputFile: null,
        ignorePath: null,
        noEslintrc: false,
        noConfigLookup: null,
        rulesdir: [],
        resolvePluginsRelativeTo: null,
        reportUnusedDisableDirectives: null,
        concurrency: null,
      },
      true, // useFlatConfig
    );
  });

  it('should resolve and instantiate ESLint with useFlatConfig=true if the root config is eslint.config.cjs', async () => {
    vi.mocked(fs.existsSync).mockImplementation((path) => {
      const pathStr = String(path);
      if (basename(pathStr) === 'eslint.config.js') {
        return true;
      }
      return false;
    });

    await runBuilder(createValidRunBuilderOptions({}));
    expect(mockResolveAndInstantiateESLint).toHaveBeenCalledTimes(1);
    expect(mockResolveAndInstantiateESLint).toHaveBeenCalledWith(
      undefined,
      {
        lintFilePatterns: [],
        eslintConfig: null,
        exclude: ['excludedFile1'],
        fix: true,
        quiet: false,
        cache: true,
        cacheLocation: `cacheLocation1${sep}test-project`,
        cacheStrategy: 'content',
        format: 'stylish',
        force: false,
        silent: false,
        stats: false,
        useEslintrc: null,
        maxWarnings: -1,
        outputFile: null,
        ignorePath: null,
        noEslintrc: false,
        noConfigLookup: null,
        rulesdir: [],
        resolvePluginsRelativeTo: null,
        reportUnusedDisableDirectives: null,
        concurrency: null,
      },
      true, // useFlatConfig
    );
  });

  it('should fail if no reports generated', async () => {
    mockReports = [];
    const result = await runBuilder(
      createValidRunBuilderOptions({
        lintFilePatterns: ['includedFile1'],
      }),
    );
    expect(result.error).toMatchInlineSnapshot(
      `"Error when running ESLint: Invalid lint configuration. Nothing to lint. Please check your lint target pattern(s)."`,
    );
  });

  it('should create a new instance of the formatter with the selected user option', async () => {
    await runBuilder(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
      }),
    );
    expect(mockLoadFormatter).toHaveBeenCalledWith('json');
    await runBuilder(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'html',
      }),
    );
    expect(mockLoadFormatter).toHaveBeenCalledWith('html');
  });

  it(`should include all the reports in a single call to the formatter's format method`, async () => {
    mockReports = [
      {
        errorCount: 1,
        warningCount: 0,
        results: [],
        messages: [
          {
            line: 0,
            column: 0,
            message: 'Mock error message 1',
            severity: 2,
            ruleId: null,
          },
        ],
        usedDeprecatedRules: [],
      },
      {
        errorCount: 1,
        warningCount: 0,
        results: [],
        messages: [
          {
            line: 1,
            column: 1,
            message: 'Mock error message 2',
            severity: 2,
            ruleId: null,
          },
        ],
        usedDeprecatedRules: [],
      },
    ];
    await runBuilder(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1', 'includedFile2'],
        format: 'checkstyle',
      }),
    );
    expect(mockLoadFormatter).toHaveBeenCalledWith('checkstyle');
    expect(mockFormatter.format).toHaveBeenCalledWith([
      {
        errorCount: 1,
        messages: [
          {
            column: 0,
            line: 0,
            message: 'Mock error message 1',
            ruleId: null,
            severity: 2,
          },
        ],
        results: [],
        usedDeprecatedRules: [],
        warningCount: 0,
      },
      {
        errorCount: 1,
        messages: [
          {
            column: 1,
            line: 1,
            message: 'Mock error message 2',
            ruleId: null,
            severity: 2,
          },
        ],
        results: [],
        usedDeprecatedRules: [],
        warningCount: 0,
      },
    ]);
  });

  it('should pass all the reports to the fix engine, even if --fix is false', async () => {
    await runBuilder(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        fix: false,
      }),
    );
    expect(mockOutputFixes).toHaveBeenCalled();
  });

  describe('bundled results', () => {
    it('should log if there are errors or warnings', async () => {
      mockReports = [
        {
          errorCount: 1,
          warningCount: 4,
          results: [],
          messages: [],
          usedDeprecatedRules: [],
        },
        {
          errorCount: 3,
          warningCount: 6,
          results: [],
          messages: [],
          usedDeprecatedRules: [],
        },
      ];
      await runBuilder(
        createValidRunBuilderOptions({
          eslintConfig: './.eslintrc',
          lintFilePatterns: ['includedFile1'],
          format: 'json',
          silent: false,
        }),
      );
      expect(console.error).toHaveBeenCalledWith(
        'Lint errors found in the listed files.\n',
      );
      expect(console.warn).toHaveBeenCalledWith(
        'Lint warnings found in the listed files.\n',
      );
    });
    it('should log if there are no warnings or errors', async () => {
      mockReports = [
        {
          errorCount: 0,
          warningCount: 0,
          results: [],
          messages: [],
          usedDeprecatedRules: [],
        },
        {
          errorCount: 0,
          warningCount: 0,
          results: [],
          messages: [],
          usedDeprecatedRules: [],
        },
      ];
      await runBuilder(
        createValidRunBuilderOptions({
          eslintConfig: './.eslintrc',
          lintFilePatterns: ['includedFile1'],
          format: 'json',
          silent: false,
        }),
      );
      expect(console.error).not.toHaveBeenCalledWith(
        'Lint errors found in the listed files.\n',
      );
      expect(console.warn).not.toHaveBeenCalledWith(
        'Lint warnings found in the listed files.\n',
      );
      expect(console.info).toHaveBeenCalledWith('All files pass linting.\n');
    });
    it('should not log if the silent flag was passed', async () => {
      mockReports = [
        {
          errorCount: 1,
          warningCount: 4,
          results: [],
          messages: [],
          usedDeprecatedRules: [],
        },
        {
          errorCount: 3,
          warningCount: 6,
          results: [],
          messages: [],
          usedDeprecatedRules: [],
        },
      ];
      await runBuilder(
        createValidRunBuilderOptions({
          eslintConfig: './.eslintrc',
          lintFilePatterns: ['includedFile1'],
          format: 'json',
          maxWarnings: 1,
          silent: true,
        }),
      );
      expect(console.error).not.toHaveBeenCalledWith(
        'Lint errors found in the listed files.\n',
      );
      expect(console.warn).not.toHaveBeenCalledWith(
        'Lint warnings found in the listed files.\n',
      );
    });
    it('should not log warnings if the quiet flag was passed', async () => {
      mockReports = [
        {
          errorCount: 0,
          warningCount: 4,
          results: [],
          messages: [
            {
              line: 0,
              column: 0,
              message: 'Mock warning message',
              severity: 1,
              ruleId: null,
            },
          ],
          usedDeprecatedRules: [],
        },
        {
          errorCount: 0,
          warningCount: 6,
          results: [],
          messages: [],
          usedDeprecatedRules: [],
        },
      ];
      await runBuilder(
        createValidRunBuilderOptions({
          eslintConfig: './.eslintrc',
          lintFilePatterns: ['includedFile1'],
          format: 'json',
          quiet: true,
          silent: false,
        }),
      );
      expect(console.info).not.toHaveBeenCalledWith('Mock warning message\n');
      expect(console.error).not.toHaveBeenCalledWith(
        'Lint errors found in the listed files.\n',
      );
      expect(console.warn).not.toHaveBeenCalledWith(
        'Lint warnings found in the listed files.\n',
      );
      expect(console.info).toHaveBeenCalledWith('All files pass linting.\n');
    });
  });

  it('should be a success if there are no errors', async () => {
    mockReports = [
      {
        errorCount: 0,
        warningCount: 4,
        results: [],
        messages: [],
        usedDeprecatedRules: [],
      },
      {
        errorCount: 0,
        warningCount: 6,
        results: [],
        messages: [],
        usedDeprecatedRules: [],
      },
    ];
    const output = await runBuilder(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        silent: true,
      }),
    );
    expect(output.success).toBeTruthy();
  });

  it('should be a success if there are errors but the force flag is true', async () => {
    mockReports = [
      {
        errorCount: 2,
        warningCount: 4,
        results: [],
        messages: [],
        usedDeprecatedRules: [],
      },
      {
        errorCount: 3,
        warningCount: 6,
        results: [],
        messages: [],
        usedDeprecatedRules: [],
      },
    ];
    const output = await runBuilder(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        silent: true,
        force: true,
      }),
    );
    expect(output.success).toBeTruthy();
  });

  it('should be a failure if there are errors and the force flag is false', async () => {
    mockReports = [
      {
        errorCount: 2,
        warningCount: 4,
        results: [],
        messages: [],
        usedDeprecatedRules: [],
      },
      {
        errorCount: 3,
        warningCount: 6,
        results: [],
        messages: [],
        usedDeprecatedRules: [],
      },
    ];
    const output = await runBuilder(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        silent: true,
        force: false,
      }),
    );
    expect(output.success).toBeFalsy();
  });

  it('should be a failure if the amount of warnings exceeds the maxWarnings option', async () => {
    mockReports = [
      {
        errorCount: 0,
        warningCount: 4,
        results: [],
        messages: [],
        usedDeprecatedRules: [],
      },
      {
        errorCount: 0,
        warningCount: 6,
        results: [],
        messages: [],
        usedDeprecatedRules: [],
      },
    ];
    const output = await runBuilder(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        maxWarnings: 5,
      }),
    );
    expect(output.success).toBeFalsy();
  });

  it('should log too many warnings even if quiet flag was passed', async () => {
    mockReports = [
      {
        errorCount: 0,
        warningCount: 1,
        results: [],
        messages: [],
        usedDeprecatedRules: [],
      },
    ];
    await runBuilder(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        quiet: true,
        maxWarnings: 0,
      }),
    );
    expect(console.error).toHaveBeenCalledWith(
      'Found 1 warnings, which exceeds your configured limit (0). Either increase your maxWarnings limit or fix some of the lint warnings.',
    );
  });

  it('should attempt to write the lint results to the output file, if specified', async () => {
    mockReports = [
      {
        errorCount: 2,
        warningCount: 4,
        results: [],
        messages: [],
        usedDeprecatedRules: [],
      },
      {
        errorCount: 3,
        warningCount: 6,
        results: [],
        messages: [],
        usedDeprecatedRules: [],
      },
    ];
    await runBuilder(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc.json',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        silent: true,
        force: false,
        outputFile: 'a/b/c/outputFile1',
      }),
    );
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      join(testWorkspaceRoot, 'a/b/c'),
      {
        recursive: true,
      },
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      join(testWorkspaceRoot, 'a/b/c/outputFile1'),
      mockFormatter.format(mockReports),
    );
  });

  it('should interpolate {projectName} placeholder in outputFile path', async () => {
    mockReports = [
      {
        errorCount: 0,
        warningCount: 0,
        results: [],
        messages: [],
        usedDeprecatedRules: [],
      },
    ];
    await runBuilder(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc.json',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        silent: true,
        outputFile: 'reports/{projectName}.json',
      }),
    );
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      join(testWorkspaceRoot, 'reports'),
      {
        recursive: true,
      },
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      join(testWorkspaceRoot, 'reports/test-project.json'),
      mockFormatter.format(mockReports),
    );
  });

  it('should interpolate {projectRoot} placeholder in outputFile path', async () => {
    mockReports = [
      {
        errorCount: 0,
        warningCount: 0,
        results: [],
        messages: [],
        usedDeprecatedRules: [],
      },
    ];
    await runBuilder(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc.json',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        silent: true,
        outputFile: '{projectRoot}/lint-results.json',
      }),
    );
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      join(testWorkspaceRoot, 'packages/test-project'),
      {
        recursive: true,
      },
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      join(testWorkspaceRoot, 'packages/test-project/lint-results.json'),
      mockFormatter.format(mockReports),
    );
  });

  it('should interpolate both {projectName} and {projectRoot} placeholders in outputFile path', async () => {
    mockReports = [
      {
        errorCount: 0,
        warningCount: 0,
        results: [],
        messages: [],
        usedDeprecatedRules: [],
      },
    ];
    await runBuilder(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc.json',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        silent: true,
        outputFile: '{projectRoot}/reports/{projectName}/results.json',
      }),
    );
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      join(testWorkspaceRoot, 'packages/test-project/reports/test-project'),
      {
        recursive: true,
      },
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      join(
        testWorkspaceRoot,
        'packages/test-project/reports/test-project/results.json',
      ),
      mockFormatter.format(mockReports),
    );
  });

  it('should handle multiple occurrences of {projectName} placeholder', async () => {
    mockReports = [
      {
        errorCount: 0,
        warningCount: 0,
        results: [],
        messages: [],
        usedDeprecatedRules: [],
      },
    ];
    await runBuilder(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc.json',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        silent: true,
        outputFile: '{projectName}/reports/{projectName}.json',
      }),
    );
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      join(testWorkspaceRoot, 'test-project/reports'),
      {
        recursive: true,
      },
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      join(testWorkspaceRoot, 'test-project/reports/test-project.json'),
      mockFormatter.format(mockReports),
    );
  });

  it('should pass stats option to resolveAndInstantiateESLint', async () => {
    vi.mocked(fs.existsSync).mockImplementation((path) => {
      const pathStr = String(path);
      if (basename(pathStr) === 'eslint.config.js') {
        return true;
      }
      return false;
    });

    await runBuilder(
      createValidRunBuilderOptions({
        stats: true,
      }),
    );

    expect(mockResolveAndInstantiateESLint).toHaveBeenCalledTimes(1);
    expect(mockResolveAndInstantiateESLint).toHaveBeenCalledWith(
      undefined,
      {
        stats: true, // stats pass through correctly
        lintFilePatterns: [],
        eslintConfig: null,
        exclude: ['excludedFile1'],
        fix: true,
        quiet: false,
        cache: true,
        cacheLocation: `cacheLocation1${sep}test-project`,
        cacheStrategy: 'content',
        format: 'stylish',
        force: false,
        silent: false,
        useEslintrc: null,
        maxWarnings: -1,
        outputFile: null,
        ignorePath: null,
        noEslintrc: false,
        noConfigLookup: null,
        rulesdir: [],
        resolvePluginsRelativeTo: null,
        reportUnusedDisableDirectives: null,
        concurrency: null,
      },
      true, // useFlatConfig
    );
  });
});
