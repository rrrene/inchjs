'use strict';

var sh = require('shelljs'),
    fs = require('fs'),
    Path = require('path'),
    config = require('../../package.json');

// Removes absolute paths from JSON output and inject
// some relevant metadata, e.g. language.
var run = function(objects, inch_args) {
  var cwd = process.cwd();
  var data = {
    language: 'javascript',
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

var excludeObjectFilter = function(item) {
  return item.kind == 'member' ||
          item.longname.indexOf('[undefined]') > -1 ||
          item.longname.indexOf('~') > -1;
}

var includeObjectFilter = function(item) {
  return !excludeObjectFilter(item);
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
