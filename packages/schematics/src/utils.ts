/**
 * Some utils taken from various parts of Nx:
 * https://github.com/nrwl/nx
 *
 * Thanks, Nrwl folks!
 */
import type { Path } from '@angular-devkit/core';
import { join, normalize } from '@angular-devkit/core';
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { callRule, chain } from '@angular-devkit/schematics';
import type { Tree as NxTree, ProjectConfiguration } from '@nx/devkit';
import {
  offsetFromRoot as offsetFromRoot__NX,
  readJson,
  writeJson,
} from '@nx/devkit';
import type { Ignore } from 'ignore';
import ignore from 'ignore';
import stripJsonComments from 'strip-json-comments';

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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function getWorkspacePath(host: Tree) {
  const possibleFiles = ['/workspace.json', '/angular.json', '/.angular.json'];
  return possibleFiles.filter((path) => host.exists(path))[0];
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

function offsetFromRoot(fullPathToSourceDir: string): string {
  const parts = normalize(fullPathToSourceDir).split('/');
  let offset = '';
  for (let i = 0; i < parts.length; ++i) {
    offset += '../';
  }
  return offset;
}

function serializeJson(json: unknown): string {
  return `${JSON.stringify(json, null, 2)}\n`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updateWorkspaceInTree<T = any, O = T>(
  callback: (json: T, context: SchematicContext, host: Tree) => O,
): Rule {
  return (host: Tree, context: SchematicContext): Tree => {
    const path = getWorkspacePath(host);
    host.overwrite(
      path,
      serializeJson(callback(readJsonInTree(host, path), context, host)),
    );
    return host;
  };
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

export function addESLintTargetToProject__NX(
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
    },
  };

  existingProjectConfig.architect = existingProjectConfig.architect || {};
  existingProjectConfig.architect[targetName] = eslintTargetConfig;

  updateProjectConfiguration(tree, projectName, existingProjectConfig);
}

export function addESLintTargetToProject(
  projectName: string,
  targetName: 'eslint' | 'lint',
): Rule {
  return updateWorkspaceInTree((workspaceJson) => {
    const existingProjectConfig = workspaceJson.projects[projectName];

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
      },
    };

    existingProjectConfig.architect[targetName] = eslintTargetConfig;

    return workspaceJson;
  });
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

function createProjectESLintConfig__NX(
  projectRoot: string,
  projectType: ProjectType,
  prefix: string,
  setParserOptionsProject: boolean,
  hasE2e: boolean,
) {
  return {
    extends: `${offsetFromRoot__NX(projectRoot)}.eslintrc.json`,
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

export function createESLintConfigForProject__NX(
  tree: NxTree,
  projectName: string,
  setParserOptionsProject: boolean,
) {
  const existingProjectConfig = readProjectConfiguration(tree, projectName);
  const targets =
    existingProjectConfig.architect || existingProjectConfig.targets;
  const { root: projectRoot, projectType, prefix } = existingProjectConfig;

  const hasE2e = !!targets?.e2e;

  /**
   * If the root is an empty string it must be the initial project created at the
   * root by the Angular CLI's workspace schematic
   */
  if (projectRoot === '') {
    return createRootESLintConfigFile__NX(tree, prefix || DEFAULT_PREFIX);
  }

  // If, for whatever reason, the root .eslintrc.json doesn't exist yet, create it
  if (!tree.exists('.eslintrc.json')) {
    createRootESLintConfigFile__NX(tree, prefix || DEFAULT_PREFIX);
  }

  writeJson(
    tree,
    join(normalize(projectRoot), '.eslintrc.json'),
    createProjectESLintConfig__NX(
      projectRoot,
      projectType || 'library',
      prefix || DEFAULT_PREFIX,
      setParserOptionsProject,
      hasE2e,
    ),
  );
}

export function createESLintConfigForProject(
  projectName: string,
  setParserOptionsProject: boolean,
): Rule {
  return (tree: Tree) => {
    const angularJSON = readJsonInTree(tree, 'angular.json');
    const {
      root: projectRoot,
      projectType,
      prefix,
    } = angularJSON.projects[projectName];

    const hasE2e = determineTargetProjectHasE2E(angularJSON, projectName);

    /**
     * If the root is an empty string it must be the initial project created at the
     * root by the Angular CLI's workspace schematic
     */
    if (projectRoot === '') {
      return createRootESLintConfigFile(projectName);
    }

    return chain([
      // If, for whatever reason, the root .eslintrc.json doesn't exist yet, create it
      tree.exists('.eslintrc.json')
        ? () => undefined
        : createRootESLintConfigFile(projectName),
      updateJsonInTree(join(normalize(projectRoot), '.eslintrc.json'), () =>
        createProjectESLintConfig(
          projectRoot,
          projectType,
          prefix,
          setParserOptionsProject,
          hasE2e,
        ),
      ),
    ]);
  };
}

function createRootESLintConfigFile(projectName: string): Rule {
  return (tree) => {
    const angularJSON = readJsonInTree(tree, getWorkspacePath(tree));
    let lintPrefix: string | null = null;

    if (angularJSON.projects?.[projectName]) {
      const { prefix } = angularJSON.projects[projectName];
      lintPrefix = prefix;
    }

    return updateJsonInTree('.eslintrc.json', () =>
      createRootESLintConfig(lintPrefix),
    );
  };
}

function createRootESLintConfigFile__NX(tree: NxTree, prefix: string) {
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
export function determineTargetProjectName__NX(
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
 * To make certain schematic usage conversion more ergonomic, if the user does not specify a project
 * and only has a single project in their angular.json we will just go ahead and use that one.
 */
export function determineTargetProjectName(
  tree: Tree,
  maybeProject?: string,
): string | null {
  if (maybeProject) {
    return maybeProject;
  }
  const workspaceJson = readJsonInTree(tree, getWorkspacePath(tree));
  const projects = Object.keys(workspaceJson.projects);
  if (projects.length === 1) {
    return projects[0];
  }
  return null;
}

/**
 * Checking if the target project has e2e setup
 * Method will check if angular project architect has e2e configuration to determine if e2e setup
 */
function determineTargetProjectHasE2E(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  angularJSON: any,
  projectName: string,
): boolean {
  return !!getTargetsConfigFromProject(angularJSON.projects[projectName])?.e2e;
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
