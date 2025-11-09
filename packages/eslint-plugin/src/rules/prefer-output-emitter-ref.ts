import { Selectors } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];

export type MessageIds = 'preferOutputEmitterRef';
export const RULE_NAME = 'prefer-output-emitter-ref';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Use `OutputEmitterRef` instead of `@Output()`',
    },
    schema: [],
    messages: {
      preferOutputEmitterRef:
        'Use `OutputEmitterRef` via `output()` for Component and Directive outputs rather than the legacy `@Output()` decorator',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [Selectors.OUTPUT_DECORATOR]: (node) => {
        context.report({ node, messageId: 'preferOutputEmitterRef' });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "The output() function is Angular's modern API for component outputs, intended to be used instead of the @Output() decorator (which still exists for backwards compatibility). OutputEmitterRef (returned by output()) provides better type safety, integrates seamlessly with Angular's signal ecosystem, and offers a more functional programming approach. Unlike @Output() which uses EventEmitter, output() is specifically designed for component outputs and has a cleaner, more predictable API, that resembles other function based and signals APIs that have been added to the framework in recent versions.",
};
