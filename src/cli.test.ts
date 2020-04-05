import * as assert from 'assert';

import { isFilenameWithLineNumber } from './cli';

describe('isFilenameWithLineNumber()', () => {
  it('works with relative linux paths', () => {
    assert.strictEqual(isFilenameWithLineNumber('src/inchjs/foo.js:39:8'), true);
    assert.strictEqual(isFilenameWithLineNumber('src/inchjs/foo.js:39'), true);
    assert.strictEqual(isFilenameWithLineNumber('src/inchjs/foo.js'), false);
  });

  it('works with windows paths', () => {
    assert.strictEqual(isFilenameWithLineNumber('C:/InchJS/foo.js:39:8'), true);
    assert.strictEqual(isFilenameWithLineNumber('C:/InchJS/foo.js:39'), true);
    assert.strictEqual(isFilenameWithLineNumber('C:/InchJS/foo.js'), false);
  });
});
