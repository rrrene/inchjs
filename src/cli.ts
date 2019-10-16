import * as InfoCommand from './commands/InfoCommand';
import * as SuggestCommand from './commands/suggest';

const yargsParser = require('yargs-parser');

type CommandHandler = any;

const COMMAND_HANDLER = {
  info: InfoCommand,
  suggest: SuggestCommand
};
const DEFAULT_COMMAND = SuggestCommand;

/**
 * Invokes the CLI.
 *
 */
export async function main(argv) {
  const args = yargsParser(argv, { alias: { help: ['h'] } });
  const commandHandler = determine_command(argv);

  if (commandHandler == null) {
    console.error('Could not find command handler.');
    process.exit(1);
  }

  await commandHandler.run(args);
}

function determine_command(argv): CommandHandler {
  const firstArg = argv[0];

  return COMMAND_HANDLER[firstArg] || DEFAULT_COMMAND;
}
