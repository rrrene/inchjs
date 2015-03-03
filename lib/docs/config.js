'use strict';

var THIRD_PARTY_JSON_NAMESPACE = 'inch',
    fs = require('fs'),
    Path = require('path');

function get() {
  return loadJsonConfig('inch.json') ||
          loadJsonConfig('package.json', THIRD_PARTY_JSON_NAMESPACE) ||
          loadJsonConfig('bower.json', THIRD_PARTY_JSON_NAMESPACE) || {};
}

function files() {
  return get().files || {};
}

function loadJsonConfig(_filename, namespace) {
  var filename = getJsonFilename(_filename);
  if( fs.existsSync(filename) ) {
    var hash = require(filename);
    if( namespace ) hash = hash[namespace]
    return hash || {};
  }
}

function getJsonFilename(filename) {
  return Path.join(process.cwd(), filename);
}

module.exports = {
  get: get,
  files: files
};
