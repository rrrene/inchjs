'use strict';

var sys = require('sys'),
    retriever = require('./docs/jsdoc_runner'),
    inch_config = require('../package.json'),
    LocalInch = require('./reporter/local'),
    RemoteInch = require('./reporter/remote');

function report() {
  retriever.run(null, function(filename) {
    RemoteInch.run(filename, noop);
  });
}

function run(inch_args) {
  retriever.run(null, function(filename) {
    LocalInch.run(inch_args || ['suggest'], filename, noop);
  });
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
  report: report,
  run: run,
  suggest: runSuggest,
  list: runList,

  version: inch_config.version
}
