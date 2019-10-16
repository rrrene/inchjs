import { CodeObjectWithRolesAndEvalutation, CodeObjectWithRoles } from './contracts/code_object';

import { getGrade } from './evaluation/grades';
import { getPriority } from './evaluation/priorities';
import { getScore } from './evaluation/scores';

export function addEvaluation(codeObjectsWithRoles: CodeObjectWithRoles[]): CodeObjectWithRolesAndEvalutation[] {
  return codeObjectsWithRoles.map((codeObject) => {
    const priority = getPriority(codeObject, codeObjectsWithRoles);
    const score = getScore(codeObject, codeObjectsWithRoles);
    const grade = getGrade(score);
    return { ...codeObject, priority, score, grade };
  });
}
