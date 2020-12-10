import { aria } from 'aria-query';

import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

const ariaAttributes = new Set<string>(aria.keys());

type Options = [];
export type MessageIds = 'accessibilityValidAria';
export const RULE_NAME = 'accessibility-valid-aria';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that the correct ARIA attributes are used.',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      accessibilityValidAria:
        '{{attribute}}: This attribute is an invalid ARIA attribute.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return parserServices.defineTemplateBodyVisitor({
      BoundAttribute(attribute: any) {
        validateAttribute(context, parserServices, attribute);
      },
      TextAttribute(attribute: any) {
        validateAttribute(context, parserServices, attribute);
      },
    });
  },
});

function validateAttribute(
  context: any,
  parserServices: any,
  attribute: any,
): void {
  if (
    !attribute.name.startsWith('aria-') ||
    ariaAttributes.has(attribute.name)
  ) {
    return;
  }

  const loc = parserServices.convertNodeSourceSpanToLoc(attribute.sourceSpan);

  context.report({
    loc,
    messageId: 'accessibilityValidAria',
    data: {
      attribute: attribute.name,
    },
  });
}
