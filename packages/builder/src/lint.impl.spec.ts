import type { ExecutorContext } from '@nrwl/devkit';
import type { ESLint } from 'eslint';
import { resolve } from 'path';
import type { Schema } from './schema';

// If we use esm here we get `TypeError: Cannot redefine property: writeFileSync`
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
jest.spyOn(fs, 'writeFileSync').mockImplementation();

const mockCreateDirectory = jest.fn();
jest.mock('./utils/create-directory', () => ({
  createDirectory: mockCreateDirectory,
}));

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

class MockESLint {
  static version = VALID_ESLINT_VERSION;
  static outputFixes = mockOutputFixes;
  loadFormatter = mockLoadFormatter;
}

let mockReports: unknown[] = [
  { results: [], messages: [], usedDeprecatedRules: [] },
];
const mockLint = jest.fn().mockImplementation(() => mockReports);
jest.mock('./utils/eslint-utils', () => {
  return {
    lint: mockLint,
    loadESLint: jest.fn().mockReturnValue(
      Promise.resolve({
        ESLint: MockESLint,
      }),
    ),
  };
});
import lintExecutor from './lint.impl';

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
    ...additionalOptions,
  };
}

function setupMocks() {
  jest.resetModules();
  jest.clearAllMocks();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  jest.spyOn(process, 'chdir').mockImplementation(() => {});
  console.warn = jest.fn();
  console.error = jest.fn();
  console.info = jest.fn();
}

describe('Linter Builder', () => {
  let mockContext: ExecutorContext;

  beforeEach(() => {
    MockESLint.version = VALID_ESLINT_VERSION;
    mockReports = [{ results: [], messages: [], usedDeprecatedRules: [] }];
    const projectName = 'proj';
    mockContext = {
      projectName,
      root: '/root',
      cwd: '/root',
      workspace: {
        npmScope: '',
        version: 2,
        projects: {
          [projectName]: {
            root: `apps/${projectName}`,
            sourceRoot: `apps/${projectName}/src`,
            targets: {},
          },
        },
      },
      isVerbose: false,
    };
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should throw if the eslint version is not supported', async () => {
    MockESLint.version = '1.6';
    setupMocks();
    const result = lintExecutor(createValidRunBuilderOptions(), mockContext);
    await expect(result).rejects.toThrow(
      /ESLint must be version 7.6 or higher/,
    );
  });

  it('should not throw if the eslint version is supported', async () => {
    setupMocks();
    const result = lintExecutor(createValidRunBuilderOptions(), mockContext);
    await expect(result).resolves.not.toThrow();
  });

  it('should invoke the linter with the options that were passed to the builder', async () => {
    setupMocks();
    await lintExecutor(
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
      mockContext,
    );
    expect(mockLint).toHaveBeenCalledWith(
      resolve('/root'),
      resolve('/root/.eslintrc'),
      {
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
      },
    );
  });

  it('should throw if no reports generated', async () => {
    mockReports = [];
    setupMocks();
    const result = lintExecutor(
      createValidRunBuilderOptions({
        lintFilePatterns: ['includedFile1'],
      }),
      mockContext,
    );
    await expect(result).rejects.toThrow(
      /Invalid lint configuration. Nothing to lint./,
    );
  });

  it('should create a new instance of the formatter with the selected user option', async () => {
    setupMocks();
    await lintExecutor(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
      }),
      mockContext,
    );
    expect(mockLoadFormatter).toHaveBeenCalledWith('json');
    await lintExecutor(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'html',
      }),
      mockContext,
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
    setupMocks();
    await lintExecutor(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1', 'includedFile2'],
        format: 'checkstyle',
      }),
      mockContext,
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
    setupMocks();
    await lintExecutor(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        fix: false,
      }),
      mockContext,
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
      setupMocks();
      await lintExecutor(
        createValidRunBuilderOptions({
          eslintConfig: './.eslintrc',
          lintFilePatterns: ['includedFile1'],
          format: 'json',
          silent: false,
        }),
        mockContext,
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
      setupMocks();
      await lintExecutor(
        createValidRunBuilderOptions({
          eslintConfig: './.eslintrc',
          lintFilePatterns: ['includedFile1'],
          format: 'json',
          silent: false,
        }),
        mockContext,
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
      setupMocks();
      await lintExecutor(
        createValidRunBuilderOptions({
          eslintConfig: './.eslintrc',
          lintFilePatterns: ['includedFile1'],
          format: 'json',
          maxWarnings: 1,
          silent: true,
        }),
        mockContext,
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
      setupMocks();
      await lintExecutor(
        createValidRunBuilderOptions({
          eslintConfig: './.eslintrc',
          lintFilePatterns: ['includedFile1'],
          format: 'json',
          quiet: true,
          silent: false,
        }),
        mockContext,
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
    setupMocks();
    const output = await lintExecutor(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        silent: true,
      }),
      mockContext,
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
    setupMocks();
    const output = await lintExecutor(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        silent: true,
        force: true,
      }),
      mockContext,
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
    setupMocks();
    const output = await lintExecutor(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        silent: true,
        force: false,
      }),
      mockContext,
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
    setupMocks();
    const output = await lintExecutor(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        maxWarnings: 5,
      }),
      mockContext,
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
    setupMocks();
    await lintExecutor(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        quiet: true,
        maxWarnings: 0,
      }),
      mockContext,
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
    setupMocks();
    await lintExecutor(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc.json',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        silent: true,
        force: false,
        outputFile: 'a/b/c/outputFile1',
      }),
      mockContext,
    );
    expect(mockCreateDirectory).toHaveBeenCalledWith('/root/a/b/c');
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '/root/a/b/c/outputFile1',
      mockFormatter.format(mockReports),
    );
  });

  it('should not attempt to write the lint results to the output file, if not specified', async () => {
    setupMocks();
    jest.spyOn(fs, 'writeFileSync').mockImplementation();
    await lintExecutor(
      createValidRunBuilderOptions({
        eslintConfig: './.eslintrc.json',
        lintFilePatterns: ['includedFile1'],
        format: 'json',
        silent: true,
        force: false,
      }),
      mockContext,
    );
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
