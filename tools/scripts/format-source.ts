import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

const oxfmtPackageJsonPath = require.resolve('oxfmt/package.json');
const oxfmtBin = path.join(path.dirname(oxfmtPackageJsonPath), 'bin/oxfmt');

export class FormatSourceError extends Error {
  constructor(
    message: string,
    readonly exitCode: number | null,
    readonly stderr: string,
  ) {
    super(message);
    this.name = 'FormatSourceError';
  }
}

export interface FormatSourceOptions {
  /**
   * Path passed to oxfmt as `--stdin-filepath`. Defaults to `filePath`.
   * Use a non-ignored path when formatting output that must stay excluded from
   * workspace `format:check` (for example copied schematic schemas).
   */
  stdinFilePath?: string;
}

/**
 * Format source text using the workspace oxfmt configuration.
 * The filepath is used for parser selection and override matching unless
 * `stdinFilePath` overrides the CLI path (for example to bypass ignorePatterns).
 */
export function formatSource(
  sourceText: string,
  filePath: string,
  options?: FormatSourceOptions,
): string {
  const relativeFilePath = path.isAbsolute(filePath)
    ? path.relative(workspaceRoot, filePath)
    : filePath;
  const stdinRelativePath = options?.stdinFilePath
    ? path.isAbsolute(options.stdinFilePath)
      ? path.relative(workspaceRoot, options.stdinFilePath)
      : options.stdinFilePath
    : relativeFilePath;

  try {
    const formatted = execFileSync(
      'node',
      [
        oxfmtBin,
        '--no-error-on-unmatched-pattern',
        `--stdin-filepath=${stdinRelativePath}`,
      ],
      {
        cwd: workspaceRoot,
        input: sourceText,
        encoding: 'utf-8',
        maxBuffer: 50 * 1024 * 1024,
      },
    );

    return formatted;
  } catch (error: unknown) {
    const execError = error as NodeJS.ErrnoException & {
      status?: number | null;
      stderr?: string | Buffer;
    };
    const stderr =
      typeof execError.stderr === 'string'
        ? execError.stderr
        : (execError.stderr?.toString() ?? '');

    throw new FormatSourceError(
      `Failed to format ${relativeFilePath} with oxfmt${stderr ? `: ${stderr.trim()}` : ''}`,
      execError.status ?? null,
      stderr,
    );
  }
}
