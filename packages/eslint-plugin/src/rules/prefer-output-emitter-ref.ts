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
