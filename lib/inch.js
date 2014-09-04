'use strict';

var sys = require('sys'),
    JSDoc = require('../lib/jsdoc_runner'),
    LocalInch = require('../lib/local_inch');

function runSuggest(done) {
  JSDoc.run(done, null, function(filename) {
    LocalInch.run(['suggest'], filename, noop)
  });
}

function runList(done) {
  JSDoc.run(done, null, function(filename) {
    LocalInch.run(['list'], filename, noop)
  });
}

function noop(stdout, stderr) {
}

function puts(stdout, stderr) {
  sys.print(stdout);
}

module.exports = {
  suggest: runSuggest,
  list: runList
}
