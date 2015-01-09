'use strict';

var DEFAULT_ARGS = ['lib/', 'src/', 'tasks/'],
    config = require('../../package.json'),
    sys = require('sys'),
    fs = require('fs'),
    sh = require('shelljs'),
    Path = require('path'),
    exec = require('child_process').exec;

function run(jsdoc_args, callback) {
  jsdoc_args = jsdoc_args || getDefaultJSDocArgs();

  var filename = "docs.json",
      cmd = "jsdoc " + jsdoc_args.join(' ') + " --explain --recurse";

  var child = sh.exec(cmd, {silent: true, async: true});
  var output = "";
  child.stdout.on('data', function(data) {
    output += data;
  });
  child.stdout.on('close', function() {
    console.log("args "+jsdoc_args.join(' '))
    console.log("data size: "+output.length)
    process.exit(1);
    var objects = JSON.parse( output );
    var data = prepareMetadata(objects, []);
    fs.writeFileSync(filename, JSON.stringify(data));
    callback(filename);
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
  var data = {
    language: 'nodejs',
    client_name: 'inchjs',
    args: inch_args,
    client_version: ""+config.version,
    git_repo_url: getGitRepoURL(),
    objects: objects.map(function(item) {
        return prepareCodeObject(item, cwd);
      })
  };
  if( process.env.TRAVIS ) {
    data['travis'] = true;
    data['travis_job_id'] = process.env.TRAVIS_JOB_ID;
    data['travis_commit'] = process.env.TRAVIS_COMMIT;
    data['travis_repo_slug'] = process.env.TRAVIS_REPO_SLUG;
    data['travis_branch'] = process.env.TRAVIS_BRANCH;
  }
  return data;
}

var getGitRepoURL = function() {
  var cmd = "git ls-remote --get-url origin";
  var out = sh.exec(cmd, {silent: true}).output
  return out.trim();
}

var prepareCodeObject = function(item, cwd) {
  if( item['meta'] && typeof(item['meta']) == "object" ) {
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
