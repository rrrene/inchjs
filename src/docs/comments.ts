import * as fs from 'fs';

export function readCommentsFromFilePrecedingLine(filename: string, lineno: number): string {
  const contents = fs.readFileSync(filename, 'utf-8').toString();
  const comment = readCommentsFromStringPrecedingLine(contents, lineno);

  return comment;
}

export function readCommentsFromStringPrecedingLine(contents: string, lineno: number): string {
  if (lineno === 1) {
    return '';
  }

  const lines = contents.split('\n');
  const lineIndex = lineno - 1;
  const startIndex = Math.max(0, lineIndex - 1);
  const firstLineAboveLineno = lines[startIndex];
  const initiallyInCommentBlock = isClosingMultilineCommentMarker(firstLineAboveLineno);

  let result: any[] = [];
  for (let i = startIndex; i >= 0; i--) {
    const line = lines[i];
    const commentOnLine = line.match(/^\s*[\/\*]/) != null;
    const containsMultilineStartingMarker = line.match(/^\s*\/\*/) != null;
    const multilineCommentEnded = initiallyInCommentBlock && containsMultilineStartingMarker;

    if (initiallyInCommentBlock) {
      result.unshift(line);

      if (multilineCommentEnded) {
        return result.join('\n');
      }
    } else {
      if (commentOnLine) {
        result.unshift(line);
      } else {
        return result.join('\n');
      }
    }
  }

  return result.join('\n');
}

function isClosingMultilineCommentMarker(line: string): boolean {
  const notSingleLineMarker = line.match(/^\s*\/\/*$/) == null;
  const containsMultilineClosingMarker = line.match(/\*\/\s*$/) != null;

  return notSingleLineMarker && containsMultilineClosingMarker;
}

export function removeCommentMarkers(text: string): string {
  if (text.trim() === '') {
    return '';
  }

  const comment = text.replace(/^\n/, '');
  const marker = getStartingMarker(comment);
  const isMultilineMarker = marker.trim() === '/**' || marker.trim() === '/*';
  let indent = marker.length;

  if (isMultilineMarker) {
    const lines = comment.split('\n');
    const body = lines.slice(1, lines.length - 1);

    const bodyUsesAsterix =
      body.length > 0 &&
      body.every((line: string) => {
        return line.match(/^\s*\*\s/) != null || line.match(/^\s*\*$/) != null;
      });

    if (bodyUsesAsterix) {
      const matched = body[0].match(/^(\s*\*\s)/);
      if (matched != null) {
        indent = matched[1].length;
      }
    }
  } else {
    indent = indent + 1;
  }

  let result = deleteFirstCharactersOfEachLine(comment, indent);

  if (isMultilineMarker) {
    result = result
      .replace(/^\n/, '')
      .replace(/\s*\*\/\s*$/, '')
      .replace(/\n$/, '');
  }

  return result;
}

function getStartingMarker(comment: string): string {
  const matched = comment.match(/^([\ \t]*(\/\/|\/\*|\/\*\*)[\ \t]*)/);
  if (matched == null) {
    throw new Error(`Could not find starting marker: ${comment}`);
  }

  return matched[1];
}

function deleteFirstCharactersOfEachLine(text: string, x: number): string {
  const lines = text.split('\n');
  return lines.map((line: string) => line.slice(x)).join('\n');
}
