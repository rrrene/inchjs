'use strict';

var sh = require('shelljs'),
    Path = require('path'),
    exec = require('child_process').exec,
    http = require('http'),
    fs = require('fs');

var BUILD_API_END_POINT = 'http://localhost:3000/api/v1/builds'; // 'http://inch-ci.org/api/v1/builds'

function run(filename, callback) {
  if( isValid ) {
    runBuildApi(filename);
  } else {
    console.log("InchJS skipped.");
  }
}

function getInchBuildApiEndPoint() {
  if( process.env.INCH_BUILD_API ) {
    return process.env.INCH_BUILD_API;
  } else {
    return BUILD_API_END_POINT;
  }
}

function isValid() {
  if( process.env.TRAVIS_PULL_REQUEST ) {
    return process.env.TRAVIS_PULL_REQUEST == "false";
  } else {
    return true;
  }
}

function runBuildApi(filename) {
  var json = JSON.parse( fs.readFileSync(filename) );
  var data = JSON.stringify(json)
  var url = require('url').parse(getInchBuildApiEndPoint());
  var options = {
    host: url.hostname,
    port: url.port,
    path: url.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log(chunk);
    });
  });

  req.on('error', function(e) {
    console.log("InchJS failed: " + e.message);
  });

  // write data to request body
  req.write(data);
  req.end();
}

module.exports = {
  run: run
};
