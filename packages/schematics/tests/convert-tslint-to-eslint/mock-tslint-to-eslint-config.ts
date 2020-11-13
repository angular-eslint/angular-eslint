import {
  exampleProjectTslintJson,
  exampleRootTslintJson,
} from './example-tslint-configs';

/**
 * The actual `findReportedConfiguration()` function is used to execute
 * `tslint --print-config` in a child process and read from the real
 * file system. This won't work for us in tests where we are dealing
 * with a Tree, so we mock out the responses from `findReportedConfiguration()`
 * with previously captured result data from that same command.
 */

export function mockFindReportedConfiguration(
  _: unknown,
  pathToTSLintJson: string,
) {
  if (pathToTSLintJson === 'tslint.json') {
    return exampleRootTslintJson.tslintPrintConfigResult;
  }

  if (pathToTSLintJson === 'projects/app1/tslint.json') {
    return exampleProjectTslintJson.tslintPrintConfigResult;
  }

  throw new Error(
    `${pathToTSLintJson} is not a part of the supported mock data for these tests`,
  );
}
