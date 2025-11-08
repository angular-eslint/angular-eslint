import { Tree } from '@angular-devkit/schematics';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  determineNewProjectESLintConfigContentAndExtension,
  resolveRootESLintConfigPath,
} from '../src/utils';

describe('determineNewProjectESLintConfigContentAndExtension', () => {
  let tree: Tree;
  const projectRoot = 'my-proj';
  const projectPackageJsonPath = join(projectRoot, 'package.json');

  beforeEach(() => {
    tree = new UnitTestTree(Tree.empty());
    tree.create('package.json', JSON.stringify({}));
  });

  describe('default', () => {
    it('should return the default js extension and isESM false', () => {
      const result = determineNewProjectESLintConfigContentAndExtension(
        tree,
        'eslint.config.js',
        '',
      );
      expect(result.isESM).toBe(false);
      expect(result.ext).toBe('js');
    });
  });

  describe('root is ESM (via package.json), no project package.json', () => {
    it('should return the default js extension and isESM true', () => {
      tree.overwrite('package.json', JSON.stringify({ type: 'module' }));

      const result = determineNewProjectESLintConfigContentAndExtension(
        tree,
        // Is ESM via type in package.json, not via .mjs extension on the config
        'eslint.config.js',
        projectRoot,
      );
      expect(result.isESM).toBe(true);
      expect(result.ext).toBe('js');
    });
  });

  describe('root is ESM (via eslint.config.mjs), no project package.json', () => {
    it('should return the default js extension and isESM true', () => {
      // Is ESM via .mjs extension on the config, not via package.json
      tree.overwrite('package.json', JSON.stringify({ type: 'commonjs' }));

      const result = determineNewProjectESLintConfigContentAndExtension(
        tree,
        'eslint.config.mjs',
        projectRoot,
      );
      expect(result.isESM).toBe(true);
      expect(result.ext).toBe('js');
    });
  });

  describe('root is CJS (via package.json), no project package.json', () => {
    it('should return the default js extension and isESM false', () => {
      tree.overwrite('package.json', JSON.stringify({ type: 'commonjs' }));

      const result = determineNewProjectESLintConfigContentAndExtension(
        tree,
        // Is CJS via type in package.json, not via .cjs extension on the config
        'eslint.config.js',
        projectRoot,
      );
      expect(result.isESM).toBe(false);
      expect(result.ext).toBe('js');
    });
  });

  describe('root is CJS (via eslint.config.cjs), no project package.json', () => {
    it('should return the default js extension and isESM false', () => {
      tree.overwrite('package.json', JSON.stringify({ type: 'module' }));

      const result = determineNewProjectESLintConfigContentAndExtension(
        tree,
        'eslint.config.cjs',
        projectRoot,
      );
      expect(result.isESM).toBe(false);
      expect(result.ext).toBe('js');
    });
  });

  describe('root is ESM, project package.json is commonjs', () => {
    it('should return the mjs extension and isESM true', () => {
      tree.overwrite('package.json', JSON.stringify({ type: 'module' }));
      tree.create(projectPackageJsonPath, JSON.stringify({ type: 'commonjs' }));

      const result = determineNewProjectESLintConfigContentAndExtension(
        tree,
        // Is ESM via type in package.json, not via .mjs extension on the config
        'eslint.config.js',
        projectRoot,
      );
      expect(result.isESM).toBe(true);
      expect(result.ext).toBe('mjs');
    });
  });

  describe('root is ESM, project package.json is ESM', () => {
    it('should return the default js extension and isESM true', () => {
      tree.overwrite('package.json', JSON.stringify({ type: 'module' }));
      tree.create(projectPackageJsonPath, JSON.stringify({ type: 'module' }));

      const result = determineNewProjectESLintConfigContentAndExtension(
        tree,
        // Is ESM via type in package.json, not via .mjs extension on the config
        'eslint.config.js',
        projectRoot,
      );
      expect(result.isESM).toBe(true);
      expect(result.ext).toBe('js');
    });
  });

  describe('root is CJS, project package.json is commonjs', () => {
    it('should return the default js extension and isESM false', () => {
      tree.overwrite('package.json', JSON.stringify({ type: 'commonjs' }));
      tree.create(projectPackageJsonPath, JSON.stringify({ type: 'commonjs' }));

      const result = determineNewProjectESLintConfigContentAndExtension(
        tree,
        // Is CJS via type in package.json, not via .mjs extension on the config
        'eslint.config.js',
        projectRoot,
      );
      expect(result.isESM).toBe(false);
      expect(result.ext).toBe('js');
    });
  });

  describe('root is CJS, project package.json is ESM', () => {
    it('should return the cjs extension and isESM false', () => {
      tree.overwrite('package.json', JSON.stringify({ type: 'commonjs' }));
      tree.create(projectPackageJsonPath, JSON.stringify({ type: 'module' }));

      const result = determineNewProjectESLintConfigContentAndExtension(
        tree,
        // Is CJS via type in package.json, not via .mjs extension on the config
        'eslint.config.js',
        projectRoot,
      );
      expect(result.isESM).toBe(false);
      expect(result.ext).toBe('cjs');
    });
  });
});

describe('resolveRootESLintConfigPath', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = new UnitTestTree(Tree.empty());
  });

  it('should return .eslintrc.json if it exists', () => {
    tree.create('.eslintrc.json', '{}');
    expect(resolveRootESLintConfigPath(tree)).toBe('.eslintrc.json');
  });

  it('should return eslint.config.js if it exists and no .eslintrc.json', () => {
    tree.create('eslint.config.js', '');
    expect(resolveRootESLintConfigPath(tree)).toBe('eslint.config.js');
  });

  it('should return eslint.config.mjs if it exists and no previous configs', () => {
    tree.create('eslint.config.mjs', '');
    expect(resolveRootESLintConfigPath(tree)).toBe('eslint.config.mjs');
  });

  it('should return eslint.config.cjs if it exists and no previous configs', () => {
    tree.create('eslint.config.cjs', '');
    expect(resolveRootESLintConfigPath(tree)).toBe('eslint.config.cjs');
  });

  it('should return eslint.config.ts if it exists and no previous configs', () => {
    tree.create('eslint.config.ts', '');
    expect(resolveRootESLintConfigPath(tree)).toBe('eslint.config.ts');
  });

  it('should return eslint.config.mts if it exists and no previous configs', () => {
    tree.create('eslint.config.mts', '');
    expect(resolveRootESLintConfigPath(tree)).toBe('eslint.config.mts');
  });

  it('should return eslint.config.cts if it exists and no previous configs', () => {
    tree.create('eslint.config.cts', '');
    expect(resolveRootESLintConfigPath(tree)).toBe('eslint.config.cts');
  });

  it('should return null if no config file exists', () => {
    expect(resolveRootESLintConfigPath(tree)).toBe(null);
  });

  it('should prioritize .eslintrc.json over flat config files', () => {
    tree.create('.eslintrc.json', '{}');
    tree.create('eslint.config.js', '');
    tree.create('eslint.config.ts', '');
    expect(resolveRootESLintConfigPath(tree)).toBe('.eslintrc.json');
  });

  it('should prioritize JS over TS flat config files', () => {
    tree.create('eslint.config.js', '');
    tree.create('eslint.config.ts', '');
    expect(resolveRootESLintConfigPath(tree)).toBe('eslint.config.js');
  });
});
