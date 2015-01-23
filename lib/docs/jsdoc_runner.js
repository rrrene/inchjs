'use strict';

var DEFAULT_ARGS = ['lib/', 'src/'],
    formatter = require('./formatter.js'),
    sys = require('sys'),
    fs = require('fs'),
    sh = require('shelljs'),
    Path = require('path'),
    exec = require('child_process').exec;

function run(jsdoc_args, callback) {
  jsdoc_args = jsdoc_args || getDefaultJSDocArgs();
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
      console.log("[InchJS] Parsing failed.")
      process.exit(1);
    }
    var data = formatter.run(objects, []);
    fs.writeFileSync(filename, JSON.stringify(data));
    callback(filename);
  });
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

/** Returns an Array of default arguments for JSDOC. */
function getDefaultJSDocArgs() {
  var results = [];
  DEFAULT_ARGS.forEach(function(dir) {
    if( fs.existsSync(dir) ) results.push(dir);
  });
  return results;
}

module.exports = {
  run: run
};
