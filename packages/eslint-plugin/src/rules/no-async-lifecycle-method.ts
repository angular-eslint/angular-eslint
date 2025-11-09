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

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Angular does not wait for async lifecycle methods to complete before continuing with the component lifecycle. If you make ngOnInit() async, Angular will call it and immediately move on without waiting for any await statements inside to resolve. This creates a misleading code pattern where it appears Angular will wait for asynchronous operations to complete, but it won't. For example, if ngOnInit() fetches data asynchronously, the component will continue rendering with potentially incomplete data. Instead of making lifecycle methods async, call async functions from within them and handle the promises appropriately, or use Angular patterns like resolvers, signals with async pipes, or reactive approaches with RxJS.",
};
