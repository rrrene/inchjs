import { CodeObject, CodeObjectRole } from '../contracts/code_object';

import { ROLE_WITH_PARAMETER_MENTION, ROLE_WITHOUT_PARAMETER_MENTION } from '../roles';

export function getRolesForParametersWithOrWithoutMention(codeObject: CodeObject): CodeObjectRole | null {
  const parameters = codeObject.metadata.parameters;
  if (parameters == null) {
    return null;
  }

  const parameterNames = parameters.map((parameter: any) => parameter.name);

  return parameterNames.map((parameterName: string) => {
    const isMentioned = mentionsParameter(codeObject.doc, parameterName);
    const id = isMentioned ? ROLE_WITH_PARAMETER_MENTION : ROLE_WITHOUT_PARAMETER_MENTION;
    const metadata = { name: parameterName };

    return { id, metadata };
  });
}

export function mentionsParameter(doc: string, parameterName: string): boolean {
  return mentionsIdentifier(doc, parameterName);
}

function mentionsIdentifier(doc: string, identifier: string) {
  const markdownInlineCodeStyleRegex = new RegExp(`\`${identifier}\``);
  const isMentionedViaMarkdownInlineCodeStyle = doc.match(markdownInlineCodeStyleRegex) != null;

  return isMentionedViaMarkdownInlineCodeStyle;
}
