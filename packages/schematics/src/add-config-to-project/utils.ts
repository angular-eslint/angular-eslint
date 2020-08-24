/**
 * Utils taken from various parts of Nx:
 * https://github.com/nrwl/nx
 *
 * Thanks, Nrwl folks!
 */
import { normalize } from '@angular-devkit/core';
import { Tree, SchematicContext, Rule } from '@angular-devkit/schematics';
import stripJsonComments from 'strip-json-comments';

/**
 * This method is specifically for reading JSON files in a Tree
 * @param host The host tree
 * @param path The path to the JSON file
 * @returns The JSON data in the file.
 */
function readJsonInTree<T = any>(host: Tree, path: string): T {
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
