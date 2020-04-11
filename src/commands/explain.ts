import * as fs from 'fs';
import * as path from 'path';

import { getDocs } from '../docs';
import { addRoles } from '../roles';
import { addEvaluation } from '../evaluation';
import { CodeObjectWithRolesAndEvalutation, CodeObjectLocation, CodeObjectRole } from '../contracts/code_object';
import { output } from './explain_output';
import { getRoleScore } from '../evaluation/scores';

type ExplainCliArgs = any;

export type ExplainCommandResult = {
  codeObjects: any;
};

export async function run(args: ExplainCliArgs) {
  const location = args._[0];

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
  const codeObjectsToExplain = allCodeObjects
    .filter((codeObject: CodeObjectWithRolesAndEvalutation) => matchesLocation(codeObject.location, location))
    .map((codeObject: CodeObjectWithRolesAndEvalutation) => addScoreExplanation(codeObject));

  const commandResult: ExplainCommandResult = {
    codeObjects: codeObjectsToExplain,
  };

  output(commandResult, args.format);
}

function addScoreExplanation(codeObject: CodeObjectWithRolesAndEvalutation) {
  return {
    ...codeObject,
    roles: codeObject.roles.map((role: CodeObjectRole) => addScoreExplanationToRole(role, codeObject)),
  };
}

function addScoreExplanationToRole(role: CodeObjectRole, codeObject: CodeObjectWithRolesAndEvalutation) {
  const score = getRoleScore(codeObject.type, role, codeObject);
  let potentialScore = 0;

  const isRoleWithPotentialScore = role.id.startsWith('without');
  if (isRoleWithPotentialScore) {
    const roleWithPotential = { ...role, id: role.id.replace(/^without/, 'with') };
    potentialScore = getRoleScore(codeObject.type, roleWithPotential, codeObject);
  }

  return { ...role, score, potentialScore };
}

function matchesLocation(codeObjectLocation: CodeObjectLocation, locationAsString: string): boolean {
  const locationParts = locationAsString.split(':');
  const pathPart = locationParts[0];
  const lineNumber = parseInt(locationParts[1]);

  const absoluteFilename = path.resolve(pathPart);

  return codeObjectLocation.filename === absoluteFilename && codeObjectLocation.line === lineNumber;
}

function getPath(args: ExplainCliArgs): string {
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
