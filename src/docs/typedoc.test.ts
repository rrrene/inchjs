import * as assert from 'assert';
import { writeFileSync } from 'fs';
import * as path from 'path';

import { getTypedocOutputAsTypedocObject, mapAndReduceTypedocObjects, TypedocObject } from './typedoc';
import { CodeObject } from '../contracts/code_object';

export const PARAM_TAG_FIXTURE = `
/**
 * Maps an object.
 *
 * @param typedocObject test
 */
function mapTypedocObject(typedocObject: TypedocObject, srcBasedir: string): CodeObject | null {
}
`;

export async function convertTypeScriptToCodeObject(source: string): Promise<CodeObject> {
  const filename = path.resolve('.inch.fixture.ts');
  writeFileSync(filename, source);

  const typedocObjectRoot = await getTypedocOutputAsTypedocObject(filename);

  const results = mapAndReduceTypedocObjects(typedocObjectRoot, process.cwd());

  // remove the root object injected by `typedoc`
  results.shift();

  if (results.length !== 1) {
    throw new Error(`Expected a single typedoc object as result, got ${results.length}.`);
  }

  return results[0];
}

describe('mapAndReduceTypedocObjects()', () => {
  it('works with JSDoc style comments', async () => {
    const codeObject = await convertTypeScriptToCodeObject(PARAM_TAG_FIXTURE);

    assert.deepStrictEqual(codeObject.name, 'mapTypedocObject');
  });
});
