import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { PIPE_CLASS_DECORATOR } from '../utils/selectors';
import { getDecoratorProperty, isLiteral } from '../utils/utils';

type Options = [];
export type MessageIds = 'noPipeImpure';
export const RULE_NAME = 'no-pipe-impure';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows the declaration of impure pipes.',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noPipeImpure:
        'Impure pipes should be avoided because they are invoked on each change-detection cycle.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [PIPE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const pureProperty = getDecoratorProperty(
          node,
          'pure',
        ) as TSESTree.Property;

        if (
          !pureProperty ||
          !isLiteral(pureProperty.value) ||
          !!pureProperty.value.value
        ) {
          return;
        }

        context.report({
          node: pureProperty.value,
          messageId: 'noPipeImpure',
        });
      },
    };
  },
});
