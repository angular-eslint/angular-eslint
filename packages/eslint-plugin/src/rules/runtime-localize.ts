import { ASTUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'runtimeLocalize';
export const RULE_NAME = 'runtime-localize';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that $localize tagged messages can use runtime-loaded translations.',
    },
    schema: [],
    messages: {
      runtimeLocalize: `$localize could be called before translations are loaded`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      TaggedTemplateExpression(
        taggedTemplateExpression: TSESTree.TaggedTemplateExpression,
      ) {
        if (
          ASTUtils.isIdentifier(taggedTemplateExpression.tag) &&
          taggedTemplateExpression.tag.name === '$localize'
        ) {
          for (const ancestor of context.sourceCode.getAncestors(
            taggedTemplateExpression,
          )) {
            if (
              ancestor.type === AST_NODE_TYPES.FunctionDeclaration ||
              ancestor.type === AST_NODE_TYPES.FunctionExpression ||
              ancestor.type === AST_NODE_TYPES.ArrowFunctionExpression ||
              (ancestor.type === AST_NODE_TYPES.PropertyDefinition &&
                !ancestor.static)
            ) {
              return;
            }
          }

          context.report({
            loc: taggedTemplateExpression.tag.loc,
            messageId: 'runtimeLocalize',
          });
        }
      },
    };
  },
});
