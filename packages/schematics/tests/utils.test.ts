import { Tree, type Rule } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  addESLintTargetToProject,
  createESLintConfigForProject,
  createStringifiedRootESLintConfig,
  determineNewProjectESLintConfigContentAndExtension,
  determineTargetProjectName,
  getTargetsConfigFromProject,
  readJsonInTree,
  resolveRootESLintConfigPath,
  sortObjectByKeys,
  updateJsonInTree,
  updateSchematicCollections,
  updateSchematicDefaults,
  visitNotIgnoredFiles,
} from '../src/utils';

const schematicRunner = new SchematicTestRunner(
  '@angular-eslint/schematics',
  join(__dirname, '../dist/collection.json'),
);

/**
 * Execute a schematic Rule against a Tree and resolve with the resulting Tree.
 * Uses the test runner's callRule (which returns an Observable) so that chains,
 * Promises and synchronous Rules are all handled uniformly.
 */
function runRule(rule: Rule, tree: Tree): Promise<UnitTestTree> {
  return new Promise<UnitTestTree>((resolve, reject) => {
    let result: Tree = tree;
    schematicRunner.callRule(rule, tree).subscribe({
      next: (nextTree) => {
        result = nextTree;
      },
      error: reject,
      complete: () => resolve(result as UnitTestTree),
    });
  });
}

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

  it('should fall back to a CJS .js config when package.json cannot be read', () => {
    const emptyTree = new UnitTestTree(Tree.empty());
    const result = determineNewProjectESLintConfigContentAndExtension(
      emptyTree,
      'eslint.config.js',
      'some-project',
    );
    expect(result).toEqual({ isESM: false, ext: 'js' });
  });
});

describe('resolveRootESLintConfigPath', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = new UnitTestTree(Tree.empty());
  });

  it('should return null if only a legacy .eslintrc.json exists', () => {
    tree.create('.eslintrc.json', '{}');
    expect(resolveRootESLintConfigPath(tree)).toBe(null);
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

  it('should prioritize flat config files over a legacy .eslintrc.json', () => {
    tree.create('.eslintrc.json', '{}');
    tree.create('eslint.config.js', '');
    tree.create('eslint.config.ts', '');
    expect(resolveRootESLintConfigPath(tree)).toBe('eslint.config.js');
  });

  it('should prioritize JS over TS flat config files', () => {
    tree.create('eslint.config.js', '');
    tree.create('eslint.config.ts', '');
    expect(resolveRootESLintConfigPath(tree)).toBe('eslint.config.js');
  });
});

describe('readJsonInTree', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = new UnitTestTree(Tree.empty());
  });

  it('should parse JSON from a file in the tree', () => {
    tree.create('data.json', JSON.stringify({ a: 1, b: [2, 3] }));
    expect(readJsonInTree(tree, 'data.json')).toEqual({ a: 1, b: [2, 3] });
  });

  it('should strip comments before parsing (JSONC support)', () => {
    tree.create('data.json', '{\n  // a comment\n  "a": 1\n}');
    expect(readJsonInTree(tree, 'data.json')).toEqual({ a: 1 });
  });

  it('should throw a helpful error if the file does not exist', () => {
    expect(() => readJsonInTree(tree, 'missing.json')).toThrow(
      'Cannot find missing.json',
    );
  });

  it('should throw a helpful error if the file cannot be parsed', () => {
    tree.create('bad.json', '{ not valid json ');
    expect(() => readJsonInTree(tree, 'bad.json')).toThrow(
      /Cannot parse bad\.json/,
    );
  });
});

describe('updateJsonInTree', () => {
  it('should create the file if it does not exist', async () => {
    const tree = new UnitTestTree(Tree.empty());
    const result = await runRule(
      updateJsonInTree('new.json', () => ({ created: true })),
      tree,
    );
    expect(readJsonInTree(result, 'new.json')).toEqual({ created: true });
  });

  it('should overwrite an existing file using the existing contents', async () => {
    const tree = new UnitTestTree(Tree.empty());
    tree.create('exists.json', JSON.stringify({ a: 1 }));
    const result = await runRule(
      updateJsonInTree('exists.json', (json) => ({ ...json, b: 2 })),
      tree,
    );
    expect(readJsonInTree(result, 'exists.json')).toEqual({ a: 1, b: 2 });
  });
});

