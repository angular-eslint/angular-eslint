import { joinPathFragments, parseJson, writeJsonFile } from '@nx/devkit';
import { execSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';

const TMP_DIR = tmpdir();

export const FIXTURES_DIR = joinPathFragments(
  TMP_DIR,
  'angular-eslint-e2e-fixtures',
);

export async function resetFixtureDirectory(
  fixtureDirectory: string,
): Promise<void> {
  const fullFixtureDirectory = joinPathFragments(
    FIXTURES_DIR,
    fixtureDirectory,
  );
  // Remove any existing e2e fixture on disk and recreate the location
  if (existsSync(fullFixtureDirectory)) {
    console.log(`Removing existing fixture directory: ${fullFixtureDirectory}`);
    rmSync(fullFixtureDirectory, { recursive: true, force: true });
  }
  if (!existsSync(FIXTURES_DIR)) {
    mkdirSync(FIXTURES_DIR, { recursive: true });
  }
}

export class Fixture {
  constructor(public root: string) {
    console.log(`[e2e debug output] Creating fixture in ${this.root}`);
  }

  directoryExists(filePath: string): boolean {
    try {
      return statSync(filePath).isDirectory();
    } catch {
      return false;
    }
  }

  fileExists(filePath: string): boolean {
    try {
      return statSync(filePath).isFile();
    } catch {
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

  deleteFileOrDirectory(f: string): void {
    rmSync(joinPathFragments(this.root, f), { recursive: true, force: true });
  }

  runCommand(command: string): void {
    execSync(command, { cwd: this.root, maxBuffer: 1024 * 1024 * 10 });
  }
}
