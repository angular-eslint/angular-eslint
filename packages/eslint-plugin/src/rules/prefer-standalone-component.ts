import {
  ASTUtils,
  RuleFixes,
  isNotNullOrUndefined,
  Selectors,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'preferStandaloneComponent' | 'suggestAddStandalone';
export const RULE_NAME = 'prefer-standalone-component';
const METADATA_PROPERTY_NAME = 'standalone';
const IS_STANDALONE = 'true';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures component's \`${METADATA_PROPERTY_NAME}\` metadata is set to \`${IS_STANDALONE}\``,
      recommended: false,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      preferStandaloneComponent: `The component's \`${METADATA_PROPERTY_NAME}\` value should be set to \`${IS_STANDALONE}\``,
      suggestAddStandalone: `Add \`${METADATA_PROPERTY_NAME}: ${IS_STANDALONE}\` in your component decorator`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [Selectors.COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const standalone = ASTUtils.getDecoratorPropertyValue(
          node,
          METADATA_PROPERTY_NAME,
        );

        if (
          standalone &&
          ASTUtils.isLiteral(standalone) &&
          standalone.value === true
        ) {
          return;
        }

        context.report({
          node: nodeToReport(node),
          messageId: 'preferStandaloneComponent',
          suggest: [
            {
              messageId: 'suggestAddStandalone',
              fix: (fixer) => {
                if (
                  standalone &&
                  ASTUtils.isLiteral(standalone) &&
                  standalone.value !== true
                ) {
                  return [fixer.replaceText(standalone, IS_STANDALONE)].filter(
                    isNotNullOrUndefined,
                  );
                }

                return [
                  RuleFixes.getDecoratorPropertyAddFix(
                    node,
                    fixer,
                    `${METADATA_PROPERTY_NAME}: ${IS_STANDALONE}`,
                  ),
                ].filter(isNotNullOrUndefined);
              },
            },
          ],
        });
      },
    };
  },
});

function nodeToReport(node: TSESTree.Node) {
  if (!ASTUtils.isProperty(node)) {
    return node;
  }

  return ASTUtils.isMemberExpression(node.value)
    ? node.value.property
    : node.value;
}