describe('getTargetsConfigFromProject', () => {
  it('should return null when no project config is provided', () => {
    expect(getTargetsConfigFromProject(null as never)).toBe(null);
  });

  it('should return the architect config when present', () => {
    const architect = { build: { builder: 'x', options: {} } };
    expect(getTargetsConfigFromProject({ architect })).toBe(architect);
  });

  it('should return the targets config when architect is absent', () => {
    const targets = { build: { builder: 'x', options: {} } };
    expect(getTargetsConfigFromProject({ targets })).toBe(targets);
  });

  it('should return null when neither architect nor targets are present', () => {
    expect(getTargetsConfigFromProject({})).toBe(null);
  });
});

describe('sortObjectByKeys', () => {
  it('should return a new object with keys sorted alphabetically', () => {
    const result = sortObjectByKeys({ b: 1, a: 2, c: 3 });
    expect(Object.keys(result)).toEqual(['a', 'b', 'c']);
    expect(result).toEqual({ a: 2, b: 1, c: 3 });
  });
});

describe('determineTargetProjectName', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = new UnitTestTree(Tree.empty());
  });

  it('should return the explicitly provided project name', () => {
    tree.create('angular.json', JSON.stringify({ projects: {} }));
    expect(determineTargetProjectName(tree, 'my-project')).toBe('my-project');
  });

  it('should return the only project when there is exactly one', () => {
    tree.create(
      'angular.json',
      JSON.stringify({ projects: { 'only-one': {} } }),
    );
    expect(determineTargetProjectName(tree)).toBe('only-one');
  });

  it('should return null when there are multiple projects and none specified', () => {
    tree.create('angular.json', JSON.stringify({ projects: { a: {}, b: {} } }));
    expect(determineTargetProjectName(tree)).toBe(null);
  });
});

describe('updateSchematicCollections', () => {
  it('should create the cli config and add the collection', () => {
    const result = updateSchematicCollections({}, 'angular-eslint');
    expect(result.cli.schematicCollections).toEqual(['angular-eslint']);
  });

  it('should unshift the collection and remove a legacy defaultCollection', () => {
    const result = updateSchematicCollections(
      {
        cli: {
          defaultCollection: 'legacy',
          schematicCollections: ['existing'],
        },
      },
      'angular-eslint',
    );
    expect(result.cli.schematicCollections).toEqual([
      'angular-eslint',
      'existing',
    ]);
    expect(result.cli.defaultCollection).toBeUndefined();
  });
});

describe('updateSchematicDefaults', () => {
  it('should set defaults for a schematic, merging with any existing values', () => {
    const result = updateSchematicDefaults(
      {
        schematics: {
          '@angular-eslint/schematics:application': { existing: true },
        },
      },
      '@angular-eslint/schematics:application',
      { setParserOptionsProject: true },
    );
    expect(result.schematics['@angular-eslint/schematics:application']).toEqual(
      {
        existing: true,
        setParserOptionsProject: true,
      },
    );
  });

  it('should create the schematics config when none exists', () => {
    const result = updateSchematicDefaults(
      {},
      '@angular-eslint/schematics:library',
      { setParserOptionsProject: false },
    );
    expect(result.schematics['@angular-eslint/schematics:library']).toEqual({
      setParserOptionsProject: false,
    });
  });
});

describe('createStringifiedRootESLintConfig', () => {
  it('should generate a CommonJS config with selector rules when a prefix is given', () => {
    const content = createStringifiedRootESLintConfig('app', false);
    expect(content).toContain('const eslint = require("@eslint/js");');
    expect(content).toContain('module.exports = defineConfig([');
    expect(content).toContain('angular.configs.tsRecommended');
    expect(content).toContain('@angular-eslint/directive-selector');
    expect(content).toContain('prefix: "app"');
  });

  it('should generate an ESM config when isESM is true', () => {
    const content = createStringifiedRootESLintConfig('app', true);
    expect(content).toContain('import eslint from "@eslint/js";');
    expect(content).toContain('import { defineConfig } from "eslint/config";');
    expect(content).toContain('export default defineConfig([');
  });

  it('should omit selector rules when no prefix is given', () => {
    const content = createStringifiedRootESLintConfig(null, false);
    expect(content).not.toContain('@angular-eslint/directive-selector');
    expect(content).not.toContain('@angular-eslint/component-selector');
  });
});

