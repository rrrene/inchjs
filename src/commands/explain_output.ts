import { relative } from 'path';

import chalk from 'chalk';

import { ExplainCommandResult } from './explain';
import { CodeObjectWithRolesAndEvalutation, CodeObjectRole } from '../contracts/code_object';
import { EDGE } from '../contracts/output';
import {
  ROLE_WITH_DOC,
  ROLE_WITHOUT_DOC,
  ROLE_WITH_MANY_CHILDREN,
  ROLE_WITH_CHILDREN,
  ROLE_WITHOUT_CHILDREN,
  ROLE_WITH_MANY_PARAMETERS,
  ROLE_WITH_PARAMETERS,
  ROLE_WITHOUT_PARAMETERS,
  ROLE_WITH_PARAMETER_MENTION,
  ROLE_WITHOUT_PARAMETER_MENTION,
  ROLE_WITH_MULTIPLE_CODE_EXAMPLES,
  ROLE_WITH_CODE_EXAMPLE,
  ROLE_WITHOUT_CODE_EXAMPLE,
} from '../roles';

type RoleExplanation = {
  title: string;
  score: string;
};

const DEFAULT_TITLE = 'DEFAULT_TITLE';
const DEFAULT_TITLE_COLUMN_WIDTH = 50;

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
  commandResult.codeObjects.forEach((codeObject: CodeObjectWithRolesAndEvalutation) => outputTextFor(codeObject));
}

function outputTextFor(codeObject: CodeObjectWithRolesAndEvalutation): void {
  const relativeFilename = relative(process.cwd(), codeObject.location.filename);

  console.log(chalk.bgAnsi256(214).ansi256(214)(`#`) + chalk.bgAnsi256(214).gray.dim(` ${codeObject.name}`.padEnd(80)));
  console.log(chalk.ansi256(214)(`${EDGE} `) + chalk.dim(`${relativeFilename}:${codeObject.location.line}`));
  console.log(
    chalk.yellow.dim(`${EDGE} -------------------------------------------------------------------------------`)
  );

  explainRoles(codeObject);
}

function explainRoles(codeObject: CodeObjectWithRolesAndEvalutation): void {
  const roleExplanations = codeObject.roles
    .filter(
      (role: CodeObjectRole) =>
        (role.score != null && role.score > 0) || (role.potentialScore != null && role.potentialScore > 0)
    )
    .map((role: CodeObjectRole): RoleExplanation => getRoleExplanation(role));

  const longestLabelLength = roleExplanations
    .map((roleExplanation) => roleExplanation.title.length)
    .sort()
    .reverse()[0];
  const titleColumnWidth = Math.max(DEFAULT_TITLE_COLUMN_WIDTH, longestLabelLength);

  roleExplanations.forEach((roleExplanation: RoleExplanation) => {
    explainRole(roleExplanation, longestLabelLength);
  });

  console.log(
    chalk.yellow.dim(`${EDGE} -------------------------------------------------------------------------------`)
  );

  const title = 'Score (min: 0, max: 100)';
  const scoreTotal = `${codeObject.score}`;
  console.log(chalk.yellow.dim(`${EDGE} `) + chalk.dim(title.padEnd(titleColumnWidth) + scoreTotal.padStart(8)));
  console.log(chalk.yellow.dim(`${EDGE}`));
}

function explainRole(roleExplanation: RoleExplanation, titleColumnWidth: number): void {
  const { title, score } = roleExplanation;

  console.log(chalk.yellow.dim(`${EDGE} `) + chalk.dim(title.padEnd(titleColumnWidth) + score.padStart(8)));
}

function getRoleExplanation(role: CodeObjectRole): RoleExplanation {
  const title = getRoleExplanationTitle(role);
  const hasPotentialScore = role.potentialScore != null && role.potentialScore > 0;
  const score = hasPotentialScore ? `(${role.potentialScore})` : `${role.score}`;

  return { title, score };
}

function getRoleExplanationTitle(role: CodeObjectRole): string {
  const titleFns = {};
  titleFns[DEFAULT_TITLE] = (metadata: any) => `<<Missing title for role \`#{inspect(role_tuple)}\`>>`;
  titleFns[ROLE_WITH_DOC] = () => 'Has documentation';
  titleFns[ROLE_WITHOUT_DOC] = () => 'Misses documentation';

  titleFns[ROLE_WITH_MANY_CHILDREN] = () => 'Has many children';
  titleFns[ROLE_WITH_CHILDREN] = () => 'Has children';
  titleFns[ROLE_WITHOUT_CHILDREN] = () => 'Has no children';

  titleFns[ROLE_WITH_MANY_PARAMETERS] = () => 'Has many parameters';
  titleFns[ROLE_WITH_PARAMETERS] = () => 'Has parameters';
  titleFns[ROLE_WITHOUT_PARAMETERS] = () => 'Has no parameters';

  titleFns[ROLE_WITH_PARAMETER_MENTION] = ({ name }) => `Mentions function parameter \`${name}\``;
  titleFns[ROLE_WITHOUT_PARAMETER_MENTION] = ({ name }) => `Misses mentioning function parameter \`${name}\``;

  titleFns[ROLE_WITH_MULTIPLE_CODE_EXAMPLES] = () => 'Has multiple code examples';
  titleFns[ROLE_WITH_CODE_EXAMPLE] = () => 'Has code example';
  titleFns[ROLE_WITHOUT_CODE_EXAMPLE] = () => 'Misses a code example';

  const titleFn = titleFns[role.id] || titleFns[DEFAULT_TITLE];
  const title = titleFn.apply(null, [role.metadata]);

  return title;
}
