jest.mock('glob', () => ({
  sync: jest.fn().mockImplementation((fileOrPattern) => {
    // Prevent the './**/*.component.html' pattern from being returned in tests
    if (fileOrPattern === './**/*.component.html') {
      return [];
    }
    return fileOrPattern;
  }),
}));

jest.mock('path', () => ({
  join: (...paths: string[]) => paths.join('/'),
  normalize: (path: string) => path,
  relative: (...paths: string[]) => paths[1],
}));

const { sync } = require('glob');
const { getFilesToLint } = require('../../src/utils/file-utils');

describe('file-utils', () => {
  /**
   * The piece about `always including any ".component.html" files` is not necessarily
   * desirable, but it is the current behavior, so making that explicit here...
   */
  it('should return a list of applicable files, based on given patterns, always including any ".component.html" files', () => {
    const files = ['file1', 'file2', 'foo.component.html'];
    const exclude = ['file2'];
    const toLint = getFilesToLint('/root', '.', { files, exclude });

    expect(toLint).toEqual([
      '/root/file1',
      '/root/file2',
      '/root/foo.component.html',
    ]);
  });

  it('should return a list of applicable files, based on a given ts.Program', () => {
    const sourceFiles = [
      { fileName: 'foo.ts', isFromExternalLib: false },
      { fileName: 'foo.d.ts', isFromExternalLib: false },
      { fileName: 'foo.json', isFromExternalLib: false },
      { fileName: 'bar.ts', isFromExternalLib: true },
      { fileName: 'bar.ts', isFromExternalLib: false },
    ];
    const program = {
      getSourceFiles: () => sourceFiles,
      isSourceFileFromExternalLibrary: (file: { isFromExternalLib: boolean }) =>
        file.isFromExternalLib,
    };
    const toLint = getFilesToLint('/root', '.', {}, program);
    expect(toLint).toEqual(['foo.ts', 'bar.ts']);
  });

  it('should return an empty array if neither file patterns nor a ts.Program are given', () => {
    const toLint = getFilesToLint('/root', '.', { files: [] });
    expect(toLint).toEqual([]);
  });

  it('should support excluding files based on given patterns', () => {
    const sourceFiles = [
      { fileName: 'foo.ts' },
      { fileName: 'bar.spec.ts' },
      { fileName: 'bar.ts' },
    ];
    const exclude = ['*.spec.ts'];
    const program = {
      getSourceFiles: () => sourceFiles,
      isSourceFileFromExternalLibrary: () => false,
    };
    const toLint = getFilesToLint('/root', '.', { exclude }, program);
    expect(toLint).toEqual(['foo.ts', 'bar.ts']);
  });
});
