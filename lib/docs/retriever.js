'use strict';

var DEFAULT_PATHS = ['lib/', 'src/'],
    config = require('./config'),
    fs = require('fs'),
    Path = require('path');

function getSourcePaths() {
  return getConfigArgs() || getDefaultArgs() ||
          getPackageJsonArgs() || getBowerJsonArgs() || [];
}

/** Returns an Array of default paths and globs to be included. */
function getConfigArgs() {
  return config.files().included;
}

/** Returns an Array of default paths. */
function getDefaultArgs() {
  var results = [];
  DEFAULT_PATHS.forEach(function(dir) {
    if( fs.existsSync(dir) ) results.push(dir);
  });
  return results.length == 0 ? null : results;
}

/** Checks package.json for possible paths */
function getPackageJsonArgs() {
  var results = [];
  var config = _loadJson('package.json');
  if( config.main ) results.push(config.main);
  if( config.files ) results.concat(config.files);
  return results.length == 0 ? null : results;
}


/** Checks bower.json for possible paths */
function getBowerJsonArgs() {
  var results = [];
  var config = _loadJson('bower.json');
  if( config.main ) results.push(config.main);
  return results.length == 0 ? null : results;
}

function _loadJson(_filename) {
  var result = {};
  var filename = Path.join(process.cwd(), _filename);
  if( fs.existsSync(filename) ) result = require(filename);
  return result;
}

module.exports = {
  getSourcePaths: getSourcePaths
};
