/**
 * All credit goes to Nrwl and Nx for these utils
 * https://github.com/nrwl/nx
 */
import * as fs from 'fs';
import * as path from 'path';

export const appRootPath = pathInner(__dirname);

function pathInner(dir: string): string {
  if (path.dirname(dir) === dir) return process.cwd();
  if (
    fileExists(path.join(dir, 'workspace.json')) ||
    fileExists(path.join(dir, 'angular.json'))
  ) {
    return dir;
  } else {
    return pathInner(path.dirname(dir));
  }
}

function fileExists(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}
