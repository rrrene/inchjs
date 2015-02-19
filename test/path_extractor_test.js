'use strict';

var assert = require("assert");
var PathExtractor = require("../lib/path_extractor.js");

describe('PathExtractor', function(){
  describe('#extractPaths()', function(){
    it('should return something', function(){
      assert.deepEqual(["Gruntfile.js"], PathExtractor.extractPaths(["Gruntfile.js"]));
      assert.deepEqual(["Gruntfile.js"], PathExtractor.extractPaths(["Gruntfile.js", "SomeObject"]));
      assert.deepEqual(null, PathExtractor.extractPaths(["--", "Gruntfile.js"]));
      assert.deepEqual(null, PathExtractor.extractPaths(["somefile.js", "Gruntfile.js"]));
    })
  })
})
