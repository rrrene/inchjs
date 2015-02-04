'use strict';

var sys = require('sys'),
    retriever = require('./docs/jsdoc_runner'),
    inch_config = require('../package.json'),
    LocalInch = require('./reporter/local'),
    RemoteInch = require('./reporter/remote');

// Vaporware/Internal:
// Generates a report for Inch CI.
function report() {
  retriever.run(null, function(filename) {
    RemoteInch.run(filename, noop);
  });
}

// Runs a local version of Inch.
function run(inch_args, options) {
  var callback = function(filename) {
      LocalInch.run(inch_args || ['suggest'], filename, noop);
    }

  if( options.dry_run ) callback = noop;
  retriever.run(null, callback);
}

function runSuggest(done, inch_args) {
  var filename = retriever.run();
  LocalInch.run(inch_args || ['suggest'], filename, noop);
}

function runList(done, inch_args) {
  var filename = retriever.run();
  LocalInch.run(inch_args || ['list'], filename, noop);
}

// @private
function noop(stdout, stderr) {
}

// Puts the given string +stdout+ to stdout.
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
