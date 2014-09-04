'use strict';

var sh = require('shelljs'),
    sys = require('sys'),
    Path = require('path'),
    exec = require('child_process').exec;

function run(inch_args, filename, callback) {
  inch_args = inch_args || [];
  if( hasLocalInch() ) {
    var default_args = ["--language=nodejs", "--read-from-dump="+filename];
    runLocalInch(inch_args.concat(default_args), callback)
  } else {
    sys.puts("Inch not found.")
  }
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

function hasLocalInch() {
  return !!getInchCmd();
}

module.exports = {
  run: run
};
