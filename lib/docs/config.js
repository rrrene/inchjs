'use strict';

var fs = require('fs'),
    Path = require('path');

function get() {
  return loadJsonConfig() || {};
}

function files() {
  return get().files || {};
}

function loadJsonConfig() {
  var filename = getJsonFilename();
  if( fs.existsSync(filename) ) {
    return require(filename);
  }
}

function getJsonFilename() {
  return Path.join(process.cwd(), 'inch.json');
}

module.exports = {
  get: get,
  files: files
};
