// Force module scoping
export default {};

jest.mock('eslint', () => ({
  ESLint: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ESLint } = require('eslint');
(<jest.SpyInstance>ESLint).mockImplementation(() => ({
  lintFiles: (args: string[]) => args,
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { lint } = require('./eslint-utils');

describe('eslint-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create the ESLint instance with the proper parameters', async () => {
    await lint('./.eslintrc.json', {
      fix: true,
      cache: true,
      cacheLocation: '/root/cache',
      cacheStrategy: 'content',
      // eslint-disable-next-line @typescript-eslint/no-empty-function
    }).catch(() => {});

    expect(ESLint).toHaveBeenCalledWith({
      overrideConfigFile: './.eslintrc.json',
      fix: true,
      cache: true,
      cacheLocation: '/root/cache',
      cacheStrategy: 'content',
      ignorePath: undefined,
      useEslintrc: true,
      errorOnUnmatchedPattern: false,
      rulePaths: [],
    });
  });

  it('should create the ESLint instance with the proper parameters', async () => {
    await lint(undefined, {
      fix: true,
      cache: true,
      cacheLocation: '/root/cache',
      cacheStrategy: 'content',
      // eslint-disable-next-line @typescript-eslint/no-empty-function
    }).catch(() => {});

    expect(ESLint).toHaveBeenCalledWith({
      overrideConfigFile: undefined,
      fix: true,
      cache: true,
      cacheLocation: '/root/cache',
      cacheStrategy: 'content',
      ignorePath: undefined,
      useEslintrc: true,
      errorOnUnmatchedPattern: false,
      rulePaths: [],
    });
  });

  describe('noEslintrc', () => {
    it('should create the ESLint instance with "useEslintrc" set to false', async () => {
      await lint(undefined, {
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        noEslintrc: true,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
      }).catch(() => {});

      expect(ESLint).toHaveBeenCalledWith({
        overrideConfigFile: undefined,
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        ignorePath: undefined,
        useEslintrc: false,
        errorOnUnmatchedPattern: false,
        rulePaths: [],
      });
    });
  });

  describe('rulesdir', () => {
    it('should create the ESLint instance with "rulePaths" set to the given value for rulesdir', async () => {
      const extraRuleDirectories = ['./some-rules', '../some-more-rules'];
      await lint(undefined, {
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        cacheStrategy: 'content',
        rulesdir: extraRuleDirectories,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
      }).catch(() => {});

      expect(ESLint).toHaveBeenCalledWith({
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        cacheStrategy: 'content',
        ignorePath: undefined,
        useEslintrc: true,
        errorOnUnmatchedPattern: false,
        rulePaths: extraRuleDirectories,
      });
    });
  });

  describe('resolvePluginsRelativeTo', () => {
    it('should create the ESLint instance with "resolvePluginsRelativeTo" set to the given value for resolvePluginsRelativeTo', async () => {
      await lint(undefined, {
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        cacheStrategy: 'content',
        resolvePluginsRelativeTo: './some-path',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
      }).catch(() => {});

      expect(ESLint).toHaveBeenCalledWith({
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        cacheStrategy: 'content',
        ignorePath: undefined,
        useEslintrc: true,
        errorOnUnmatchedPattern: false,
        rulePaths: [],
        resolvePluginsRelativeTo: './some-path',
      });
    });
  });

  describe('reportUnusedDisableDirectives', () => {
    it('should create the ESLint instance with "reportUnusedDisableDirectives" set to the given value for reportUnusedDisableDirectives', async () => {
      await lint(undefined, {
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        cacheStrategy: 'content',
        reportUnusedDisableDirectives: 'warn',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
      }).catch(() => {});

      expect(ESLint).toHaveBeenCalledWith({
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        cacheStrategy: 'content',
        ignorePath: undefined,
        useEslintrc: true,
        errorOnUnmatchedPattern: false,
        rulePaths: [],
        reportUnusedDisableDirectives: 'warn',
      });
    });
  });
});
