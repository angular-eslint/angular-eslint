import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noAttributeDecorator';
export const RULE_NAME = 'no-attribute-decorator';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `The @Attribute decorator is used to obtain a single value for an attribute. This is a much less common use case than getting a stream of values (using @Input), so the @Attribute decorator is often mistakenly used when @Input is intended. This rule disallows the usage of @Attribute decorator entirely to prevent these mistakes.`,
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
