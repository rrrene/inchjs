'use strict';

var formatter = require('./formatter.js'),
    retriever = require('./retriever.js'),
    sys = require('sys'),
    fs = require('fs'),
    sh = require('shelljs'),
    Path = require('path'),
    exec = require('child_process').exec;

function run(jsdoc_args, callback) {
  jsdoc_args = jsdoc_args || retriever.getSourcePaths();

  if( jsdoc_args.length == 0 ) fail("No sources found.");

  var jsdoc_options = "--explain --lenient --recurse";

  var filename = "docs.json",
      cmd = getJSDocCommand()+" " + jsdoc_args.join(' ') + " " + jsdoc_options;

  var child = sh.exec(cmd, {silent: true, async: true});
  var output = "";
  child.stdout.on('data', function(data) {
    output += data;
  });
  child.stdout.on('close', function() {
    try {
      var objects = JSON.parse( output );
    } catch(e) {
      console.log(output);
      fail("Parsing failed.")
    }
    var data = formatter.run(objects, []);
    fs.writeFileSync(filename, JSON.stringify(data));
    callback(filename);
  });
}

function fail(msg) {
  console.error('[InchJS] '+msg);
  process.exit(1);
}

function getJSDocCommand() {
  var inchjs_dir = Path.join(__dirname, '..', '..');
  var finder = "find "+inchjs_dir+" -type l -name jsdoc";
  var out = sh.exec(finder, {silent: true}).output;
  var found = out.split("\n")[0].trim();
  if( found == "" ) {
    throw("Could not find jsdoc executable");
  } else {
    return found;
  }
}

module.exports = {
  run: run
};
