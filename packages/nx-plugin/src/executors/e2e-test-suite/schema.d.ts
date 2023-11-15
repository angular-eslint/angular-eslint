export interface E2ETestSuiteExecutorSchema {
  cwd: string;
  testFilePath: string;
  updateSnapshots?: boolean;
}
