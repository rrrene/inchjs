import * as InfoCommand from './commands/InfoCommand';
import * as SuggestCommand from './commands/suggest';

const yargsParser = require('yargs-parser');

type CommandHandler = any;

const COMMAND_HANDLER = {
  info: InfoCommand,
  suggest: SuggestCommand,
};
const DEFAULT_COMMAND = SuggestCommand;

/**
 * Invokes the CLI.
 *
 */
export async function main(argv) {
  const commandHandler = determine_command(argv);
  const args = yargsParser(argv, { alias: { help: ['h'] } });

  if (commandHandler == null) {
    console.error('Could not find command handler.');
    process.exit(1);
  }

  await commandHandler.run(args);
}

function determine_command(argv): CommandHandler {
  const firstArg = argv[0];

  if (isFilenameWithLineNumber(firstArg)) {
    console.error('explain command not yet implemented');
    process.exit(1);
  }

  return COMMAND_HANDLER[firstArg] || DEFAULT_COMMAND;
}

/**
 * Internal: used by cli module.
 */
export function isFilenameWithLineNumber(filename: string): boolean {
  if (filename == null) {
    return false;
  }

  const colonAndNumberAtTheEnd = filename.match(/\:\d+$/) != null;

  return colonAndNumberAtTheEnd;
}
