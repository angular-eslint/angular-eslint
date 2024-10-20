import {
  joinPathFragments,
  parseJson,
  workspaceRoot,
  writeJsonFile,
} from '@nx/devkit';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { rimraf } from 'rimraf';

export const FIXTURES_DIR = joinPathFragments(
  workspaceRoot,
  'tmp',
  'e2e-fixtures',
);

export async function recreateFixturesDir(): Promise<void> {
  // Remove any existing e2e fixtures on disk and recreate the location
  if (existsSync(FIXTURES_DIR)) {
    await rimraf(FIXTURES_DIR);
  }
  mkdirSync(FIXTURES_DIR, { recursive: true });
}

export class Fixture {
  constructor(public root: string) {}

  directoryExists(filePath: string): boolean {
    try {
      return statSync(filePath).isDirectory();
    } catch (err) {
      return false;
    }
  }

  fileExists(filePath: string): boolean {
    try {
      return statSync(filePath).isFile();
    } catch (err) {
      return false;
    }
  }

  exists(filePath: string): boolean {
    return this.directoryExists(filePath) || this.fileExists(filePath);
  }

  readFile(f: string) {
    return readFileSync(joinPathFragments(this.root, f), 'utf-8');
  }

  readJson<T extends object = any>(f: string): T {
    const content = this.readFile(f);
    return parseJson<T>(content);
  }

  writeFile(f: string, content = ''): void {
    writeFileSync(joinPathFragments(this.root, f), content);
  }

  writeJson(f: string, content: object): void {
    writeJsonFile(joinPathFragments(this.root, f), content);
  }
}
