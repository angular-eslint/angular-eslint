import { Architect } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { json, logging, schema } from '@angular-devkit/core';
import type { ESLint } from 'eslint';
import { resolve } from 'path';
import type { Schema } from './schema';

// If we use esm here we get `TypeError: Cannot redefine property: writeFileSync`
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
jest.spyOn(fs, 'writeFileSync').mockImplementation();
jest.spyOn(fs, 'mkdirSync').mockImplementation();
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.spyOn(process, 'chdir').mockImplementation(() => {});

const mockFormatter = {
  format: jest
    .fn()
    .mockImplementation((results: ESLint.LintResult[]): string =>
      results
        .map(({ messages }) =>
          messages.map(({ message }) => message).join('\n'),
        )
        .join('\n'),
    ),
};
const mockLoadFormatter = jest.fn().mockReturnValue(mockFormatter);
const mockOutputFixes = jest.fn();

const VALID_ESLINT_VERSION = '7.6';

let mockReports: unknown[] = [
  { results: [], messages: [], usedDeprecatedRules: [] },
];

class MockESLint {
  static version = VALID_ESLINT_VERSION;
  static outputFixes = mockOutputFixes;
  loadFormatter = mockLoadFormatter;
  isPathIgnored = jest.fn().mockReturnValue(false);
  lintFiles = jest.fn().mockImplementation(() => mockReports);
}

const mockResolveAndInstantiateESLint = jest.fn().mockReturnValue(
  Promise.resolve({
    ESLint: MockESLint,
    eslint: new MockESLint(),
  }),
);

jest.mock('./utils/eslint-utils', () => {
  return {
    resolveAndInstantiateESLint: mockResolveAndInstantiateESLint,
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
    noEslintrc: false,
    rulesdir: [],
    resolvePluginsRelativeTo: null,
    reportUnusedDisableDirectives: null,
    ...additionalOptions,
  };
}

const loggerSpy = jest.fn();

async function runBuilder(options: Schema) {
  const registry = new json.schema.CoreSchemaRegistry();
  registry.addPostTransform(schema.transforms.addUndefinedDefaults);

  const testArchitectHost = new TestingArchitectHost(
    resolve('/root'),
    resolve('/root'),
  );
  const builderName = '@angular-eslint/builder:lint';

  /**
   * Require in the implementation from src so that we don't need
   * to run a build before tests run and it is dynamic enough
   * to come after jest does its mocking
   */
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { default: builderImplementation } = require('./lint.impl');
  testArchitectHost.addBuilder(builderName, builderImplementation);

  const architect = new Architect(testArchitectHost, registry);
  const logger = new logging.Logger('');
  logger.subscribe(loggerSpy);

  const run = await architect.scheduleBuilder(builderName, options, {
    logger,
  });

  return run.result;
}

xdescribe('Linter Builder', () => {
  beforeEach(() => {
    MockESLint.version = VALID_ESLINT_VERSION;
    mockReports = [{ results: [], messages: [], usedDeprecatedRules: [] }];
    console.warn = jest.fn();
    console.error = jest.fn();
    console.info = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should throw if the eslint version is not supported', async () => {
    MockESLint.version = '1.6';
    const result = runBuilder(createValidRunBuilderOptions());
    await expect(result).rejects.toThrow(
      /ESLint must be version 7.6 or higher/,
    );
  });

  it('should not throw if the eslint version is supported', async () => {
    const result = runBuilder(createValidRunBuilderOptions());
    await expect(result).resolves.not.toThrow();
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
        maxWarnings: -1,
        outputFile: null,
        ignorePath: null,
        noEslintrc: false,
        rulesdir: [],
        resolvePluginsRelativeTo: null,
      }),
    );
    expect(mockResolveAndInstantiateESLint).toHaveBeenCalledTimes(1);
    expect(mockResolveAndInstantiateESLint).toHaveBeenCalledWith(
      resolve('/root/.eslintrc'),
      {
        lintFilePatterns: [],
        eslintConfig: './.eslintrc',
        exclude: ['excludedFile1'],
        fix: true,
        quiet: false,
        cache: true,
        cacheLocation: 'cacheLocation1/<???>',
        cacheStrategy: 'content',
        format: 'stylish',
        force: false,
        silent: false,
        maxWarnings: -1,
        outputFile: null,
        ignorePath: null,
        noEslintrc: false,
        rulesdir: [],
        resolvePluginsRelativeTo: null,
        reportUnusedDisableDirectives: null,
      },
      false,
    );
  });

  it('should resolve and instantiate ESLint with useFlatConfig=true if the root config is eslint.config.js', async () => {
    jest.spyOn(fs, 'existsSync').mockImplementation((path: any) => {
      if (path.endsWith('/eslint.config.js')) {
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
        cacheLocation: 'cacheLocation1/<???>',
        cacheStrategy: 'content',
        format: 'stylish',
        force: false,
        silent: false,
        maxWarnings: -1,
        outputFile: null,
        ignorePath: null,
        noEslintrc: false,
        rulesdir: [],
        resolvePluginsRelativeTo: null,
        reportUnusedDisableDirectives: null,
      },
      true, // useFlatConfig
    );
  });

  it('should throw if no reports generated', async () => {
    mockReports = [];
    await expect(
      runBuilder(
        createValidRunBuilderOptions({
          lintFilePatterns: ['includedFile1'],
        }),
      ),
    ).rejects.toThrow(/Invalid lint configuration. Nothing to lint./);
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

  it('should be a failure if the the amount of warnings exceeds the maxWarnings option', async () => {
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
    expect(fs.mkdirSync).toHaveBeenCalledWith('/root/a/b/c', {
      recursive: true,
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '/root/a/b/c/outputFile1',
      mockFormatter.format(mockReports),
    );
  });
});
