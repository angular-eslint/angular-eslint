import { Selectors, toPattern } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];

export type MessageIds = 'preferOutputEmitterRef' | 'preferReadonly';
export const RULE_NAME = 'prefer-output-emitter-ref';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Use readonly `OutputEmitterRef` instead of `@Output()`',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferOutputEmitterRef:
        'Use `OutputEmitterRef` via `output()` for Component and Directive outputs rather than the legacy `@Output()` decorator',
      preferReadonly:
        'Properties declared as `OutputEmitterRef` should be marked as `readonly` since they should not be reassigned',
    },
  },
  defaultOptions: [],
  create(context) {
    const decoratorsPattern = toPattern(['Component', 'Directive']);

    return {
      [Selectors.OUTPUT_DECORATOR]: (node) => {
        context.report({ node, messageId: 'preferOutputEmitterRef' });
      },
      [`${Selectors.decoratorDefinition(decoratorsPattern)} > ClassBody > PropertyDefinition:not([readonly=true])`]:
        (node: TSESTree.PropertyDefinition) => {
          let shouldBeReadonly: boolean;
          if (node.typeAnnotation) {
            const typeAnnotation = node.typeAnnotation.typeAnnotation;
            shouldBeReadonly =
              typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
              typeAnnotation.typeArguments !== undefined &&
              typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier &&
              typeAnnotation.typeName.name === 'OutputEmitterRef';
          } else {
            shouldBeReadonly =
              node.value?.type === AST_NODE_TYPES.CallExpression &&
              node.value.callee.type === AST_NODE_TYPES.Identifier &&
              node.value.callee.name === 'output';
          }

          if (shouldBeReadonly) {
            context.report({
              node: node.key,
              messageId: 'preferReadonly',
              fix: (fixer) => fixer.insertTextBefore(node.key, 'readonly '),
            });
          }
        },
    };
  },
});
