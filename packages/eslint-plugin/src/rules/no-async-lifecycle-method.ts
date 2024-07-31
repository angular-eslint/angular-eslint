import { ASTUtils, Selectors, toPattern } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noAsyncLifecycleMethod';
export const RULE_NAME = 'no-async-lifecycle-method';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Angular Lifecycle methods should not be async. Angular does not wait for async lifecycle but the code incorrectly suggests it does.`,
    },
    schema: [],
    messages: {
      noAsyncLifecycleMethod: 'Angular Lifecycle method should not be async',
    },
  },
  defaultOptions: [],
  create(context) {
    const angularDecoratorsPattern = toPattern([
      'Component',
      'Directive',
      'Injectable',
      'NgModule',
      'Pipe',
    ]);

    const angularLifecycleMethodsPattern = toPattern([
      ...ASTUtils.ANGULAR_LIFECYCLE_METHODS,
    ]);

    return {
      [`${Selectors.decoratorDefinition(
        angularDecoratorsPattern,
      )} > ClassBody > MethodDefinition[key.name=${angularLifecycleMethodsPattern}]`](
        node: TSESTree.MethodDefinition,
      ): void {
        if (node.value.async === true) {
          context.report({
            node: node.key,
            messageId: 'noAsyncLifecycleMethod',
          });
        }
      },
    };
  },
});
