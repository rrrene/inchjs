import { CodeObjectWithRoles, CodeObjectRole } from '../contracts/code_object';
import { hasRole } from '../roles';

const ROLE_SCORES = {
  module: {},

  function: {
    withDoc: (codeObject) => {
      if (hasRole(codeObject, 'withoutParameters')) {
        return SCORES.withDocBase + SCORES.parametersBase;
      }

      return SCORES.withDocBase;
    },
    withParameterMention: (codeObject) => {
      const parameterCount = codeObject.metadata.parameters.length;
      return Math.floor(SCORES.parametersBase / parameterCount);
    }
  }
};

const SCORES = {
  min: 0,
  max: 100,
  withDocBase: 50,
  parametersBase: 40,
  returnType: 10,
  withCodeExample: 10,
  withMultipleCodeExamples: 25,
  withMetadata: 20
};

export function getScore(codeObject: CodeObjectWithRoles, allCodeObjects: CodeObjectWithRoles[]): number {
  return codeObject.roles.reduce((memo: number, role: CodeObjectRole) => {
    return memo + getRoleScore(codeObject.type, role, codeObject);
  }, 0);
}

function getRoleScore(type: string, role: CodeObjectRole, codeObject: CodeObjectWithRoles): number {
  const prioMap = ROLE_SCORES[type];
  if (prioMap) {
    const scorer = prioMap[role.id];
    if (typeof scorer === 'number') {
      return scorer;
    }
    if (typeof scorer === 'function') {
      return scorer(codeObject);
    }
  }

  return 0;
}
