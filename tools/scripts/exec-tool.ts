#!/usr/bin/env ts-node

import {
  checkReadme,
  updateReadme,
} from '~tools/scripts/generate-rules-list/generate-rules-list';

const [node, execTool, command] = process.argv;

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exitCode = 1;
});

/**
 * @description
 * Executes the specified command.
 */
const execute = async (command: string) => {
  const commandHandlers = {
    'check-readme': checkReadme,
    'update-readme': updateReadme,
  };

  const commandToExecute = commandHandlers[command];

  if (commandToExecute) {
    const success = await commandToExecute();

    process.exitCode = success ? 0 : 1;
  } else {
    throw new TypeError(
      `'${command}' is not a recognized command. Available commands: [${Object.keys(
        commandHandlers,
      ).join(', ')}]`,
    );
  }
};

execute(command);
