'use strict';

var DEFAULT_ARGS = ['lib/', 'src/', 'tasks/'],
    sys = require('sys'),
    fs = require('fs'),
    Path = require('path'),
    exec = require('child_process').exec;

function run(done, jsdoc_args, callback) {
  jsdoc_args = jsdoc_args || getDefaultJSDocArgs();

  var filename = "docs.json",
      cmd = "jsdoc " + jsdoc_args.join(' ') + " --explain";

  exec(cmd+" > "+filename, function(error, stdout, stderr) {
    if( error ) {
      sys.puts("[error] jsdoc "+stderr);
    } else {
      var objects = JSON.parse( fs.readFileSync(filename) );
      var data = prepareMetadata(objects, []);
      fs.writeFileSync(filename, JSON.stringify(data));
      callback(filename);
    }
    done && done(error);
  });
}

/** Returns an Array of default arguments for JSDOC. */
function getDefaultJSDocArgs() {
  var results = [];
  DEFAULT_ARGS.forEach(function(dir) {
    if( fs.existsSync(dir) ) results.push(dir);
  });
  return results;
}

// Removes absolute paths from JSON output and inject
// some relevant metadata, e.g. language.
var prepareMetadata = function(objects, inch_args) {
  var cwd = process.cwd();
  return {
    language: 'nodejs',
    args: inch_args,
    objects: objects.map(function(item) {
        return prepareCodeObject(item, cwd);
      })
  };
}

var prepareCodeObject = function(item, cwd) {
  if( item['meta'] ) {
    if( item['comment'] == '' ) {
      var filename = Path.join(item['meta']['path'], item['meta']['filename']);
      var line = item['meta']['lineno'];
      item['comment'] = readCommentsFromFilePrecedingLine(filename, line);
    }
    item['meta']['path'] = item['meta']['path'].replace(cwd, '');
  }
  return item;
}

var readCommentsFromFilePrecedingLine = function(filename, lineno) {
  var contents = fs.readFileSync(filename, 'utf-8'),
      lines = contents.split('\n'),
      result = [];
  for(var i=lineno-2;i>=0;i--) {
    var line = lines[i];
    if( line.match(/^\s*[\/\*]/) ) {
      result.unshift(line);
    } else {
      return result.join('\n');
    }
  }
  return result.join('\n');
}

module.exports = {
  run: run
};
