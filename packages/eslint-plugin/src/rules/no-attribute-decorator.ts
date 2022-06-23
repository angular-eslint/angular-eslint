import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noAttributeDecorator';
export const RULE_NAME = 'no-attribute-decorator';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `The @Attribute decorator is used to obtain a single value for an attribute. This is a much less common use-case than getting a stream of values (using @Input), so often the @Attribute decorator is mistakenly used when @Input was what was intended. This rule disallows usage of @Attribute decorator altogether in order to prevent these mistakes.`,
      recommended: false,
    },
    schema: [],
    messages: {
      noAttributeDecorator:
        '@Attribute can only obtain a single value and is rarely what is required. Use @Input instead to retrieve a stream of values.',
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
