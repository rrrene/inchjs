'use strict';

var sys = require('sys'),
    JSDoc = require('../lib/jsdoc_runner'),
    LocalInch = require('../lib/local_inch');

function run(inch_args) {
  var filename = JSDoc.run();
  LocalInch.run(inch_args || ['suggest'], filename, noop);
}

function runSuggest(done, inch_args) {
  var filename = JSDoc.run();
  LocalInch.run(inch_args || ['suggest'], filename, noop);
}

function runList(done, inch_args) {
  var filename = JSDoc.run();
  LocalInch.run(inch_args || ['list'], filename, noop);
}

function noop(stdout, stderr) {
}

function puts(stdout, stderr) {
  sys.print(stdout);
}

module.exports = {
  run: run,
  suggest: runSuggest,
  list: runList
}
