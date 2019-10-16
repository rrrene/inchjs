import { getTypedocOutputAsObjects } from './docs/typedoc';
import { CodeObject } from './contracts/code_object';

export async function getDocs(codeDir: string, args: any[]): Promise<CodeObject[]> {
  const allCodeObjects = await getTypedocOutputAsObjects(codeDir, args);
  const results = allCodeObjects.filter((codeObject: CodeObject) => codeObject.type !== 'module');
  return results;
}
