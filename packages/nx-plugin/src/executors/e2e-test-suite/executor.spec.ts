import type { ExecutorContext } from 'nx/src/config/misc-interfaces';
import type { E2ETestSuiteExecutorSchema } from './schema';

const mockNxRunCommandsExecutor = jest.fn();

jest.mock(
  'nx/src/executors/run-commands/run-commands.impl',
  () => mockNxRunCommandsExecutor,
);

// Must come after mocking
import executor from './executor';

const options: E2ETestSuiteExecutorSchema = {
  cwd: 'libs/proj',
  testFilePath: 'libs/proj/src/lib/proj.spec.ts',
};

const mockContext: ExecutorContext = {
  root: '/',
  isVerbose: false,
  cwd: process.cwd(),
  projectName: 'proj',
  nxJsonConfiguration: {},
  projectsConfigurations: {
    version: 2,
    projects: {},
  },
  projectGraph: {
    nodes: {},
    externalNodes: {},
    dependencies: {},
  },
};

describe('E2ETestSuite Executor', () => {
  it('can should invoke the nx:run-commands executor with the commands needed to run jest', async () => {
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
        updateSnapshots: true,
      },
      mockContext,
    );
    expect(mockNxRunCommandsExecutor).toHaveBeenNthCalledWith(
      2,
      {
        parallel: false,
        cwd: options.cwd,
        commands: ['npx jest libs/proj/src/lib/proj.spec.ts -u'],
        __unparsed__: [],
      },
      mockContext,
    );
  });
});
