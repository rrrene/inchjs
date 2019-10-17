import * as assert from 'assert';
import { getCodeExamples } from './code_examples';

describe('getCodeExamples()', () => {
  it('gets no examples', () => {
    const contents = `
This is a test.

    `;
    const expected = [];

    assert.deepStrictEqual(getCodeExamples(contents), expected);
  });

  it('gets single example', () => {
    const contents = `
This is a test.

    CodeExample.test()
    `;
    const expected = ['    CodeExample.test()\n'];

    assert.deepStrictEqual(getCodeExamples(contents), expected);
  });

  it('gets multiple examples', () => {
    const contents = `
This is a test.

    CodeExample.test()

    CodeExample2.test2()
`;
    const expected = ['    CodeExample.test()\n', '    CodeExample2.test2()\n'];

    assert.deepStrictEqual(getCodeExamples(contents), expected);
  });

  it('gets no examples from slight indentation', () => {
    const contents = `
This is a test.
  TODO: This is bad!`;
    const expected = [];

    assert.deepStrictEqual(getCodeExamples(contents), expected);
  });
});
