import { ExplainCommandResult } from './explain';

export function output(codeObjectsToDisplay: ExplainCommandResult, format: string): void {
  if (format === 'json') {
    outputJson(codeObjectsToDisplay);
  } else {
    outputText(codeObjectsToDisplay);
  }
}

function outputJson(commandResult: ExplainCommandResult): void {
  console.log(JSON.stringify(commandResult, null, 2));
}

function outputText(commandResult: ExplainCommandResult): void {
  console.log('No text output, yet.');
}
