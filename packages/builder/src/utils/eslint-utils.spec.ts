import { vi, describe, it, expect, beforeEach } from 'vitest';

const MockESLint = vi.fn(class MockESLint {});

vi.mock('eslint', () => ({
  ESLint: MockESLint,
}));

import { resolveAndInstantiateESLint } from './eslint-utils';

describe('eslint-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create the ESLint instance with the proper parameters when given a config path', async () => {
    await resolveAndInstantiateESLint('./eslint.config.js', {
      fix: true,
      cache: true,
      cacheLocation: '/root/cache',
      cacheStrategy: 'content',
    } as any);

    expect(MockESLint).toHaveBeenCalledWith({
      overrideConfigFile: './eslint.config.js',
      fix: true,
      cache: true,
      cacheLocation: '/root/cache',
      cacheStrategy: 'content',
      errorOnUnmatchedPattern: false,
      stats: false,
    });
  });

  it('should create the ESLint instance with the proper parameters when no config path is given', async () => {
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
      errorOnUnmatchedPattern: false,
      stats: false,
    });
  });

  describe('noConfigLookup', () => {
    it('should set overrideConfigFile to true when noConfigLookup is true and no config path is given', async () => {
      await resolveAndInstantiateESLint(undefined, {
        noConfigLookup: true,
      } as any);

      expect(MockESLint).toHaveBeenCalledWith(
        expect.objectContaining({
          overrideConfigFile: true,
        }),
      );
    });

    it('should keep the config path as overrideConfigFile when noConfigLookup is true and a config path is given', async () => {
      await resolveAndInstantiateESLint('./eslint.config.js', {
        noConfigLookup: true,
      } as any);

      expect(MockESLint).toHaveBeenCalledWith(
        expect.objectContaining({
          overrideConfigFile: './eslint.config.js',
        }),
      );
    });

    it('should set overrideConfigFile to undefined when noConfigLookup is false and no config path is given', async () => {
      await resolveAndInstantiateESLint(undefined, {
        noConfigLookup: false,
      } as any);

      expect(MockESLint).toHaveBeenCalledWith(
        expect.objectContaining({
          overrideConfigFile: undefined,
        }),
      );
    });
  });

  describe('applySuppressions option', () => {
    it('should create the ESLint instance with "applySuppressions" set to true', async () => {
      await resolveAndInstantiateESLint('./eslint.config.js', {
        applySuppressions: true,
      } as any);
      expect(MockESLint).toHaveBeenCalledWith({
        cache: false,
        cacheLocation: undefined,
        cacheStrategy: undefined,
        errorOnUnmatchedPattern: false,
        fix: false,
        overrideConfigFile: './eslint.config.js',
        stats: false,
        applySuppressions: true,
      });
    });
  });

  describe('suppressionsLocation option', () => {
    it('should create the ESLint instance with suppressionsLocation set to the given value', async () => {
      await resolveAndInstantiateESLint('./eslint.config.js', {
        suppressionsLocation: './suppressions.json',
      } as any);
      expect(MockESLint).toHaveBeenCalledWith({
        cache: false,
        cacheLocation: undefined,
        cacheStrategy: undefined,
        errorOnUnmatchedPattern: false,
        fix: false,
        overrideConfigFile: './eslint.config.js',
        stats: false,
        suppressionsLocation: './suppressions.json',
      });
    });
  });

  describe('stats option', () => {
    it('should create the ESLint instance with "stats" set to true', async () => {
      await resolveAndInstantiateESLint('./eslint.config.js', {
        stats: true,
      } as any);
      expect(MockESLint).toHaveBeenCalledWith({
        cache: false,
        cacheLocation: undefined,
        cacheStrategy: undefined,
        errorOnUnmatchedPattern: false,
        fix: false,
        overrideConfigFile: './eslint.config.js',
        stats: true,
      });
    });
  });

  describe('config file name validation', () => {
    it.each([
      // The conventional flat config names
      './eslint.config.js',
      './eslint.config.mjs',
      './eslint.config.cjs',
      './eslint.config.ts',
      './eslint.config.mts',
      './eslint.config.cts',
      // Arbitrary flat config names/paths are also valid - ESLint's own
      // `--config` flag accepts any file name, so we must too.
      './custom.js',
      './config/lint-rules.mjs',
      './my.eslint.config.ts',
      '/absolute/path/to/linting.cjs',
      './.eslintrc.config.js',
    ])('should not throw if %s is used', async (configPath) => {
      await expect(
        resolveAndInstantiateESLint(configPath, {} as any),
      ).resolves.not.toThrow();
    });

    it.each([
      './.eslintrc',
      './.eslintrc.js',
      './.eslintrc.cjs',
      './.eslintrc.json',
      './.eslintrc.yml',
      './.eslintrc.yaml',
      './config/.eslintrc.json',
    ])(
      'should throw if the legacy eslintrc file %s is used',
      async (configPath) => {
        await expect(
          resolveAndInstantiateESLint(configPath, {} as any),
        ).rejects.toThrow(/uses the legacy "eslintrc" format/);
      },
    );

    it('should produce a helpful error message for a legacy .eslintrc file', async () => {
      await expect(
        resolveAndInstantiateESLint('./.eslintrc.json', {} as any),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: The ESLint config file "./.eslintrc.json" uses the legacy "eslintrc" format, which is no longer supported. Please use an ESLint flat config file (it can have any name, e.g. eslint.config.js). See https://eslint.org/docs/latest/use/configure/configuration-files]`,
      );
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
