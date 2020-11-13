/**
 * Some utils taken from various parts of Nx:
 * https://github.com/nrwl/nx
 *
 * Thanks, Nrwl folks!
 */
import { join, normalize, Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import stripJsonComments from 'strip-json-comments';

/**
 * This method is specifically for reading JSON files in a Tree
 * @param host The host tree
 * @param path The path to the JSON file
 * @returns The JSON data in the file.
 */
export function readJsonInTree<T = any>(host: Tree, path: string): T {
  if (!host.exists(path)) {
    throw new Error(`Cannot find ${path}`);
  }
  const contents = stripJsonComments(host.read(path)!.toString('utf-8'));
  try {
    return JSON.parse(contents);
  } catch (e) {
    throw new Error(`Cannot parse ${path}: ${e.message}`);
  }
}

/**
 * This method is specifically for updating JSON in a Tree
 * @param path Path of JSON file in the Tree
 * @param callback Manipulation of the JSON data
 * @returns A rule which updates a JSON file file in a Tree
 */
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

function getWorkspacePath(host: Tree) {
  const possibleFiles = ['/workspace.json', '/angular.json', '/.angular.json'];
  return possibleFiles.filter((path) => host.exists(path))[0];
}

export function getProjectConfig(host: Tree, name: string): any {
  const workspaceJson = readJsonInTree(host, getWorkspacePath(host));
  const projectConfig = workspaceJson.projects[name];
  if (!projectConfig) {
    throw new Error(`Cannot find project '${name}'`);
  } else {
    return projectConfig;
  }
}

export function offsetFromRoot(fullPathToSourceDir: string): string {
  const parts = normalize(fullPathToSourceDir).split('/');
  let offset = '';
  for (let i = 0; i < parts.length; ++i) {
    offset += '../';
  }
  return offset;
}

function serializeJson(json: any): string {
  return `${JSON.stringify(json, null, 2)}\n`;
}

export function updateWorkspaceInTree<T = any, O = T>(
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

export function addESLintTargetToProject(
  projectName: string,
  targetName: 'eslint' | 'lint',
): Rule {
  return updateWorkspaceInTree((workspaceJson) => {
    const existingProjectConfig = workspaceJson.projects[projectName];

    let lintFilePatternsRoot = '';

    // Default Angular CLI project at the root of the workspace
    if (existingProjectConfig.root === '') {
      lintFilePatternsRoot = 'src';
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

function allFilesInDirInHost(
  host: Tree,
  path: Path,
  options: {
    recursive: boolean;
  } = { recursive: true },
): Path[] {
  const dir = host.getDir(path);
  const res: Path[] = [];
  dir.subfiles.forEach((p) => {
    res.push(join(path, p));
  });

  if (!options.recursive) {
    return res;
  }

  dir.subdirs.forEach((p) => {
    res.push(...allFilesInDirInHost(host, join(path, p)));
  });
  return res;
}

export function getAllSourceFilesForProject(
  host: Tree,
  projectName: string,
): Path[] {
  const workspaceJson = readJsonInTree(host, 'angular.json');
  const existingProjectConfig = workspaceJson.projects[projectName];

  let pathRoot = '';

  // Default Angular CLI project at the root of the workspace
  if (existingProjectConfig.root === '') {
    pathRoot = 'src';
  } else {
    pathRoot = existingProjectConfig.root;
  }

  return allFilesInDirInHost(host, normalize(pathRoot));
}
