import {
  TmplAstBoundAttribute,
  TmplAstElement,
  TmplAstTextAttribute,
} from '@angular/compiler';

import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noAutofocus';
export const RULE_NAME = 'no-autofocus';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensure that autofocus attribute is not used`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noAutofocus:
        'autofocus attribute should not be used, as it reduces usability and accessibility for users',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return parserServices.defineTemplateBodyVisitor({
      Element(node: TmplAstElement) {
        const autofocusAttributeOrBinding = lookupTheAutofocusAttributeOrBinding(
          node,
        );

        if (autofocusAttributeOrBinding) {
          const loc = parserServices.convertNodeSourceSpanToLoc(
            autofocusAttributeOrBinding.sourceSpan,
          );

          context.report({
            loc,
            messageId: 'noAutofocus',
          });
        }
      },
    });
  },
});

const autofocus = 'autofocus';
function lookupTheAutofocusAttributeOrBinding(node: TmplAstElement) {
  return (
    node.attributes.find(
      (attribute: TmplAstTextAttribute) => attribute.name === autofocus,
    ) ||
    node.inputs.find((input: TmplAstBoundAttribute) => input.name === autofocus)
  );
}
