import * as path from 'path';

import chalk from 'chalk';

import { SuggestCommandResult } from './suggest';
import { getPriorityArrow } from '../evaluation/priorities';
import { getDecriptionForGrade, getColorizeFunForGrade } from '../evaluation/grades';
import { sparkline } from '../sparkline';

import { CodeObjectGrade, CodeObjectWithRolesAndEvalutation, CODE_OBJECT_GRADE_NAMES } from '../contracts/code_object';
import { EDGE } from '../contracts/output';

export function output(codeObjectsToDisplay: SuggestCommandResult, format: string, isStrict: boolean): void {
  if (format === 'json') {
    outputJson(codeObjectsToDisplay);
  } else {
    outputText(codeObjectsToDisplay, isStrict);
  }
}

function outputJson(commandResult: SuggestCommandResult): void {
  const data = {
    results: {
      codeObjectsByGrades: {
        A: deleteMetadataFromCodeObjects(commandResult.codeObjectsByGrades.A),
        B: deleteMetadataFromCodeObjects(commandResult.codeObjectsByGrades.B),
        C: deleteMetadataFromCodeObjects(commandResult.codeObjectsByGrades.C),
        U: deleteMetadataFromCodeObjects(commandResult.codeObjectsByGrades.U),
      },
      filenames: commandResult.filenames,
      gradeDistribution: commandResult.gradeDistribution,
    },
  };
  const output = JSON.stringify(data, null, 2);

  console.log(output);
}

function deleteMetadataFromCodeObjects(codeObjects: CodeObjectWithRolesAndEvalutation[]): any {
  return codeObjects.map((codeObject: CodeObjectWithRolesAndEvalutation): any => {
    const clonedCodeObject = { ...codeObject };
    delete clonedCodeObject.metadata;
    return clonedCodeObject;
  });
}

function outputText(commandResult: SuggestCommandResult, isStrict: boolean): void {
  outputGradeSections(commandResult);
  outputFilenames(commandResult.filenames);
  outputIssueHint();
  outputGradeDistribution(commandResult);
  if (!isStrict) {
    outputPriorityHint();
  }
}

function outputGradeSections(commandResult: SuggestCommandResult): void {
  const baseDir = process.cwd();

  const codeObjectsToDisplay = commandResult.codeObjectsByGrades;

  Object.keys(codeObjectsToDisplay).forEach((grade) => {
    const codeObjectsForGrade = codeObjectsToDisplay[grade];

    if (codeObjectsForGrade.length === 0) {
      return;
    }

    const gradeDescription = getDecriptionForGrade(grade as CodeObjectGrade);
    const colorizeFun = getColorizeFunForGrade(grade);

    console.log('');
    console.log(colorizeFun(`# ${gradeDescription}`));
    console.log(colorizeFun(`${EDGE}`));
    codeObjectsForGrade.forEach((codeObject: CodeObjectWithRolesAndEvalutation) => {
      const grade = `[${codeObject.grade}]`;
      const arrow = getPriorityArrow(codeObject.priority);

      const filename = path.relative(baseDir, codeObject.location.filename);
      const location = `(${filename}:${codeObject.location.line})`;

      console.log(colorizeFun(`${EDGE} ${grade} ${chalk.dim(arrow)} ${codeObject.name}`) + chalk.dim(` ${location}`));
    });
  });
}

function outputFilenames(filenames: string[]): void {
  const baseDir = process.cwd();

  if (filenames.length === 0) {
    return;
  }

  console.log('');
  console.log('You might want to look at these files:');
  console.log('');
  filenames.forEach((filename) => {
    const relativeFilename = path.relative(baseDir, filename);
    console.log(chalk.dim(`${EDGE} ${relativeFilename}`));
  });
}

function outputIssueHint(): void {
  console.log('');
  console.log(chalk.dim('Please report incorrect results: https://github.com/rrrene/inchjs/issues'));
}

function outputGradeDistribution(commandResult: SuggestCommandResult): void {
  const grades = sparkline(Object.values(commandResult.gradeDistribution), (value, index, n) => {
    const colorizeFun = getColorizeFunForGrade(CODE_OBJECT_GRADE_NAMES[index]);

    return colorizeFun(value);
  });
  const gradeSparkline = grades.reverse();

  console.log('');
  console.log(`Grade distribution (undocumented, C, B, A): ${gradeSparkline.join(' ')}`);
}

function outputPriorityHint(): void {
  console.log('');
  console.log(chalk.dim('Only considering priority objects: ↑ ↗ →  (use `--help` for options).'));
}
