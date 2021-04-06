import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noAttributeDecorator';
export const RULE_NAME = 'no-attribute-decorator';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallows usage of @Attribute decorator.',
      category: 'Possible Errors',
      recommended: false,
    },
    schema: [],
    messages: {
      noAttributeDecorator:
        'The usage of @Attribute is considered a bad practice. Use @Input instead',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      'ClassDeclaration MethodDefinition[key.name="constructor"] Decorator[expression.callee.name="Attribute"]'(
        node: TSESTree.Decorator,
      ): void {
        context.report({
          node,
          messageId: 'noAttributeDecorator',
        });
      },
    };
  },
});