describe('addESLintTargetToProject', () => {
  it('should add a lint target for the root project without an explicit eslintConfig', async () => {
    const tree = new UnitTestTree(Tree.empty());
    tree.create(
      'angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          root: {
            root: '',
            sourceRoot: 'src',
            projectType: 'application',
            architect: {},
          },
        },
      }),
    );

    const result = await runRule(
      addESLintTargetToProject('root', 'lint'),
      tree,
    );
    const lintTarget = readJsonInTree(result, 'angular.json').projects.root
      .architect.lint;

    expect(lintTarget.builder).toBe('@angular-eslint/builder:lint');
    expect(lintTarget.options.lintFilePatterns).toEqual([
      'src/**/*.ts',
      'src/**/*.html',
    ]);
    expect(lintTarget.options.eslintConfig).toBeUndefined();
  });

  it('should point a non-root project at its own flat config file when present', async () => {
    const tree = new UnitTestTree(Tree.empty());
    tree.create('package.json', JSON.stringify({}));
    tree.create('eslint.config.js', '');
    tree.create('apps/myapp/eslint.config.js', '');
    tree.create(
      'angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          myapp: {
            root: 'apps/myapp',
            sourceRoot: 'apps/myapp/src',
            projectType: 'application',
            architect: {},
          },
        },
      }),
    );

    const result = await runRule(
      addESLintTargetToProject('myapp', 'lint'),
      tree,
    );
    const lintTarget = readJsonInTree(result, 'angular.json').projects.myapp
      .architect.lint;

    expect(lintTarget.options.lintFilePatterns).toEqual([
      'apps/myapp/**/*.ts',
      'apps/myapp/**/*.html',
    ]);
    expect(lintTarget.options.eslintConfig).toBe('apps/myapp/eslint.config.js');
  });

  it('should throw when a non-root project has no resolvable root flat config', async () => {
    const tree = new UnitTestTree(Tree.empty());
    tree.create(
      'angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          lib: { root: 'libs/lib', projectType: 'library', architect: {} },
        },
      }),
    );

    await expect(
      runRule(addESLintTargetToProject('lib', 'lint'), tree),
    ).rejects.toThrow(
      'Root ESLint config must be a JavaScript/TypeScript file',
    );
  });
});

describe('createESLintConfigForProject', () => {
  it('should create a root flat config for the root project', async () => {
    const tree = new UnitTestTree(Tree.empty());
    tree.create('package.json', JSON.stringify({}));
    tree.create(
      'angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          root: { root: '', projectType: 'application', prefix: 'app' },
        },
      }),
    );

    const result = await runRule(
      createESLintConfigForProject('root', false),
      tree,
    );

    expect(result.exists('eslint.config.js')).toBe(true);
    const content = result.readContent('eslint.config.js');
    expect(content).toContain('angular.configs.tsRecommended');
    expect(content).toContain('prefix: "app"');
  });

  it('should also create the root config for a non-root project when one does not exist yet', async () => {
    const tree = new UnitTestTree(Tree.empty());
    tree.create('package.json', JSON.stringify({}));
    tree.create(
      'angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          lib: { root: 'libs/lib', projectType: 'library', prefix: 'lib' },
        },
      }),
    );

    const result = await runRule(
      createESLintConfigForProject('lib', false),
      tree,
    );

    expect(result.exists('eslint.config.js')).toBe(true);
    expect(result.exists('libs/lib/eslint.config.js')).toBe(true);
    const projectConfig = result.readContent('libs/lib/eslint.config.js');
    expect(projectConfig).toContain('rootConfig');
    expect(projectConfig).not.toContain('projectService');
  });

  it('should include the Project Service when setParserOptionsProject is true', async () => {
    const tree = new UnitTestTree(Tree.empty());
    tree.create('package.json', JSON.stringify({}));
    tree.create('eslint.config.js', '');
    tree.create(
      'angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          lib: { root: 'libs/lib', projectType: 'library', prefix: 'lib' },
        },
      }),
    );

    const result = await runRule(
      createESLintConfigForProject('lib', true),
      tree,
    );

    expect(result.exists('libs/lib/eslint.config.js')).toBe(true);
    expect(result.readContent('libs/lib/eslint.config.js')).toContain(
      'projectService: true',
    );
  });

  it('should use the default prefix for a root project without a configured prefix', async () => {
    const tree = new UnitTestTree(Tree.empty());
    tree.create('package.json', JSON.stringify({}));
    tree.create(
      'angular.json',
      JSON.stringify({
        version: 1,
        projects: { root: { root: '', projectType: 'application' } },
      }),
    );

    const result = await runRule(
      createESLintConfigForProject('root', false),
      tree,
    );

    expect(result.readContent('eslint.config.js')).toContain('prefix: "app"');
  });

  it('should default the project type and prefix when they are not configured', async () => {
    const tree = new UnitTestTree(Tree.empty());
    tree.create('package.json', JSON.stringify({}));
    tree.create(
      'angular.json',
      JSON.stringify({
        version: 1,
        projects: { lib: { root: 'libs/lib' } },
      }),
    );

    const result = await runRule(
      createESLintConfigForProject('lib', false),
      tree,
    );

    expect(result.exists('eslint.config.js')).toBe(true);
    expect(result.readContent('libs/lib/eslint.config.js')).toContain(
      'prefix: "app"',
    );
  });

  it('should generate an ESM project config when the workspace is ESM', async () => {
    const tree = new UnitTestTree(Tree.empty());
    tree.create('package.json', JSON.stringify({ type: 'module' }));
    tree.create('eslint.config.js', '');
    tree.create(
      'angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          lib: { root: 'libs/lib', projectType: 'library', prefix: 'lib' },
        },
      }),
    );

    const result = await runRule(
      createESLintConfigForProject('lib', false),
      tree,
    );

    const projectConfig = result.readContent('libs/lib/eslint.config.js');
    expect(projectConfig).toContain('import rootConfig from');
    expect(projectConfig).toContain('export default defineConfig(');
  });
});

