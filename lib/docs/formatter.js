'use strict';

var REGEX_PREFIX = "!regexp:/",
    sh = require('shelljs'),
    glob = require('glob'),
    fs = require('fs'),
    Path = require('path'),
    config = require('./config'),
    inch_config = require('../../package.json');

// Removes absolute paths from JSON output and inject
// some relevant metadata, e.g. language.
var run = function(objects, inch_args) {
  var cwd = process.cwd();
  var excluded = config.files().excluded || [];
  var data = {
    language: 'javascript',
    client_name: 'inchjs',
    args: inch_args,
    client_version: ""+inch_config.version,
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
      }).filter(function(item) {
        return !excludeObjectIfMatch(item, excluded);
      });
  return data;
}

var excludeObjectFilter = function(item) {
  var name = item.longname;
  var is_undefined = name.indexOf('[undefined]') > -1;
  var is_invalid_kind = item.kind == 'typedef' ||
                          item.kind == 'member' ||
                          item.kind == 'package';
  var is_part_of_module = name.indexOf('module:') == 0 &&
                            name.indexOf('~') > -1 &&
                            name.indexOf('~') == name.lastIndexOf('~');
  return  is_undefined ||
          is_invalid_kind ||
          (!is_part_of_module && name.indexOf('~') > -1);
}

var excludeObjectIfMatch = function(item, excluded) {
  var meta = item.meta;
  if( meta === undefined ) return false;
  var filename = Path.join(meta.path, meta.filename);
  for(var i=0;i<excluded.length;i++) {
    if( matchesFilename(excluded[i], filename) ) return true;
  }
  return false;
}

function matchesFilename(pattern, _filename) {
  var filename = _filename.replace(/^(\/)/, '')
  if( pattern.indexOf(REGEX_PREFIX) == 0 ) {
    var str = pattern.substr(REGEX_PREFIX.length, pattern.length-REGEX_PREFIX.length-1);
    var regex = new RegExp(str, "i");
    return filename.match(regex) !== null;
  } else if( pattern.indexOf('*') != -1 ) {
    var results = glob.sync(pattern);
    for(var i=0;i<results.length;i++) {
      if( results[i] == filename ) return true;
    }
    return false;
  } else {
    return filename.indexOf(pattern) == 0;
  }
}

var includeObjectFilter = function(item) {
  return !excludeObjectFilter(item);
}

var getGitBranchName = function() {
  return getTrimmedOutput("git rev-parse --abbrev-ref HEAD");
}

var getGitRepoURL = function() {
  return getTrimmedOutput("git config --get remote.origin.url");
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
    item['meta']['path'] = item['meta']['path'].replace(cwd, ''); // .replace(/^(\/)/, '')
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
