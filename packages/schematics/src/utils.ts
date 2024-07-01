import type { Path } from '@angular-devkit/core';
import { join, normalize } from '@angular-devkit/core';
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { callRule } from '@angular-devkit/schematics';
import type { Ignore } from 'ignore';
import ignore from 'ignore';
import semver from 'semver';
import stripJsonComments from 'strip-json-comments';
import type { Tree as NxTree, ProjectConfiguration } from './devkit-imports';
import { offsetFromRoot, readJson, writeJson } from './devkit-imports';

const DEFAULT_PREFIX = 'app';

/**
 * This method is specifically for reading JSON files in a Tree
 * @param host The host tree
 * @param path The path to the JSON file
 * @returns The JSON data in the file.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function readJsonInTree<T = any>(host: Tree, path: string): T {
  if (!host.exists(path)) {
    throw new Error(`Cannot find ${path}`);
  }
  const contents = stripJsonComments(
    (host.read(path) as Buffer).toString('utf-8'),
  );
  try {
    return JSON.parse(contents);
  } catch (e) {
    throw new Error(
      `Cannot parse ${path}: ${e instanceof Error ? e.message : ''}`,
    );
  }
}

/**
 * This method is specifically for updating JSON in a Tree
 * @param path Path of JSON file in the Tree
 * @param callback Manipulation of the JSON data
 * @returns A rule which updates a JSON file file in a Tree
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateJsonInTree<T = any, O = T>(
  path: string,
  callback: (json: T, context: SchematicContext) => O,
): Rule {
  return (host: Tree, context: SchematicContext): Tree => {
    if (!host.exists(path)) {
      host.create(path, serializeJson(callback({} as T, context)));
      return host;
    }
    host.overwrite(
      path,
      serializeJson(callback(readJsonInTree(host, path), context)),
    );
    return host;
  };
}

type TargetsConfig = Record<string, { builder: string; options: unknown }>;

export function getTargetsConfigFromProject(
  projectConfig: { architect?: TargetsConfig } & { targets?: TargetsConfig },
): TargetsConfig | null {
  if (!projectConfig) {
    return null;
  }
  if (projectConfig.architect) {
    return projectConfig.architect;
  }
  // "targets" is an undocumented but supported alias of "architect"
  if (projectConfig.targets) {
    return projectConfig.targets;
  }
  return null;
}

function serializeJson(json: unknown): string {
  return `${JSON.stringify(json, null, 2)}\n`;
}

function readProjectConfiguration(tree: NxTree, projectName: string) {
  const angularJSON = readJson(tree, 'angular.json');
  return angularJSON.projects[projectName];
}

function updateProjectConfiguration(
  tree: NxTree,
  projectName: string,
  projectConfig: ProjectConfiguration,
) {
  const angularJSON = readJson(tree, 'angular.json');
  angularJSON.projects[projectName] = projectConfig;
  writeJson(tree, 'angular.json', angularJSON);
}

export function addESLintTargetToProject(
  tree: NxTree,
  projectName: string,
  targetName: 'eslint' | 'lint',
) {
  const existingProjectConfig = readProjectConfiguration(tree, projectName);

  let lintFilePatternsRoot = '';

  // Default Angular CLI project at the root of the workspace
  if (existingProjectConfig.root === '') {
    lintFilePatternsRoot = existingProjectConfig.sourceRoot || 'src';
  } else {
    lintFilePatternsRoot = existingProjectConfig.root;
  }

  const eslintTargetConfig = {
    builder: '@angular-eslint/builder:lint',
    options: {
      lintFilePatterns: [
        `${lintFilePatternsRoot}/**/*.ts`,
        `${lintFilePatternsRoot}/**/*.html`,
      ],
    } as Record<string, unknown>,
  };

  let eslintConfig;
  if (existingProjectConfig.root !== '') {
    const flatConfigPath = join(existingProjectConfig.root, 'eslint.config.js');
    if (tree.exists(flatConfigPath)) {
      eslintConfig = flatConfigPath;
    }
  }

  eslintTargetConfig.options.eslintConfig = eslintConfig;

  existingProjectConfig.architect = existingProjectConfig.architect || {};
  existingProjectConfig.architect[targetName] = eslintTargetConfig;

  updateProjectConfiguration(tree, projectName, existingProjectConfig);
}

/**
 * Utility to act on all files in a tree that are not ignored by git.
 */
export function visitNotIgnoredFiles(
  visitor: (file: Path, host: Tree, context: SchematicContext) => void | Rule,
  dir: Path = normalize(''),
): Rule {
  return (host, context) => {
    let ig: Ignore;
    if (host.exists('.gitignore')) {
      ig = ignore();
      ig.add((host.read('.gitignore') as Buffer).toString());
    }

    function visit(_dir: Path) {
      if (_dir && ig?.ignores(_dir)) {
        return;
      }
      const dirEntry = host.getDir(_dir);
      dirEntry.subfiles.forEach((file) => {
        if (ig?.ignores(join(_dir, file))) {
          return;
        }
        const maybeRule = visitor(join(_dir, file), host, context);
        if (maybeRule) {
          callRule(maybeRule, host, context).subscribe();
        }
      });

      dirEntry.subdirs.forEach((subdir) => {
        visit(join(_dir, subdir));
      });
    }

    visit(dir);
  };
}

type ProjectType = 'application' | 'library';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function setESLintProjectBasedOnProjectType(
  projectRoot: string,
  projectType: ProjectType,
  hasE2e?: boolean,
) {
  let project;
  if (projectType === 'application') {
    project = [`${projectRoot}/tsconfig.(app|spec).json`];

    if (hasE2e) {
      project.push(`${projectRoot}/e2e/tsconfig.json`);
    }
  }
  // Libraries don't have an e2e directory
  if (projectType === 'library') {
    project = [`${projectRoot}/tsconfig.(lib|spec).json`];
  }
  return project;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createRootESLintConfig(prefix: string | null) {
  let codeRules;
  if (prefix) {
    codeRules = {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix, style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix, style: 'kebab-case' },
      ],
    };
  } else {
    codeRules = {};
  }

  return {
    root: true,
    ignorePatterns: ['projects/**/*'],
    overrides: [
      {
        files: ['*.ts'],
        extends: [
          'eslint:recommended',
          'plugin:@typescript-eslint/recommended',
          'plugin:@angular-eslint/recommended',
          'plugin:@angular-eslint/template/process-inline-templates',
        ],
        rules: codeRules,
      },
      {
        files: ['*.html'],
        extends: [
          'plugin:@angular-eslint/template/recommended',
          'plugin:@angular-eslint/template/accessibility',
        ],
        rules: {},
      },
    ],
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createStringifiedRootESLintConfig(
  prefix: string | null,
): string {
  return `// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: ${
      prefix
        ? `{
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "${prefix}",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "${prefix}",
          style: "kebab-case",
        },
      ],
    }`
        : '{}'
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  }
);
`;
}

function createProjectESLintConfig(
  projectRoot: string,
  projectType: ProjectType,
  prefix: string,
  setParserOptionsProject: boolean,
  hasE2e: boolean,
) {
  return {
    extends: `${offsetFromRoot(projectRoot)}.eslintrc.json`,
    ignorePatterns: ['!**/*'],
    overrides: [
      {
        files: ['*.ts'],
        ...(setParserOptionsProject
          ? {
              parserOptions: {
                project: setESLintProjectBasedOnProjectType(
                  projectRoot,
                  projectType,
                  hasE2e,
                ),
              },
            }
          : null),
        rules: {
          '@angular-eslint/directive-selector': [
            'error',
            { type: 'attribute', prefix, style: 'camelCase' },
          ],
          '@angular-eslint/component-selector': [
            'error',
            { type: 'element', prefix, style: 'kebab-case' },
          ],
        },
      },

      {
        files: ['*.html'],
        rules: {},
      },
    ],
  };
}

function createStringifiedProjectESLintConfig(
  projectRoot: string,
  projectType: ProjectType,
  prefix: string,
  setParserOptionsProject: boolean,
  hasE2e: boolean,
) {
  return `// @ts-check
