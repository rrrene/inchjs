import { CodeObject } from './contracts/code_object';

import { getJsdocOutputAsCodeObjects } from './docs/jsdoc';
import { getTypedocOutputAsCodeObjects } from './docs/typedoc';

const IGNORED_TYPES = ['module', 'variable'];

export async function getDocs(codeDir: string, args: any[]): Promise<CodeObject[]> {
  const javascriptCodeObjects = await getJsdocOutputAsCodeObjects(codeDir, args);
  const typescriptCodeObjects = await getTypedocOutputAsCodeObjects(codeDir, args);

  const allCodeObjects = javascriptCodeObjects.concat(typescriptCodeObjects);

  return filterCodeObjects(allCodeObjects);
}

function filterCodeObjects(codeObjects: CodeObject[]): CodeObject[] {
  return codeObjects.filter((codeObject: CodeObject) => IGNORED_TYPES.includes(codeObject.type) === false);
}
