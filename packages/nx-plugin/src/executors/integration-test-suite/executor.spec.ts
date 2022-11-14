import type { ExecutorContext } from 'nx/src/config/misc-interfaces';
import type { IntegrationTestSuiteExecutorSchema } from './schema';

const mockNxRunCommandsExecutor = jest.fn();

jest.mock(
  'nx/src/executors/run-commands/run-commands.impl',
  () => mockNxRunCommandsExecutor,
);

// Must come after mocking
import executor from './executor';

const options: IntegrationTestSuiteExecutorSchema = {
  cwd: 'libs/proj',
  testFilePath: 'libs/proj/src/lib/proj.spec.ts',
};

const mockContext: ExecutorContext = {
  root: '/',
  isVerbose: false,
  workspace: {
    version: 2,
    projects: {},
  },
  cwd: process.cwd(),
  projectName: 'proj',
};

describe('IntegrationTestSuite Executor', () => {
  it('can should invoke the nx:run-commands executor with the commands needed to spawn the regsitry and run jest', async () => {
    await executor(options, mockContext);
    expect(mockNxRunCommandsExecutor).toHaveBeenNthCalledWith(
      1,
      {
        parallel: false,
        cwd: options.cwd,
        commands: ['npx jest libs/proj/src/lib/proj.spec.ts'],
        __unparsed__: [],
      },
      mockContext,
    );

    await executor(
      {
        ...options,
        withRegistry: true,
      },
      mockContext,
    );
    expect(mockNxRunCommandsExecutor).toHaveBeenNthCalledWith(
      2,
      {
        parallel: false,
        cwd: options.cwd,
        commands: [
          'npx nx spawn-and-populate-local-registry integration-tests',
          'npx jest libs/proj/src/lib/proj.spec.ts',
        ],
        __unparsed__: [],
      },
      mockContext,
    );

    await executor(
      {
        ...options,
        withRegistry: true,
        updateSnapshots: true,
      },
      mockContext,
    );
    expect(mockNxRunCommandsExecutor).toHaveBeenNthCalledWith(
      3,
      {
        parallel: false,
        cwd: options.cwd,
        commands: [
          'npx nx spawn-and-populate-local-registry integration-tests',
          'npx jest libs/proj/src/lib/proj.spec.ts -u',
        ],
        __unparsed__: [],
      },
      mockContext,
    );
  });
});
