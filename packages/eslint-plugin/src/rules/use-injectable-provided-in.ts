import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { INJECTABLE_CLASS_DECORATOR } from '../utils/selectors';
import {
  AngularClassDecorators,
  getDecoratorPropertyValue,
} from '../utils/utils';

type Options = [];
export type MessageIds = 'useInjectableProvidedIn';
export const RULE_NAME = 'use-injectable-provided-in';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `"Using the 'providedIn' property makes classes decorated with @${AngularClassDecorators.Injectable} tree shakeable`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      useInjectableProvidedIn: `Classes decorated with @${AngularClassDecorators.Injectable} should use the 'providedIn' property`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [INJECTABLE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const providedInValue = getDecoratorPropertyValue(node, 'providedIn');
        if (providedInValue) {
          return;
        }

        context.report({
          node,
          messageId: 'useInjectableProvidedIn',
        });
      },
    };
  },
});
