import { TSESTree } from '@typescript-eslint/typescript-estree';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getClassName, getClassPropertyName } from '../utils/utils';

type Options = [];
export type MessageIds = 'noOutputOnPrefix';
export const RULE_NAME = 'no-output-on-prefix';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Name events without the prefix on. See more at https://angular.io/guide/styleguide#dont-prefix-output-properties.`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noOutputOnPrefix:
        'In the class "{{className}}", the output property "{{memberName}}" should not be prefixed with on',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      'ClassProperty > Decorator[expression.callee.name="Output"]'(
        node: TSESTree.Decorator,
      ) {
        const property = node.parent as TSESTree.ClassProperty;
        const className = getClassName(node);
        const memberName = getClassPropertyName(property);

        if (!memberName || !/^on((?![a-z])|(?=$))/.test(memberName)) {
          return;
        }

        context.report({
          node: property,
          messageId: 'noOutputOnPrefix',
          data: {
            className,
            memberName,
          },
        });
      },
    };
  },
});
