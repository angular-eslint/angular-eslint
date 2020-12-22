import { TmplAstElement } from '@angular/compiler';

import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import {
  getAttributeValue,
  notAnAttributeOrIsProperty,
} from '../utils/get-attribute-value';

type Options = [];
export type MessageIds = 'noPositiveTabindex';
export const RULE_NAME = 'no-positive-tabindex';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures that the tabindex attribute is not positive`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noPositiveTabindex: 'tabindex attribute cannot be positive',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return parserServices.defineTemplateBodyVisitor({
      Element(node: TmplAstElement) {
        const tabIndex = getAttributeValue<string | number>(node, 'tabindex');

        if (notAnAttributeOrIsProperty(tabIndex)) {
          return;
        }

        // This check is used because the `parseInt` signature expects a
        // string as the first parameter and does not accept numbers.
        const numericTabIndex =
          typeof tabIndex === 'string' ? parseInt(tabIndex, 10) : tabIndex;

        if (numericTabIndex > 0) {
          const loc = parserServices.convertNodeSourceSpanToLoc(
            node.startSourceSpan,
          );
          context.report({
            messageId: 'noPositiveTabindex',
            loc,
          });
        }
      },
    });
  },
});
