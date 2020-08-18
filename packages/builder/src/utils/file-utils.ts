import * as ts from 'typescript';
import { Minimatch } from 'minimatch';
import * as path from 'path';
import * as glob from 'glob';

/**
 * - Copied from TSLint source:
 *
 * Returns an array of all outputs that are not `undefined`
 */
function mapDefined<T, U>(
  inputs: ReadonlyArray<T>,
  getOutput: (input: T) => U | undefined,
): U[] {
  const out = [];
  for (const input of inputs) {
    const output = getOutput(input);
    if (output !== undefined) {
      out.push(output);
    }
  }
  return out;
}

/**
 * - Adapted from TSLint source:
 *
 * Returns a list of source file names from a TypeScript program. This includes all referenced
 * files and excludes declaration (".d.ts") files, as well as JSON files, to avoid problems with
 * `resolveJsonModule`.
 */
function getFileNamesFromProgram(program: ts.Program): string[] {
  return mapDefined(program.getSourceFiles(), (file) =>
    file.fileName.endsWith('.d.ts') ||
    file.fileName.endsWith('.json') ||
    program.isSourceFileFromExternalLibrary(file)
      ? undefined
      : file.fileName,
  );
}

export function getFilesToLint(
  root: string,
  projectSourceRoot: string,
  options: { exclude: string[]; files: string[] },
  program?: ts.Program,
): string[] {
  const ignore = options.exclude;
  const files = options.files || [];

  const projectComponentHTMLFiles = [`${projectSourceRoot}/**/*.component.html`]
    .map((file) => glob.sync(file, { cwd: root, ignore: ignore, nodir: true }))
    .reduce((prev, curr) => prev.concat(curr), [])
    .map((file) => path.join(root, file));

  if (files.length > 0) {
    return files
      .map((file: any) => glob.sync(file, { cwd: root, ignore, nodir: true }))
      .reduce((prev: any, curr: any) => prev.concat(curr), [])
      .map((file: any) => path.join(root, file));
  }

  if (!program) {
    return [];
  }

  let programFiles = [
    ...projectComponentHTMLFiles,
    ...getFileNamesFromProgram(program),
  ];

  if (ignore && ignore.length > 0) {
    // normalize to support ./ paths
    const ignoreMatchers = ignore.map(
      (pattern: any) => new Minimatch(path.normalize(pattern), { dot: true }),
    );

    programFiles = programFiles.filter(
      (file: any) =>
        !ignoreMatchers.some((matcher: any) =>
          matcher.match(path.relative(root, file)),
        ),
    );
  }

  return programFiles;
}
