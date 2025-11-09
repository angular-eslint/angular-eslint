import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'relativeUrlPrefix';
export const RULE_NAME = 'relative-url-prefix';

const RELATIVE_URL_PREFIX_MATCHER = /^\.\.?\/.+/;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `The ./ and ../ prefix is standard syntax for relative URLs; don't depend on Angular's current ability to do without that prefix.`,
    },
    schema: [],
    messages: {
      relativeUrlPrefix: `The ./ and ../ prefix is standard syntax for relative URLs.`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [`${Selectors.COMPONENT_CLASS_DECORATOR} Property[key.name='templateUrl']`]({
        value,
      }: TSESTree.Property) {
        if (!isUrlInvalid(value)) return;

        context.report({
          node: value,
          messageId: 'relativeUrlPrefix',
        });
      },
      [`${Selectors.COMPONENT_CLASS_DECORATOR} Property[key.name='styleUrls']`]({
        value,
      }: TSESTree.Property) {
        if (!ASTUtils.isArrayExpression(value)) return;

        value.elements.filter(isUrlInvalid).forEach((element) => {
          if (!element) {
            return;
          }
          context.report({
            node: element,
            messageId: 'relativeUrlPrefix',
          });
        });
      },
    };
  },
});

function isUrlInvalid(
  node: TSESTree.Property['value'] | TSESTree.SpreadElement | null,
) {
  if (!node) {
    return false;
  }
  if (ASTUtils.isTemplateLiteral(node)) {
    return !RELATIVE_URL_PREFIX_MATCHER.test(node.quasis[0].value.raw);
  }
  return (
    !ASTUtils.isStringLiteral(node) ||
    !RELATIVE_URL_PREFIX_MATCHER.test(node.value)
  );
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Using relative URLs (like './user-profile.component.html') instead of absolute URLs (like 'app/users/user-profile.component.html') for templateUrl and styleUrls makes components more portable and easier to refactor. When you move a component to a different directory, relative URLs don't need to be updated as long as the template and styles move with the component. This follows the principle of co-locating related files and makes refactoring safer. Relative URLs should typically start with './' for files in the same directory or '../' for files in parent directories.",
};
