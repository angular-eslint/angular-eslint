import { Selectors, toPattern } from '@angular-eslint/utils';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];

export type MessageIds = 'injectAtTop';
export const RULE_NAME = 'inject-at-top';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Requires inject() calls to be declared at the top of the class, before any other member',
    },
    schema: [],
    messages: {
      injectAtTop:
        'Move this inject() to the top of the class. Class fields are initialized in the order they are written, so anything declared above this line cannot safely use the service yet.',
    },
  },
  defaultOptions: [],
  create(context) {
    const angularDecoratorsPattern = toPattern([
      'Component',
      'Directive',
      'Injectable',
      'Pipe',
    ]);

    function hasEagerInject(node: TSESTree.Node | null): boolean {
      if (!node) {
        return false;
      }

      if (
        node.type === AST_NODE_TYPES.CallExpression &&
        node.callee.type === AST_NODE_TYPES.Identifier &&
        node.callee.name === 'inject'
      ) {
        return true;
      }

      const isFn =
        node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        node.type === AST_NODE_TYPES.FunctionExpression;

      const isIIFE =
        isFn &&
        node.parent?.type === AST_NODE_TYPES.CallExpression &&
        node.parent.callee === node;

      if (node.type === AST_NODE_TYPES.ClassExpression || (isFn && !isIIFE)) {
        return false;
      }

      return Object.values(node)
        .flat()
        .some(
          (child) =>
            child &&
            typeof child === 'object' &&
            'type' in child &&
            child !== node.parent &&
            hasEagerInject(child as TSESTree.Node),
        );
    }

    return {
      [`${Selectors.decoratorDefinition(
        angularDecoratorsPattern,
      )} > ClassBody`](node: TSESTree.ClassBody) {
        let seenNonInject = false;

        for (const member of node.body) {
          if ('static' in member && member.static) {
            continue;
          }

          if (
            member.type === AST_NODE_TYPES.PropertyDefinition &&
            hasEagerInject(member.value)
          ) {
            if (seenNonInject) {
              context.report({ node: member, messageId: 'injectAtTop' });
            }

            continue;
          }

          seenNonInject = true;
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Class fields are initialized in the order they are declared, so a field that calls inject() only creates its value when the initializer runs. Anything declared above that line which tries to read the injected service will see undefined, and the error message (usually something like 'Cannot read properties of undefined') points at the consumer, not at the field that was initialized out of order. TypeScript catches the obvious shape of this bug when a later-declared field is referenced directly from an earlier initializer, but it does not trace through a getter body or a method call, so the moment the read of this.someService happens behind that indirection the compiler lets it through and the failure only shows up at runtime. The scenario is deceptively easy to introduce: a getter that reads an injected service is defined below the inject() call, someone later adds a small convenience field above the getter that references it, and the class breaks at construction time even though nothing about the change looks suspicious. Keeping every inject() call at the very top of the class removes the ordering concern entirely, because every dependency is guaranteed to exist before any other field, getter, method, or constructor statement runs.",
};
