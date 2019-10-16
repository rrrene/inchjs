import * as fs from 'fs';

import * as sh from 'shelljs';

export async function getJsdocOutputAsObjects(jsdoc_args): Promise<any> {
  checkJSDocExistence();

  jsdoc_args = jsdoc_args || [];

  const outputFilename = 'docs.json';
  const jsdocOptions = '--explain --lenient --recurse --configure ' + getJSDocConfigFilename();
  const cmd = `jsdoc ${jsdoc_args.join(' ')} ${jsdocOptions}`;

  console.log(cmd);

  return new Promise((resolve: Function, reject: Function) => {
    var child = sh.exec(cmd, { silent: true, async: true });
    var output = '';
    child.stdout.on('data', function(data) {
      output += data;
    });
    child.stdout.on('close', function() {
      try {
        var objects = JSON.parse(output);
      } catch (e) {
        console.error(output);
        reject(new Error('Parsing failed.'));
      }

      var data = objects;
      fs.writeFileSync(outputFilename, JSON.stringify(data));

      resolve(objects);
    });
  });
}

function checkJSDocExistence() {
  try {
    require('jsdoc/package.json');
  } catch (e) {
    throw 'Could not find jsdoc executable';
  }
}

function getJSDocConfigFilename() {
  var filename = '.inch.config.json';
  var data = {
    source: {
      include: ['src/'],
      exclude: []
    }
  };
  fs.writeFileSync(filename, JSON.stringify(data));
  return filename;
}
