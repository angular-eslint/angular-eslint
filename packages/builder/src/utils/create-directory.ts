import { dirname } from 'path';
import { mkdirSync, statSync } from 'fs';

export function createDirectory(directoryPath: string): void {
  const parentPath = dirname(directoryPath);
  if (!directoryExists(parentPath)) {
    createDirectory(parentPath);
  }
  if (!directoryExists(directoryPath)) {
    mkdirSync(directoryPath);
  }
}

function directoryExists(name: string): boolean {
  try {
    return statSync(name).isDirectory();
  } catch {
    return false;
  }
}