describe('visitNotIgnoredFiles', () => {
  it('should visit files that are not ignored by .gitignore', async () => {
    const tree = new UnitTestTree(Tree.empty());
    tree.create('.gitignore', 'ignored.ts\n');
    tree.create('keep-me.ts', '');
    tree.create('nested/deep.ts', '');
    tree.create('ignored.ts', '');

    const visited: string[] = [];
    await runRule(
      visitNotIgnoredFiles((file) => {
        visited.push(file.toString());
      }),
      tree,
    );

    expect(visited.some((f) => f.endsWith('keep-me.ts'))).toBe(true);
    expect(visited.some((f) => f.endsWith('deep.ts'))).toBe(true);
    expect(visited.some((f) => f.endsWith('ignored.ts'))).toBe(false);
  });

  it('should run a Rule returned by the visitor', async () => {
    const tree = new UnitTestTree(Tree.empty());
    tree.create('delete-me.ts', '');
    tree.create('keep.ts', '');

    const result = await runRule(
      visitNotIgnoredFiles((file) => {
        if (file.toString().endsWith('delete-me.ts')) {
          return (host: Tree) => host.delete(file);
        }
        return undefined;
      }),
      tree,
    );

    expect(result.exists('delete-me.ts')).toBe(false);
    expect(result.exists('keep.ts')).toBe(true);
  });

  it('should skip directories ignored by .gitignore', async () => {
    const tree = new UnitTestTree(Tree.empty());
    tree.create('.gitignore', 'dist\n');
    tree.create('dist/output.ts', '');
    tree.create('src/keep.ts', '');

    const visited: string[] = [];
    await runRule(
      visitNotIgnoredFiles((file) => {
        visited.push(file.toString());
      }),
      tree,
    );

    expect(visited.some((f) => f.endsWith('keep.ts'))).toBe(true);
    expect(visited.some((f) => f.endsWith('output.ts'))).toBe(false);
  });

  it('should visit all files when there is no .gitignore', async () => {
    const tree = new UnitTestTree(Tree.empty());
    tree.create('a.ts', '');
    tree.create('b/c.ts', '');

    const visited: string[] = [];
    await runRule(
      visitNotIgnoredFiles((file) => {
        visited.push(file.toString());
      }),
      tree,
    );

    expect(visited.some((f) => f.endsWith('a.ts'))).toBe(true);
    expect(visited.some((f) => f.endsWith('c.ts'))).toBe(true);
  });
});