const tseslint = require("typescript-eslint");
const rootConfig = require("${offsetFromRoot(projectRoot)}eslint.config.js");

module.exports = tseslint.config(
  ...rootConfig,
  {
    files: ["**/*.ts"],${
      setParserOptionsProject
        ? `
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },`
        : ''
    }
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "${prefix}",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "${prefix}",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    rules: {},
  }
);
`;
}

export function createESLintConfigForProject(
  tree: NxTree,
  projectName: string,
  setParserOptionsProject: boolean,
) {
  const existingProjectConfig = readProjectConfiguration(tree, projectName);
  const targets =
    existingProjectConfig.architect || existingProjectConfig.targets;
  const { root: projectRoot, projectType, prefix } = existingProjectConfig;

  const hasE2e = !!targets?.e2e;

  const useFlatConfig = shouldUseFlatConfig(tree);
  const alreadyHasRootFlatConfig = tree.exists('eslint.config.js');
  const alreadyHasRootESLintRC = tree.exists('.eslintrc.json');

  /**
   * If the root is an empty string it must be the initial project created at the
   * root by the Angular CLI's workspace schematic
   */
  if (projectRoot === '') {
    return createRootESLintConfigFile(
      tree,
      prefix || DEFAULT_PREFIX,
      useFlatConfig,
    );
  }

  // If, for whatever reason, the root eslint.config.js/.eslintrc.json doesn't exist yet, create it
  if (!alreadyHasRootESLintRC && !alreadyHasRootFlatConfig) {
    createRootESLintConfigFile(tree, prefix || DEFAULT_PREFIX, useFlatConfig);
  }

  if (useFlatConfig) {
    tree.write(
      join(normalize(projectRoot), 'eslint.config.js'),
      createStringifiedProjectESLintConfig(
        projectRoot,
        projectType || 'library',
        prefix || DEFAULT_PREFIX,
        setParserOptionsProject,
        hasE2e,
      ),
    );
  } else {
    writeJson(
      tree,
      join(normalize(projectRoot), '.eslintrc.json'),
      createProjectESLintConfig(
        projectRoot,
        projectType || 'library',
        prefix || DEFAULT_PREFIX,
        setParserOptionsProject,
        hasE2e,
      ),
    );
  }
}

function createRootESLintConfigFile(
  tree: NxTree,
  prefix: string,
  useFlatConfig: boolean,
) {
  if (useFlatConfig) {
    return tree.write(
      'eslint.config.js',
      createStringifiedRootESLintConfig(prefix),
    );
  }
  return writeJson(tree, '.eslintrc.json', createRootESLintConfig(prefix));
}

export function sortObjectByKeys(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      return {
        ...result,
        [key]: obj[key],
      };
    }, {});
}

/**
 * To make certain schematic usage conversion more ergonomic, if the user does not specify a project
 * and only has a single project in their angular.json we will just go ahead and use that one.
 */
export function determineTargetProjectName(
  tree: NxTree,
  maybeProject?: string,
): string | null {
  if (maybeProject) {
    return maybeProject;
  }
  const workspaceJson = readJson(tree, 'angular.json');
  const projects = Object.keys(workspaceJson.projects);
  if (projects.length === 1) {
    return projects[0];
  }
  return null;
}

/**
 * See `schematicCollections` docs here:
 * https://github.com/angular/angular-cli/blob/8431b3f0769b5f95b9e13807a09293d820c4b017/docs/specifications/schematic-collections-config.md
 */
export function updateSchematicCollections(angularJson: Record<string, any>) {
  angularJson.cli = angularJson.cli || {};
  angularJson.cli.schematicCollections =
    angularJson.cli.schematicCollections || [];
  // The first matching schematic will be used, so we unshift rather than push
  angularJson.cli.schematicCollections.unshift('@angular-eslint/schematics');
  // Delete old defaultCollection property if applicable
  delete angularJson.cli.defaultCollection;
  return angularJson;
}

export function updateSchematicDefaults(
  angularJson: Record<string, any>,
  schematicFullName: string,
  defaultValues: Record<string, unknown>,
) {
  angularJson.schematics = angularJson.schematics || {};
  angularJson.schematics[schematicFullName] =
    angularJson.schematics[schematicFullName] || {};
  angularJson.schematics[schematicFullName] = {
    ...angularJson.schematics[schematicFullName],
    ...defaultValues,
  };
  return angularJson;
}

/**
 * In order to support both flat config and eslintrc we need to dynamically figure out
 * what the user should be using based on:
 * - their existing files
 * - their eslint version
 */
export function shouldUseFlatConfig(
  tree: NxTree | Tree,
  existingJson?: Record<string, unknown>,
): boolean {
  let useFlatConfig = true;
  try {
    const alreadyHasRootFlatConfig = tree.exists('eslint.config.js');
    const alreadyHasRootESLintRC = tree.exists('.eslintrc.json');

    if (alreadyHasRootFlatConfig) {
      useFlatConfig = true;
    } else if (alreadyHasRootESLintRC) {
      useFlatConfig = false;
    } else {
      const json =
        existingJson ??
        JSON.parse(tree.read('package.json')!.toString('utf-8'));
      json.devDependencies = json.devDependencies || {};
      const existingESLintVersion = json.devDependencies['eslint'];
      if (existingESLintVersion) {
        const v = semver.minVersion(existingESLintVersion);
        if (v) {
          useFlatConfig = semver.gte(v.raw, '9.0.0');
        }
      }
    }

    return useFlatConfig;
  } catch {
    return useFlatConfig;
  }
}
