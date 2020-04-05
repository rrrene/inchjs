import * as fs from 'fs';
import * as path from 'path';

import { CodeObjectWithRolesAndEvalutation } from '../contracts/code_object';

import { getDocs } from '../docs';
import { addRoles } from '../roles';
import { addEvaluation } from '../evaluation';

import { output } from './suggest_output';

type CodeObjectsGroupedByGrade = {
  A: CodeObjectWithRolesAndEvalutation[];
  B: CodeObjectWithRolesAndEvalutation[];
  C: CodeObjectWithRolesAndEvalutation[];
  U: CodeObjectWithRolesAndEvalutation[];
};
type CodeObjectGradeDistribution = {
  A: number;
  B: number;
  C: number;
  U: number;
};

export type SuggestCommandResult = {
  codeObjectsByGrades: any;
  filenames: string[];
  gradeDistribution: CodeObjectGradeDistribution;
};

type SuggestCliArgs = any;

const MAX_PER_GRADE = 5;
const MAX_FILES = 3;

export async function run(args: SuggestCliArgs) {
  // TODO: should we pass args from argv to jsdoc?
  const codePath = getPath(args);
  const codeObjectsWithoutEvaluation = await getDocs(codePath, []);

  const codeObjectsWithRoles = addRoles(codeObjectsWithoutEvaluation);
  // TODO: hook to add more roles

  const codeObjectsWithRolesAndEvaluation = addEvaluation(codeObjectsWithRoles);
  // TODO: hook to add more evaluation

  const codeObjectsWithMinimumPriority = codeObjectsWithRolesAndEvaluation.filter(
    // TODO: implement me
    (codeObject) => codeObject.priority >= -999
  );

  const allCodeObjects = codeObjectsWithMinimumPriority;
  const codeObjectsGroupedByGrade = groupByGrade(allCodeObjects);
  const codeObjectsGroupedByGradeToDisplay = limitPerGrade(codeObjectsGroupedByGrade, MAX_PER_GRADE);

  const commandResult: SuggestCommandResult = {
    codeObjectsByGrades: codeObjectsGroupedByGradeToDisplay,
    filenames: getFilenames(allCodeObjects),
    gradeDistribution: getGradeDistribution(codeObjectsGroupedByGrade),
  };

  output(commandResult, args.format, !!args.strict);
}

function getFilenames(codeObjects: CodeObjectWithRolesAndEvalutation[]): string[] {
  const filenamesAndCounts = countByFilename(codeObjects);
  return filenamesAndCounts
    .reverse()
    .map((countObject: any) => countObject.filename)
    .slice(0, MAX_FILES);
}

function getGradeDistribution(groupedCodeObjects: CodeObjectsGroupedByGrade): CodeObjectGradeDistribution {
  return {
    A: groupedCodeObjects.A.length,
    B: groupedCodeObjects.B.length,
    C: groupedCodeObjects.C.length,
    U: groupedCodeObjects.U.length,
  };
}

function groupByGrade(codeObjects: CodeObjectWithRolesAndEvalutation[]): CodeObjectsGroupedByGrade {
  const result: CodeObjectsGroupedByGrade = { A: [], B: [], C: [], U: [] };

  codeObjects.forEach((codeObject: CodeObjectWithRolesAndEvalutation) => result[codeObject.grade].push(codeObject));

  return result;
}

function countByFilename(codeObjects: CodeObjectWithRolesAndEvalutation[]): any {
  const groupedByFilename: any = {};

  codeObjects.forEach((codeObject: CodeObjectWithRolesAndEvalutation) => {
    const filename = codeObject.location.filename;
    groupedByFilename[filename] = (groupedByFilename[filename] || 0) + 1;
  });

  const countObjects = Object.keys(groupedByFilename).map((filename: string) => {
    return { filename: filename, count: groupedByFilename[filename] };
  });

  return countObjects.sort((a: any, b: any) => a.count - b.count);
}

function getPath(args: SuggestCliArgs): string {
  const arr = [...args._];
  if (arr[0] === 'suggest') {
    arr.shift();
  }

  if (arr[0]) {
    const pathCandidate = path.resolve(arr[0]);
    if (fs.existsSync(pathCandidate)) {
      return pathCandidate;
    }
  }

  return '.';
}

function limitPerGrade(groupedCodeObjects: CodeObjectsGroupedByGrade, limit: number): CodeObjectsGroupedByGrade {
  return {
    A: sortByPrioAndLimit(groupedCodeObjects.A, limit),
    B: sortByPrioAndLimit(groupedCodeObjects.B, limit),
    C: sortByPrioAndLimit(groupedCodeObjects.C, limit),
    U: sortByPrioAndLimit(groupedCodeObjects.U, limit),
  };
}

function sortByPrioAndLimit(
  codeObjects: CodeObjectWithRolesAndEvalutation[],
  limit: number
): CodeObjectWithRolesAndEvalutation[] {
  const sortedAsc = codeObjects.sort(
    (a: CodeObjectWithRolesAndEvalutation, b: CodeObjectWithRolesAndEvalutation) => a.priority - b.priority
  );

  return sortedAsc.reverse().slice(0, limit);
}
