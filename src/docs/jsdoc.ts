import * as fs from 'fs';
import * as path from 'path';

import * as sh from 'shelljs';

import { CodeObjectLocation, CodeObject } from '../contracts/code_object';
import { readCommentsFromFilePrecedingLine, removeCommentMarkers } from './comments';

export type JsdocObject = any;

const JSDOC_OUTPUT_FILENAME = '.inch.jsdoc-output.json';

export async function getJsdocOutputAsCodeObjects(codeDir: string, jsdoc_args: any[]): Promise<CodeObject[]> {
  // TODO: FIXME: this should NOT be hardcoded
  const srcBasedir = path.resolve(codeDir);
  const jsdocObjectRoot = await getJsdocOutputAsObjects(srcBasedir, jsdoc_args);
  const objects = mapAndReduceJsdocObjects(jsdocObjectRoot, srcBasedir);

  return objects;
}

export async function getJsdocOutputAsObjects(srcBasedir: string, jsdoc_args: string[] = []): Promise<JsdocObject[]> {
  checkJSDocExistence();

  jsdoc_args = jsdoc_args || [];

  const jsdocOptions = '--explain --lenient --recurse --configure ' + createJSDocConfigFile(srcBasedir);
  const cmd = `jsdoc ${jsdoc_args.join(' ')} ${jsdocOptions}`;

  // console.log(`Executing: ${cmd}`);

  return new Promise((resolve: Function, reject: Function) => {
    var child = sh.exec(cmd, { silent: true, async: true });
    var output = '';
    child.stdout.on('data', function (data) {
      output += data;
    });
    child.stdout.on('close', function () {
      try {
        var objects = JSON.parse(output);
      } catch (e) {
        console.error(output);
        reject(new Error('Parsing failed.'));
      }

      var data = objects;
      fs.writeFileSync(JSDOC_OUTPUT_FILENAME, JSON.stringify(data, null, 2));

      resolve(objects);
    });
  });
}

/**
 * Internal: Used by tests.
 */
export function mapAndReduceJsdocObjects(jsdocObjects: JsdocObject[], srcBasedir: string): CodeObject[] {
  if (jsdocObjects == null) {
    return [];
  }

  return jsdocObjects
    .map((child) => mapJsdocObject(child, srcBasedir))
    .filter((jsdocObject) => jsdocObject != null) as CodeObject[];
}

function mapJsdocObject(jsdocObject: JsdocObject, srcBasedir: string): CodeObject | null {
  if (ignoreJsdocObjectFilter(jsdocObject)) {
    return null;
  }

  const location = getLocation(jsdocObject, srcBasedir);
  if (location == null) {
    return null;
  }

  const { name } = jsdocObject;
  const type = getType(jsdocObject);
  const isExported = !!(jsdocObject.flags && jsdocObject.flags.isExported);
  const doc = getDocString(location);
  const parameters = getParameters(jsdocObject);
  const isTyped = objectIsTyped(jsdocObject);
  const childrenCount = -1;
  const metadata = { isExported, parameters, isTyped, childrenCount };

  return { name, type, doc, location, metadata };
}

function getType(jsdocObject: JsdocObject) {
  switch (jsdocObject.kind) {
    case 'function':
      return 'function';
  }

  return `Unknown<${jsdocObject.kindString}>`;
}

function getParameters(jsdocObject: JsdocObject) {
  const parameterNames = jsdocObject.meta?.code?.paramnames;

  if (parameterNames == null) {
    return null;
  }

  return parameterNames.map((parameterName) => {
    return { name: parameterName, isTyped: isParameterTyped(parameterName, jsdocObject) };
  });
}

function objectIsTyped(jsdocObject: JsdocObject): boolean {
  return false; // TODO: implement me
}

function isParameterTyped(parameterName: string, jsdocObject: JsdocObject): boolean {
  return false; // TODO: implement me
}

function getDocString(location): string {
  const comment = readCommentsFromFilePrecedingLine(location.filename, location.line);
  const docString = removeCommentMarkers(comment);

  return docString;
}

function getLocation(jsdocObject: JsdocObject, srcBasedir: string): CodeObjectLocation | null {
  const meta = jsdocObject.meta;
  const filename = path.join(meta.path, meta.filename);

  const result = {
    filename: filename,
    line: meta.lineno,
    column: meta.columnno,
  };

  return result;
}

function ignoreJsdocObjectFilter(jsdocObject: JsdocObject): boolean {
  const name = jsdocObject.longname || jsdocObject.name;
  if (name == null) {
    return true;
  }
  const is_undefined = name.indexOf('[undefined]') > -1;
  const is_invalid_kind =
    jsdocObject.kind === 'typedef' || jsdocObject.kind === 'member' || jsdocObject.kind === 'package';
  const is_part_of_module =
    name.indexOf('module:') === 0 && name.indexOf('~') > -1 && name.indexOf('~') === name.lastIndexOf('~');

  return is_undefined || is_invalid_kind || (!is_part_of_module && name.indexOf('~') > -1);
}

function checkJSDocExistence() {
  try {
    require('jsdoc/package.json');
  } catch (e) {
    throw 'Could not find jsdoc executable';
  }
}

function createJSDocConfigFile(srcBasedir: string) {
  const filename = '.inch.config.json';
  const data = {
    source: {
      include: [srcBasedir],
      exclude: ['dist', 'out', 'node_modules'],
    },
  };

  fs.writeFileSync(filename, JSON.stringify(data));

  return filename;
}
