'use strict';

var sys = require('sys'),
    retriever = require('./docs/jsdoc_runner'),
    config = require('../package.json'),
    LocalInch = require('./reporter/local');

function run(inch_args) {
  var filename = retriever.run();
  LocalInch.run(inch_args || ['suggest'], filename, noop);
}

function runSuggest(done, inch_args) {
  var filename = retriever.run();
  LocalInch.run(inch_args || ['suggest'], filename, noop);
}

function runList(done, inch_args) {
  var filename = retriever.run();
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
  list: runList,

  version: config.version
}
