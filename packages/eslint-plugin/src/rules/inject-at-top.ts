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
      recommended: 'recommended',
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

    function isInjectProperty(member: TSESTree.ClassElement): boolean {
      if (member.type !== AST_NODE_TYPES.PropertyDefinition) {
        return false;
      }
      const value = member.value;
      return (
        value?.type === AST_NODE_TYPES.CallExpression &&
        value.callee.type === AST_NODE_TYPES.Identifier &&
        value.callee.name === 'inject'
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

          if (isInjectProperty(member)) {
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
