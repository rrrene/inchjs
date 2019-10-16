import { CodeObject, CodeObjectWithRoles, CodeObjectRole } from './contracts/code_object';

export const ROLE_WITH_DOC = 'withDoc';
export const ROLE_WITHOUT_DOC = 'withoutDoc';

const THRESHOLD_WITH_MANY_CHILDREN = 20;
export const ROLE_WITH_MANY_CHILDREN = 'withManyChildren';
export const ROLE_WITH_CHILDREN = 'withChildren';
export const ROLE_WITHOUT_CHILDREN = 'withoutChildren';

const THRESHOLD_WITH_MANY_PARAMETERS = 5;
export const ROLE_WITH_MANY_PARAMETERS = 'withManyParameters';
export const ROLE_WITH_PARAMETERS = 'withParameters';
export const ROLE_WITHOUT_PARAMETERS = 'withoutParameters';

export const ROLE_EXPORTED = 'exported';
export const ROLE_NOT_EXPORTED = 'notExported';

export function addRoles(codeObjects: CodeObject[]): CodeObjectWithRoles[] {
  return codeObjects.map((codeObject) => {
    const roles = getRoles(codeObject, codeObjects);

    return { ...codeObject, roles };
  });
}

export function hasRole(codeObject: CodeObjectWithRoles, id: string): boolean {
  return codeObject.roles.some((role: CodeObjectRole) => role.id === id);
}

function getRoles(codeObject: CodeObject, allCodeObjects: CodeObject[]): CodeObjectRole[] {
  const foundRules = [
    // inRoot(codeObject),
    getRolesForWithOrWithoutDoc(codeObject),
    // withOrWithoutCodeExample(codeObject),
    getRolesForChildren(codeObject),
    getRolesForParameters(codeObject),
    getRolesForExported(codeObject)
    // name(codeObject),
    // metadata(codeObject),
    // functionParameterWithWithoutMention(codeObject)
  ];
  const roles = foundRules.filter((role: CodeObjectRole | null) => role != null);

  return roles as CodeObjectRole[];
}

function getRolesForWithOrWithoutDoc(codeObject: CodeObject): CodeObjectRole | null {
  const hasDoc = codeObject.doc != null && codeObject.doc.trim() != '';

  return { id: hasDoc ? ROLE_WITH_DOC : ROLE_WITHOUT_DOC };
}

function getRolesForParameters(codeObject: CodeObject): CodeObjectRole | null {
  const parameterCount = codeObject.metadata && codeObject.metadata.parameters && codeObject.metadata.parameters.length;
  if (parameterCount == null) {
    return null;
  }

  let id;
  if (parameterCount === 0) {
    id = ROLE_WITHOUT_PARAMETERS;
  } else if (parameterCount < THRESHOLD_WITH_MANY_PARAMETERS) {
    id = ROLE_WITH_PARAMETERS;
  } else {
    id = ROLE_WITH_MANY_PARAMETERS;
  }

  return { id };
}

function getRolesForChildren(codeObject: CodeObject): CodeObjectRole | null {
  const childrenCount = codeObject.metadata && codeObject.metadata.childrenCount;
  if (childrenCount == null) {
    return null;
  }

  let id;
  if (childrenCount === 0) {
    id = ROLE_WITHOUT_CHILDREN;
  } else if (childrenCount < THRESHOLD_WITH_MANY_CHILDREN) {
    id = ROLE_WITH_CHILDREN;
  } else {
    id = ROLE_WITH_MANY_CHILDREN;
  }

  return { id };
}

function getRolesForExported(codeObject: CodeObject): CodeObjectRole | null {
  const isExported = !!codeObject.metadata.isExported;

  return { id: isExported ? ROLE_EXPORTED : ROLE_NOT_EXPORTED };
}
