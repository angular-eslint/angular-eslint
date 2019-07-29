import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { COMPONENT_CLASS_DECORATOR } from '../utils/selectors';
import {
  getDecoratorProperty,
  isArrayExpression,
  isLiteralWithStringValue,
} from '../utils/utils';

type Options = [];
export type MessageIds = 'relativeUrlPrefix';
export const RULE_NAME = 'relative-url-prefix';

const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-05-04';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `The ./ prefix is standard syntax for relative URLs; don't depend on Angular's current ability to do without that prefix. See more at ${STYLE_GUIDE_LINK}.`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      relativeUrlPrefix: `The ./ prefix is standard syntax for relative URLs. (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const templateUrlProperty = getDecoratorProperty(node, 'templateUrl');
        if (
          templateUrlProperty &&
          isLiteralWithStringValue(templateUrlProperty.value)
        ) {
          if (!/^\.\/[^\.\/|\.\.\/]/.test(templateUrlProperty.value.value)) {
            context.report({
              node: templateUrlProperty.value,
              messageId: 'relativeUrlPrefix',
            });
          }
        }

        const styleUrlsProperty = getDecoratorProperty(node, 'styleUrls');
        if (styleUrlsProperty) {
          if (
            styleUrlsProperty.value &&
            isArrayExpression(styleUrlsProperty.value) &&
            styleUrlsProperty.value.elements.length > 0
          ) {
            styleUrlsProperty.value.elements.forEach(e => {
              if (
                isLiteralWithStringValue(e) &&
                !/^\.\/[^\.\/|\.\.\/]/.test(e.value)
              ) {
                context.report({
                  node: e,
                  messageId: 'relativeUrlPrefix',
                });
              }
            });
          }
        }
      },
    };
  },
});
