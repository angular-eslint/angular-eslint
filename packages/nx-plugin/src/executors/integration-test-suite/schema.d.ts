export interface IntegrationTestSuiteExecutorSchema {
  cwd: string;
  testFilePath: string;
  withRegistry?: boolean;
  updateSnapshots?: boolean;
}
