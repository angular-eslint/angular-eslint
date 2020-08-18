jest.mock('../../src/utils/file-utils', () => ({
  getFilesToLint: jest.fn(),
}));

jest.mock('eslint', () => ({
  ESLint: jest.fn(),
}));

const { ESLint } = require('eslint');
(<jest.SpyInstance>ESLint).mockImplementation(() => ({
  lintFiles: (args: string[]) => args,
}));

const { lint } = require('../../src/utils/eslint-utils');

function prog(sourceFile: string) {
  return {
    getSourceFile: (file: string) => (sourceFile === file ? true : undefined),
  };
}

describe('eslint-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get files for linting with the correct params', async () => {
    const { getFilesToLint } = require('../../src/utils/file-utils');
    const lintedFiles = new Set();
    await lint(
      '/root',
      undefined,
      './.eslintrc',
      <any>{ foo: 'bar' },
      lintedFiles,
      'ts-program',
    ).catch(() => {});
    expect(getFilesToLint).toHaveBeenCalledWith(
      '/root',
      '.',
      { foo: 'bar' },
      'ts-program',
    );
  });

  it('should create the ESLint instance with the proper parameters', async () => {
    const lintedFiles = new Set();
    await lint(
      '/root',
      undefined,
      './.eslintrc',
      <any>{ fix: true, cache: true, cacheLocation: '/root/cache' },
      lintedFiles,
      'ts-program',
    ).catch(() => {});
    expect(ESLint).toHaveBeenCalledWith({
      overrideConfigFile: './.eslintrc',
      fix: true,
      cache: true,
      cacheLocation: '/root/cache',
      ignorePath: undefined,
      useEslintrc: true,
      overrideConfig: {
        parserOptions: {
          project: undefined,
        },
      },
    });
  });

  it('should not lint the same files twice', async () => {
    const { getFilesToLint } = require('../../src/utils/file-utils');
    (<jest.SpyInstance>getFilesToLint).mockReturnValue([
      'file1.ts',
      'file2.ts',
      'file1.ts',
      'file3.ts',
      'file4.ts',
    ]);
    const lintedFiles = new Set();
    lintedFiles.add('file4.ts');
    const reports = await lint(
      '/root',
      undefined,
      './.eslintrc',
      <any>{ foo: 'bar' },
      lintedFiles,
    );
    expect(reports).toEqual(['file1.ts', 'file2.ts', 'file3.ts']);
  });

  it('should throw an error if the file is not part of any program', async () => {
    const { getFilesToLint } = require('../../src/utils/file-utils');
    (<jest.SpyInstance>getFilesToLint).mockReturnValue([
      'file1.ts',
      'file2.ts',
      'file1.ts',
      'file3.ts',
    ]);
    const program = prog('file8.ts');
    const allPrograms = [prog('file1.ts'), prog('file2.ts')];
    const lintedFiles = new Set();
    const lintPromise = lint(
      '/root',
      undefined,
      './.eslintrc',
      <any>{ tsConfig: 'my-ts-project' },
      lintedFiles,
      program,
      allPrograms,
    );
    await expect(lintPromise).rejects.toThrow(
      `File \"file3.ts\" is not part of a TypeScript project 'my-ts-project'.`,
    );
  });

  it('should not throw an error if a file is not part of the current program but part of another', async () => {
    const { getFilesToLint } = require('../../src/utils/file-utils');
    (<jest.SpyInstance>getFilesToLint).mockReturnValue([
      'file1.ts',
      'file2.ts',
      'file1.ts',
      'file3.ts',
    ]);
    const program = prog('file2.ts');
    const allPrograms = [prog('file1.ts'), prog('file2.ts'), prog('file3.ts')];
    const lintedFiles = new Set();
    const lintPromise = lint(
      '/root',
      undefined,
      './.eslintrc',
      <any>{ tsConfig: 'my-ts-project' },
      lintedFiles,
      program,
      allPrograms,
    );
    await expect(lintPromise).resolves.toEqual(['file2.ts']);
  });
});
