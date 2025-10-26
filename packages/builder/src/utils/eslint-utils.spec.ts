import { vi, describe, it, expect, beforeEach } from 'vitest';

const MockESLint = vi.fn(class MockESLint {});
const MockFlatESLint = vi.fn(class MockFlatESLint {});

vi.mock('eslint', () => ({
  ESLint: MockESLint,
  loadESLint: vi.fn().mockReturnValue(Promise.resolve(MockESLint)),
}));

vi.mock('eslint/use-at-your-own-risk', () => ({
  FlatESLint: MockFlatESLint,
}));

import { resolveAndInstantiateESLint } from './eslint-utils';

describe('eslint-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create the ESLint instance with the proper parameters t', async () => {
    await resolveAndInstantiateESLint('./.eslintrc.json', {
      fix: true,
      cache: true,
      cacheLocation: '/root/cache',
      cacheStrategy: 'content',
    } as any);

    expect(MockESLint).toHaveBeenCalledWith({
      overrideConfigFile: './.eslintrc.json',
      fix: true,
      cache: true,
      cacheLocation: '/root/cache',
      cacheStrategy: 'content',
      ignorePath: undefined,
      useEslintrc: true,
      errorOnUnmatchedPattern: false,
      rulePaths: [],
      reportUnusedDisableDirectives: undefined,
      resolvePluginsRelativeTo: undefined,
    });
  });

  it('should create the ESLint instance with the proper parameters', async () => {
    await resolveAndInstantiateESLint(undefined, {
      fix: true,
      cache: true,
      cacheLocation: '/root/cache',
      cacheStrategy: 'content',
    } as any);

    expect(MockESLint).toHaveBeenCalledWith({
      overrideConfigFile: undefined,
      fix: true,
      cache: true,
      cacheLocation: '/root/cache',
      cacheStrategy: 'content',
      ignorePath: undefined,
      useEslintrc: true,
      errorOnUnmatchedPattern: false,
      rulePaths: [],
      reportUnusedDisableDirectives: undefined,
      resolvePluginsRelativeTo: undefined,
    });
  });

  describe('noEslintrc', () => {
    it('should create the ESLint instance with "useEslintrc" set to false', async () => {
      await resolveAndInstantiateESLint(undefined, {
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        noEslintrc: true,
      } as any);

      expect(MockESLint).toHaveBeenCalledWith({
        overrideConfigFile: undefined,
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        cacheStrategy: undefined,
        ignorePath: undefined,
        useEslintrc: false,
        errorOnUnmatchedPattern: false,
        rulePaths: [],
        reportUnusedDisableDirectives: undefined,
        resolvePluginsRelativeTo: undefined,
      });
    });
  });

  describe('rulesdir', () => {
    it('should create the ESLint instance with "rulePaths" set to the given value for rulesdir', async () => {
      const extraRuleDirectories = ['./some-rules', '../some-more-rules'];
      await resolveAndInstantiateESLint(undefined, {
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        cacheStrategy: 'content',
        rulesdir: extraRuleDirectories,
      } as any);

      expect(MockESLint).toHaveBeenCalledWith({
        overrideConfigFile: undefined,
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        cacheStrategy: 'content',
        ignorePath: undefined,
        useEslintrc: true,
        errorOnUnmatchedPattern: false,
        rulePaths: extraRuleDirectories,
        reportUnusedDisableDirectives: undefined,
        resolvePluginsRelativeTo: undefined,
      });
    });
  });

  describe('resolvePluginsRelativeTo', () => {
    it('should create the ESLint instance with "resolvePluginsRelativeTo" set to the given value for resolvePluginsRelativeTo', async () => {
      await resolveAndInstantiateESLint(undefined, {
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        cacheStrategy: 'content',
        resolvePluginsRelativeTo: './some-path',
      } as any);

      expect(MockESLint).toHaveBeenCalledWith({
        overrideConfigFile: undefined,
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        cacheStrategy: 'content',
        ignorePath: undefined,
        useEslintrc: true,
        errorOnUnmatchedPattern: false,
        rulePaths: [],
        reportUnusedDisableDirectives: undefined,
        resolvePluginsRelativeTo: './some-path',
      });
    });
  });

  describe('reportUnusedDisableDirectives', () => {
    it('should create the ESLint instance with "reportUnusedDisableDirectives" set to the given value for reportUnusedDisableDirectives', async () => {
      await resolveAndInstantiateESLint(undefined, {
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        cacheStrategy: 'content',
        reportUnusedDisableDirectives: 'warn',
      } as any);

      expect(MockESLint).toHaveBeenCalledWith({
        overrideConfigFile: undefined,
        fix: true,
        cache: true,
        cacheLocation: '/root/cache',
        cacheStrategy: 'content',
        ignorePath: undefined,
        useEslintrc: true,
        errorOnUnmatchedPattern: false,
        rulePaths: [],
        reportUnusedDisableDirectives: 'warn',
        resolvePluginsRelativeTo: undefined,
      });
    });
  });

  describe('ESLint Flat Config', () => {
    it('should not throw if an eslint.config.js file is used with ESLint Flat Config', async () => {
      await expect(
        resolveAndInstantiateESLint('./eslint.config.js', {} as any, true),
      ).resolves.not.toThrow();
    });

    it('should not throw if an eslint.config.mjs file is used with ESLint Flat Config', async () => {
      await expect(
        resolveAndInstantiateESLint('./eslint.config.mjs', {} as any, true),
      ).resolves.not.toThrow();
    });

    it('should not throw if an eslint.config.cjs file is used with ESLint Flat Config', async () => {
      await expect(
        resolveAndInstantiateESLint('./eslint.config.cjs', {} as any, true),
      ).resolves.not.toThrow();
    });

    it('should not throw if an eslint.config.ts file is used with ESLint Flat Config', async () => {
      await expect(
        resolveAndInstantiateESLint('./eslint.config.ts', {} as any, true),
      ).resolves.not.toThrow();
    });

    it('should not throw if an eslint.config.mts file is used with ESLint Flat Config', async () => {
      await expect(
        resolveAndInstantiateESLint('./eslint.config.mts', {} as any, true),
      ).resolves.not.toThrow();
    });

    it('should not throw if an eslint.config.cts file is used with ESLint Flat Config', async () => {
      await expect(
        resolveAndInstantiateESLint('./eslint.config.cts', {} as any, true),
      ).resolves.not.toThrow();
    });

    it('should throw if an eslintrc file is used with ESLint Flat Config', async () => {
      await expect(
        resolveAndInstantiateESLint('./.eslintrc.json', {} as any, true),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: When using the new Flat Config with ESLint, all configs must be named eslint.config.js or eslint.config.mjs or eslint.config.cjs or eslint.config.ts or eslint.config.mts or eslint.config.cts, and .eslintrc files may not be used. See https://eslint.org/docs/latest/use/configure/configuration-files]`,
      );
    });

    it('should throw if invalid options are used with ESLint Flat Config', async () => {
      await expect(
        resolveAndInstantiateESLint(
          undefined,
          {
            useEslintrc: false,
          } as any,
          true,
        ),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: For Flat Config, the \`useEslintrc\` option is not applicable. See https://eslint.org/docs/latest/use/configure/configuration-files-new]`,
      );

      await expect(
        resolveAndInstantiateESLint(
          undefined,
          {
            resolvePluginsRelativeTo: './some-path',
          } as any,
          true,
        ),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: For Flat Config, ESLint removed \`resolvePluginsRelativeTo\` and so it is not supported as an option. See https://eslint.org/docs/latest/use/configure/configuration-files-new]`,
      );

      await expect(
        resolveAndInstantiateESLint(
          undefined,
          {
            ignorePath: './some-path',
          } as any,
          true,
        ),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: For Flat Config, ESLint removed \`ignorePath\` and so it is not supported as an option. See https://eslint.org/docs/latest/use/configure/configuration-files-new]`,
      );
    });
  });

  describe('stats option', () => {
    it('should create the ESLint instance with "stats" set to true when using flat config', async () => {
      // Force eslint/use-at-your-own-risk to be used
      vi.mock('eslint', () => ({
        ESLint: MockESLint,
        loadESLint: undefined,
      }));

      await resolveAndInstantiateESLint(
        './eslint.config.js',
        {
          stats: true,
        } as any,
        true,
      );
      expect(MockFlatESLint).toHaveBeenCalledWith({
        cache: false,
        cacheLocation: undefined,
        cacheStrategy: undefined,
        errorOnUnmatchedPattern: false,
        fix: false,
        overrideConfigFile: './eslint.config.js',
        stats: true,
      });
    });

    it('should throw when "stats" is used with eslintrc config', async () => {
      await expect(
        resolveAndInstantiateESLint(
          './.eslintrc.json',
          { stats: true } as any,
          false,
        ),
      ).rejects.toThrow('The --stats option requires ESLint Flat Config');
    });
  });

  describe('concurrency option', () => {
    it('should create the ESLint instance with "concurrency" set to off when option is off', async () => {
      await resolveAndInstantiateESLint('./eslint.config.js', {
        concurrency: 'off',
      } as any);
      expect(MockESLint).toHaveBeenCalledWith(
        expect.objectContaining({
          concurrency: 'off',
        }),
      );
    });

    it('should create the ESLint instance with "concurrency" set to auto when option is auto', async () => {
      await resolveAndInstantiateESLint('./eslint.config.js', {
        concurrency: 'auto',
      } as any);
      expect(MockESLint).toHaveBeenCalledWith(
        expect.objectContaining({
          concurrency: 'auto',
        }),
      );
    });

    it('should create the ESLint instance with "concurrency" set to number when option is positive number', async () => {
      await resolveAndInstantiateESLint('./eslint.config.js', {
        concurrency: 1,
      } as any);
      expect(MockESLint).toHaveBeenCalledWith(
        expect.objectContaining({
          concurrency: 1,
        }),
      );
    });

    it('should reject invalid "concurrency" option', async () => {
      await expect(
        resolveAndInstantiateESLint('./eslint.config.js', {
          concurrency: 'what?',
        } as any),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: The --concurrency option must be auto, off or a positive integer]`,
      );
    });

    it('should reject negative number for "concurrency" option', async () => {
      await expect(
        resolveAndInstantiateESLint('./eslint.config.js', {
          concurrency: -1,
        } as any),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: The --concurrency option must be auto, off or a positive integer]`,
      );
    });

    it('should reject 0 for "concurrency" option', async () => {
      await expect(
        resolveAndInstantiateESLint('./eslint.config.js', {
          concurrency: 0,
        } as any),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: The --concurrency option must be auto, off or a positive integer]`,
      );
    });

    it('should reject decimal number for "concurrency" option', async () => {
      await expect(
        resolveAndInstantiateESLint('./eslint.config.js', {
          concurrency: 1.5,
        } as any),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: The --concurrency option must be auto, off or a positive integer]`,
      );
    });
  });
});
