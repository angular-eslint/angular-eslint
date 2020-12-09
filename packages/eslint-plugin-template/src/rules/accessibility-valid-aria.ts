const { aria } = require('aria-query');

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

    return {
      // Note that we're using the `Element` visitor except of `TextAttribute`
      // and `BoundAttribute`, because `TextAttribute` visitor method is not called
      // for element attributes 🤷
      Element(node: any) {
        const attributes = [...node.inputs, ...node.attributes];

        for (const attribute of attributes) {
          if (
            !attribute.name.startsWith('aria-') ||
            ariaAttributes.has(attribute.name)
          ) {
            continue;
          }

          const loc = parserServices.convertNodeSourceSpanToLoc(
            attribute.sourceSpan,
          );

          context.report({
            loc,
            messageId: 'accessibilityValidAria',
          });
        }
      },
    };
  },
});
