import * as fs from 'fs';
import * as path from 'path';

import * as sh from 'shelljs';
import { CodeObjectLocation, CodeObject } from '../contracts/code_object';

type TypedocObject = any;

const outputFilename = '.inch.typedoc-output.json';

export async function getTypedocOutputAsObjects(codeDir: string, typedoc_args): Promise<CodeObject[]> {
  checkTypedocExistence();

  typedoc_args = typedoc_args || [];

  // TODO: FIXME: this should NOT be hardcoded
  const srcBasedir = path.resolve(codeDir);

  const typedocOptions = `--ignoreCompilerErrors --json ${outputFilename}`;
  const cmd = `typedoc "${srcBasedir}" ${typedoc_args.join(' ')} ${typedocOptions}`;

  // console.log(cmd);

  return new Promise((resolve: Function, reject: Function) => {
    sh.exec(cmd, { silent: true });
    const data = fs.readFileSync(outputFilename).toString();
    let typedocObjects;

    try {
      typedocObjects = JSON.parse(data);
    } catch (e) {
      console.error(data);
      reject(new Error('Parsing failed.'));
    }

    const objects = mapAndReduceTypedocObjects(typedocObjects, srcBasedir, []);

    resolve(objects);
  });
}

function mapAndReduceTypedocObjects(obj, srcBasedir: string, memo: any[] = []): CodeObject[] {
  if (obj == null) {
    return [];
  }

  const newObject = mapTypedocObject(obj, srcBasedir);
  if (newObject != null) {
    memo.push(newObject);
  }

  if (obj.children) {
    obj.children.forEach((child) => {
      mapAndReduceTypedocObjects(child, srcBasedir, memo);
    });
  }

  return memo;
}

/**
 * Maps an object.
 *
 * @param typedocObject test
 */
function mapTypedocObject(typedocObject: TypedocObject, srcBasedir: string): CodeObject | null {
  const location = getLocation(typedocObject, srcBasedir);
  if (location == null) {
    return null;
  }
  if (typedocObject.kindString == null) {
    return null;
  }

  const { name } = typedocObject;
  const type = getType(typedocObject);
  const isExported = !!(typedocObject.flags && typedocObject.flags.isExported);
  const doc = getDocString(location);
  const parameters = getParameters(typedocObject);
  const isTyped = objectIsTyped(typedocObject);
  const childrenCount = -1;
  const metadata = { isExported, parameters, isTyped, childrenCount };

  return { name, type, doc, location, metadata };
}

function getDocString(location): string {
  return readCommentsFromFilePrecedingLine(location.filename, location.line);
}

function getLocation(typedocObject: TypedocObject, srcBasedir: string): CodeObjectLocation | null {
  if (typedocObject.sources == null) {
    return null;
  }

  const originalLocation = typedocObject.sources[0];
  if (originalLocation.fileName.match(/\/node_modules\//)) {
    return null;
  }

  const result = {
    filename: path.join(srcBasedir, originalLocation.fileName),
    line: originalLocation.line,
    column: originalLocation.character
  };

  return result;
}

function getParameters(typedocObject: TypedocObject) {
  if (typedocObject.signatures == null || typedocObject.signatures.length === 0) {
    return null;
  }

  const signature = typedocObject.signatures[0];
  if (signature.parameters == null) {
    return null;
  }

  return signature.parameters.map((typedocParameterObject) => {
    return { name: typedocParameterObject.name, isTyped: !!typedocParameterObject.type };
  });
}

function objectIsTyped(typedocObject: TypedocObject) {
  if (typedocObject.signatures == null || typedocObject.signatures.length === 0) {
    return null;
  }

  return typedocObject.signatures.some((signature) => !!signature.type);
}

function getType(typedocObject: TypedocObject) {
  switch (typedocObject.kindString) {
    case 'Class':
      return 'class';
    case 'Property':
      return 'property';
    case 'Constructor':
      return 'constructor';
    case 'Method':
      return 'method';
    case 'Function':
      return 'function';
    case 'Type alias':
      return 'type_alias';
    case 'Interface':
      return 'interface';
    case 'Accessor':
      return 'accessor';
    case 'External module':
      return 'module';
    case 'Variable':
      return 'variable';
    case 'Object literal':
      return 'object_literal';
    case 'Enumeration':
      return 'enumeration';
    case 'Enumeration member':
      return 'enumeration_member';
  }

  return `Unknown<${typedocObject.kindString}>`;
}

function checkTypedocExistence() {
  try {
    require('typedoc/package.json');
  } catch (e) {
    throw 'Could not find typedoc executable';
  }
}

function readCommentsFromFilePrecedingLine(filename: string, lineno: number): string {
  const contents = fs.readFileSync(filename, 'utf-8').toString();
  const comment = readCommentsFromStringPrecedingLine(contents, lineno);

  return comment;
}

function readCommentsFromStringPrecedingLine(contents: string, lineno: number): string {
  const lines = contents.split('\n');
  let result: any[] = [];

  for (var i = lineno - 2; i >= 0; i--) {
    var line = lines[i];
    if (line.match(/^\s*[\/\*]/)) {
      result.unshift(line);
    } else {
      return result.join('\n');
    }
  }

  return result.join('\n');
}
