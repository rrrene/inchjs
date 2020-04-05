'use strict';

var fs = require('fs'),
    Path = require('path');

function extractPaths(args) {
  var none_path_detected = false;
  var paths = [];
  args.forEach(function(arg) {
    var value = Path.join(process.cwd(), arg);
    if( none_path_detected ) {
      // pass
    } else if( fs.existsSync(value) ) {
      paths.push(arg);
    } else if( value.indexOf('*') != -1 ) {
      paths.push(arg);
    } else {
      none_path_detected = true;
    }
  });
  return paths.length == 0 ? null : paths;
}

module.exports = {
  extractPaths: extractPaths
}