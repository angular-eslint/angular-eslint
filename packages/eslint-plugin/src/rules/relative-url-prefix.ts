import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { COMPONENT_CLASS_DECORATOR } from '../utils/selectors';
import { isArrayExpression, isStringLiteral } from '../utils/utils';

type Options = [];
export type MessageIds = 'relativeUrlPrefix';
export const RULE_NAME = 'relative-url-prefix';

const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-05-04';
const RELATIVE_URL_PREFIX_MATCHER = /^\.\.?\/.+/;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `The ./ and ../ prefix is standard syntax for relative URLs; don't depend on Angular's current ability to do without that prefix. See more at ${STYLE_GUIDE_LINK}`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      relativeUrlPrefix: `The ./ and ../ prefix is standard syntax for relative URLs. (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [`${COMPONENT_CLASS_DECORATOR} Property[key.name='templateUrl']`]({
        value,
      }: TSESTree.Property) {
        if (!isUrlInvalid(value)) return;

        context.report({
          node: value,
          messageId: 'relativeUrlPrefix',
        });
      },
      [`${COMPONENT_CLASS_DECORATOR} Property[key.name='styleUrls']`]({
        value,
      }: TSESTree.Property) {
        if (!isArrayExpression(value)) return;

        value.elements.filter(isUrlInvalid).forEach((element) => {
          context.report({
            node: element,
            messageId: 'relativeUrlPrefix',
          });
        });
      },
    };
  },
});

function isUrlInvalid(node: TSESTree.Property | TSESTree.Property['value']) {
  return (
    !isStringLiteral(node) || !RELATIVE_URL_PREFIX_MATCHER.test(node.value)
  );
}
