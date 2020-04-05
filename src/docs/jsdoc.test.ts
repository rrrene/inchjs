import * as assert from 'assert';
import { writeFileSync } from 'fs';
import * as path from 'path';

import { getJsdocOutputAsObjects, mapAndReduceJsdocObjects } from './jsdoc';
import { CodeObject } from '../contracts/code_object';

export const PARAM_TAG_FIXTURE = `
/**
 * Maps an object.
 *
 * @param jsdocObject test
 */
function mapJsdocObject(jsdocObject, srcBasedir) {
}
`;

export async function convertJsScriptToCodeObject(source: string): Promise<CodeObject> {
  const filename = path.resolve('.inch.fixture.js');
  writeFileSync(filename, source);

  const jsdocObjectRoot = await getJsdocOutputAsObjects(filename);

  const results = mapAndReduceJsdocObjects(jsdocObjectRoot, process.cwd());

  if (results.length !== 1) {
    throw new Error(`Expected a single jsdoc object as result, got ${results.length}.`);
  }

  return results[0];
}

describe('mapAndReduceJsdocObjects()', () => {
  it('works with JSDoc style comments', async () => {
    const codeObject = await convertJsScriptToCodeObject(PARAM_TAG_FIXTURE);

    assert.deepStrictEqual(codeObject.name, 'mapJsdocObject');
  });
});
