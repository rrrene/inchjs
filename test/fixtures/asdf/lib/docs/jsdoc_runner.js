'use strict';

var formatter = require('./formatter.js'),
    retriever = require('./retriever.js'),
    fs = require('fs'),
    sh = require('shelljs'),
    Path = require('path'),
    exec = require('child_process').exec;

function run(jsdoc_args, callback) {
  checkJSDocExistance();

  jsdoc_args = jsdoc_args || [];

  if( jsdoc_args.length == 0 && retriever.getIncluded().length == 0 ) {
    fail("No sources found.");
  }

  var jsdoc_options = "--explain --lenient --recurse --configure "+getJSDocConfigFilename();

  var filename = "docs.json",
      cmd = "jsdoc " + jsdoc_args.join(' ') + " " + jsdoc_options;

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

function checkJSDocExistance() {
  try {
    require('jsdoc/package.json');
  } catch(e) {
    throw("Could not find jsdoc executable");
  }
}

function getJSDocConfigFilename() {
  var filename = ".inch.config.json";
  var data = {
    "source": {
      "include": retriever.getIncluded(),
      "exclude": retriever.getExcluded()
    }
  }
  fs.writeFileSync(filename, JSON.stringify(data));
  return filename;
}

module.exports = {
  run: run
};
