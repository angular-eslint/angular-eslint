import type { ExecutorContext } from 'nx/src/config/misc-interfaces';
import runCommands from 'nx/src/executors/run-commands/run-commands.impl';
import type { E2ETestSuiteExecutorSchema } from './schema';

export default async function runExecutor(
  options: E2ETestSuiteExecutorSchema,
  context: ExecutorContext,
) {
  const updateSnapshots = options.updateSnapshots ?? false;

  return runCommands(
    {
      parallel: false,
      cwd: options.cwd,
      commands: [
        `npx jest ${options.testFilePath}${updateSnapshots ? ' -u' : ''}`,
      ].filter(Boolean) as string[],
      __unparsed__: [],
    },
    context,
  );
}
