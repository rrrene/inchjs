'use strict';

var THIRD_PARTY_JSON_NAMESPACE = 'inch',
    fs = require('fs'),
    jsyaml = require('js-yaml'),
    Path = require('path');

function get() {
  return loadJsonConfig('inch.json') ||
          loadJsonConfig('package.json', THIRD_PARTY_JSON_NAMESPACE) ||
          loadJsonConfig('bower.json', THIRD_PARTY_JSON_NAMESPACE) ||
          loadYamlConfig('.inch.yml') ||
          {};
}

function files() {
  return get().files || {};
}

function loadJsonConfig(_filename, namespace) {
  var filename = getLocalFilename(_filename);
  if( fs.existsSync(filename) ) {
    var hash = require(filename);
    if( namespace ) hash = hash[namespace]
    return hash;
  }
}

function loadYamlConfig(_filename, namespace) {
  var filename = getLocalFilename(_filename);
  if( fs.existsSync(filename) ) {
    var data = fs.readFileSync(filename);
    var hash = jsyaml.load(data);
    return hash;
  }
}

function getLocalFilename(filename) {
  return Path.join(process.cwd(), filename);
}

module.exports = {
  get: get,
  files: files
};
