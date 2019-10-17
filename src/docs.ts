import { getTypedocOutputAsObjects } from './docs/typedoc';
import { CodeObject } from './contracts/code_object';

const IGNORED_TYPES = ['module', 'variable'];

export async function getDocs(codeDir: string, args: any[]): Promise<CodeObject[]> {
  const allCodeObjects = await getTypedocOutputAsObjects(codeDir, args);

  return filterCodeObjects(allCodeObjects);
}

function filterCodeObjects(codeObjects: CodeObject[]): CodeObject[] {
  return codeObjects.filter((codeObject: CodeObject) => IGNORED_TYPES.includes(codeObject.type) === false);
}
