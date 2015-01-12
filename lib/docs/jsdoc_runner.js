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
      cmd = getJSDocCommand()+" " + jsdoc_args.join(' ') + " --explain --recurse";

  var child = sh.exec(cmd, {silent: true, async: true});
  var output = "";
  child.stdout.on('data', function(data) {
    output += data;
  });
  child.stdout.on('close', function() {
    var objects = JSON.parse( output );
    var data = prepareMetadata(objects, []);
    fs.writeFileSync(filename, JSON.stringify(data));
    callback(filename);
  });
}

function getJSDocCommand() {
  var finder = "find . -type l -name jsdoc";
  var out = sh.exec(finder, {silent: true}).output;
  return out.split("\n")[0].trim();
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
    git_repo_url: getGitRepoURL()
  };
  if( process.env.TRAVIS ) {
    data['travis'] = true;
    data['travis_job_id'] = process.env.TRAVIS_JOB_ID;
    data['travis_commit'] = process.env.TRAVIS_COMMIT;
    data['travis_repo_slug'] = process.env.TRAVIS_REPO_SLUG;
  }
  data['branch_name'] = getGitBranchName();
  data['objects'] = objects.filter(includeObjectFilter).map(function(item) {
        return prepareCodeObject(item, cwd);
      });
  return data;
}

var includeObjectFilter = function(item) {
  var exclude = item.kind == 'member' || item.longname.indexOf('~') > -1;
  return !exclude;
}

var getGitBranchName = function() {
  return getTrimmedOutput("git rev-parse --abbrev-ref HEAD");
}

var getGitRepoURL = function() {
  return getTrimmedOutput("git ls-remote --get-url origin");
}

var getTrimmedOutput = function(cmd) {
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
    item['comment'] = trimComment(item['comment']);
    item['meta']['path'] = item['meta']['path'].replace(cwd, '');
  }
  return item;
}

var trimComment = function(comment) {
  return (comment || "").split("\n").map(function(line) {
    return line.trim();
  }).join("\n");
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
