import { CodeObject, CodeObjectRole } from '../contracts/code_object';
import { ROLE_WITHOUT_CODE_EXAMPLE, ROLE_WITH_CODE_EXAMPLE, ROLE_WITH_MULTIPLE_CODE_EXAMPLES } from '../roles';

const CODE_EXAMPLE_REGEX = /(^    \S+.+\n){1,}/gm;

export function getRolesForWithOrWithoutCodeExamples(codeObject: CodeObject): CodeObjectRole | null {
  const codeExampleCount = getCodeExamples(codeObject.doc).length;
  if (codeExampleCount == null) {
    return null;
  }

  let id;
  if (codeExampleCount === 0) {
    id = ROLE_WITHOUT_CODE_EXAMPLE;
  } else if (codeExampleCount === 1) {
    id = ROLE_WITH_CODE_EXAMPLE;
  } else {
    id = ROLE_WITH_MULTIPLE_CODE_EXAMPLES;
  }

  return { id };
}

/**
 * Internal: Extracts code examples from a docstring
 */
export function getCodeExamples(doc: string): string[] {
  const result2 = doc.match(CODE_EXAMPLE_REGEX);
  if (result2 == null) {
    return [];
  }

  return result2.slice(0);
}
