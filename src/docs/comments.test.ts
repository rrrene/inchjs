import * as assert from 'assert';
import { readCommentsFromStringPrecedingLine, removeCommentMarkers } from './comments';

describe('readCommentsFromStringPrecedingLine()', () => {
  it('works with JSDoc style comments', () => {
    const contents = `// Line no 1
    import something from 'somewhere';

    /**
     * This is a test.
     *
     *     CodeExample.test()
     */
    function somethingElse() {
      // ...
    }
    `;
    const comment = `    /**
     * This is a test.
     *
     *     CodeExample.test()
     */`;
    const result = readCommentsFromStringPrecedingLine(contents, 9);
    assert.deepStrictEqual(result, comment);
  });

  it('works with JSDoc style comments which are beginning incorrectly', () => {
    const contents = `// Line no 1
    import something from 'somewhere';

    /*
     * This is a test.
     *
     *     CodeExample.test()
     */
    function somethingElse() {
      // ...
    }
    `;
    const comment = `    /*
     * This is a test.
     *
     *     CodeExample.test()
     */`;
    const result = readCommentsFromStringPrecedingLine(contents, 9);
    assert.deepStrictEqual(result, comment);
  });

  it('works with standard multiline comments', () => {
    const contents = `// Line no 1
    import something from 'somewhere';

    /*
    This is a test.

         CodeExample.test()
    */
    function somethingElse() {
      // ...
    }
    `;
    const comment = `    /*
    This is a test.

         CodeExample.test()
    */`;
    const result = readCommentsFromStringPrecedingLine(contents, 9);
    assert.deepStrictEqual(result, comment);
  });

  it('works with standard line comments', () => {
    const contents = `// Line no 1
    import something from 'somewhere';

    //
    // This is a test.
    //
    //     CodeExample.test()
    //
    function somethingElse() {
      // ...
    }
    `;
    const comment = `    //
    // This is a test.
    //
    //     CodeExample.test()
    //`;
    const result = readCommentsFromStringPrecedingLine(contents, 9);
    assert.deepStrictEqual(result, comment);
  });
});

describe('removeCommentMarkers()', () => {
  it('removes markers from JSDoc style comments', () => {
    const contents = `    /**
     * This is a test.
     *
     *     CodeExample.test()
     */`;
    const comment = `This is a test.

    CodeExample.test()`;

    assert.deepStrictEqual(removeCommentMarkers(contents), comment);
  });

  it('removes markers from JSDoc style comments which are beginning incorrectly', () => {
    const contents = `    /*
     * This is a test.
     *
     *     CodeExample.test()
     */`;
    const comment = `This is a test.

    CodeExample.test()`;

    assert.deepStrictEqual(removeCommentMarkers(contents), comment);
  });

  it('removes markers from standard line comments and keeps leading/trailing empty lines marked as a comment', () => {
    const contents = `
    //
    // This is a test.
    //
    //     CodeExample.test()
    //`;
    const comment = `
This is a test.

    CodeExample.test()
`;

    assert.deepStrictEqual(removeCommentMarkers(contents), comment);
  });

  it('removes markers from standard multiline comments', () => {
    const contents = `
    /* This is a test.
        TODO: This is bad! */`;
    const comment = `This is a test.
 TODO: This is bad!`;

    assert.deepStrictEqual(removeCommentMarkers(contents), comment);
  });
});
