'use strict';

var sh = require('shelljs'),
    Path = require('path'),
    exec = require('child_process').exec,
    http = require('http'),
    fs = require('fs');

var CLI_API_END_POINT = 'http://inch-ci.org/api/v1/cli'

function run(inch_args, filename, callback) {
  inch_args = inch_args || [];
  if( hasLocalInch() ) {
    var default_args = ["--language=javascript", "--read-from-dump="+filename];
    runLocalInch(inch_args.concat(default_args), callback)
  } else {
    runApiInch(inch_args, filename);
  }
}

function runApiInch(inch_args, filename) {
  inch_args = inch_args || [];
  var json = JSON.parse( fs.readFileSync(filename) );
  json['args'] = inch_args;
  var data = JSON.stringify(json);
  var url = require('url').parse(getInchCliEndPoint());
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
    console.log('problem with request: ' + e.message);
  });

  // write data to request body
  req.write(data);
  req.end();
}

function runLocalInch(args, callback) {
  var cmd = getInchCmd() + ' ' + args.join(' ');
  callback( sh.exec(cmd).output );
}

function getInchCmd() {
  if( process.env.INCH_PATH ) {
    return Path.join(process.env.INCH_PATH, "bin", "inch");
  } else {
    return sh.which('inch');
  }
}

function getInchCliEndPoint() {
  if( process.env.INCH_CLI_API ) {
    return process.env.INCH_CLI_API;
  } else {
    return CLI_API_END_POINT;
  }
}

function hasLocalInch() {
  return !!getInchCmd();
}

module.exports = {
  run: run
};
