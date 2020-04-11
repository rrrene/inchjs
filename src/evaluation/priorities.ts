import { CodeObjectWithRoles, CodeObjectRole } from '../contracts/code_object';
import {
  ROLE_WITH_MANY_PARAMETERS,
  ROLE_WITH_MANY_CHILDREN,
  ROLE_NOT_EXPORTED,
  ROLE_MARKED_AS_PRIVATE,
} from '../roles';

const ROLE_PRIORITIES = {};

ROLE_PRIORITIES[ROLE_WITH_MANY_CHILDREN] = +2;
ROLE_PRIORITIES[ROLE_WITH_MANY_PARAMETERS] = +2;
ROLE_PRIORITIES[ROLE_NOT_EXPORTED] = -2;
ROLE_PRIORITIES[ROLE_MARKED_AS_PRIVATE] = -4;

export function getPriority(codeObject: CodeObjectWithRoles, allCodeObjects: CodeObjectWithRoles[]): number {
  return codeObject.roles.reduce((memo: number, role: CodeObjectRole) => {
    return memo + getRolePriority(codeObject.type, role);
  }, 0);
}

/**
 * Returns an arrow character visually representing the given `priority`.
 */
export function getPriorityArrow(priority: number): string {
  if (priority >= 4) {
    return '\u2191';
  } else if (priority >= 2) {
    return '\u2197';
  } else if (priority >= 0) {
    return '\u2192';
  } else if (priority >= -2) {
    return '\u2198';
  }

  return '\u2193';
}

function getRolePriority(type: string, role: CodeObjectRole): number {
  const scorer = ROLE_PRIORITIES[role.id];
  if (typeof scorer === 'number') {
    return scorer;
  }

  return 0;
}
