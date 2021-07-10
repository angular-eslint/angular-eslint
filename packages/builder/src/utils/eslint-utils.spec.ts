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
    await lint('/root', './.eslintrc.json', {
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
    });
  });

  it('should create the ESLint instance with the proper parameters', async () => {
    await lint('/root', undefined, {
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
    });
  });
});
