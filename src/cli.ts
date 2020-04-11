import * as SuggestCommand from './commands/suggest';
import * as ExplainCommand from './commands/explain';

const yargsParser = require('yargs-parser');

type CommandHandler = any;

const COMMAND_HANDLER = {
  suggest: SuggestCommand,
  explain: ExplainCommand,
};
const DEFAULT_COMMAND = SuggestCommand;

/**
 * Invokes the CLI.
 *
 */
export async function main(argv) {
  const commandHandler = determineCommand(argv);
  const args = yargsParser(argv, { alias: { help: ['h'] } });

  if (commandHandler == null) {
    console.error('Could not find command handler.');
    process.exit(1);
  }

  await commandHandler.run(args);
}

function determineCommand(argv): CommandHandler {
  const firstArg = argv[0];

  if (isFilenameWithLineNumber(firstArg)) {
    return COMMAND_HANDLER.explain;
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
