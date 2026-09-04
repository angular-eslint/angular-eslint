import { Selectors, toPattern } from '@angular-eslint/utils';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [
  {
    readonly additionalInjectFunctions?: readonly string[];
  },
];

export type MessageIds = 'injectAtTop';
export const RULE_NAME = 'inject-at-top';

const DEFAULT_OPTIONS: Options[number] = { additionalInjectFunctions: [] };

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Requires inject() calls to be declared at the top of the class, before any other member',
    },
    schema: [
      {
        type: 'object',
        properties: {
          additionalInjectFunctions: {
            type: 'array',
            items: {
              type: 'string',
            },
            description:
              'A list of additional functions which perform injection, such as your own `injectTranslations()` helper. Each entry is a regular expression which must match the whole function name, so plain names such as `injectTranslations` work as well as patterns such as `inject[A-Z].*`.',
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      injectAtTop:
        'Move this {{functionName}}() to the top of the class. Class fields are initialized in the order they are written, so anything declared above this line cannot safely use the service yet.',
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, [{ additionalInjectFunctions = [] }]) {
    const angularDecoratorsPattern = toPattern([
      'Component',
      'Directive',
      'Injectable',
      'Pipe',
      'Service',
    ]);

    const injectFunctionsPattern = toPattern([
      'inject',
      ...additionalInjectFunctions,
    ]);

    function findEagerInjectName(node: TSESTree.Node | null): string | null {
      if (!node) {
        return null;
      }

      if (
        node.type === AST_NODE_TYPES.CallExpression &&
        node.callee.type === AST_NODE_TYPES.Identifier &&
        injectFunctionsPattern.test(node.callee.name)
      ) {
        return node.callee.name;
      }

      const isFn =
        node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        node.type === AST_NODE_TYPES.FunctionExpression;

      const isIIFE =
        isFn &&
        node.parent?.type === AST_NODE_TYPES.CallExpression &&
        node.parent.callee === node;

      if (node.type === AST_NODE_TYPES.ClassExpression || (isFn && !isIIFE)) {
        return null;
      }

      for (const child of Object.values(node).flat()) {
        if (
          child &&
          typeof child === 'object' &&
          'type' in child &&
          child !== node.parent
        ) {
          const name = findEagerInjectName(child as TSESTree.Node);

          if (name) {
            return name;
          }
        }
      }

      return null;
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

          if (member.type === AST_NODE_TYPES.PropertyDefinition) {
            const functionName = findEagerInjectName(member.value);

            if (functionName) {
              if (seenNonInject) {
                context.report({
                  node: member,
                  messageId: 'injectAtTop',
                  data: { functionName },
                });
              }

              continue;
            }
          }

          seenNonInject = true;
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Class fields are initialized in the order they are declared, so a field that calls inject() only creates its value when the initializer runs. Anything declared above that line which tries to read the injected service will see undefined, and the error message (usually something like 'Cannot read properties of undefined') points at the consumer, not at the field that was initialized out of order. TypeScript catches the obvious shape of this bug when a later-declared field is referenced directly from an earlier initializer, but it does not trace through a getter body or a method call, so the moment the read of this.someService happens behind that indirection the compiler lets it through and the failure only shows up at runtime. The scenario is deceptively easy to introduce: a getter that reads an injected service is defined below the inject() call, someone later adds a small convenience field above the getter that references it, and the class breaks at construction time even though nothing about the change looks suspicious. Keeping every inject() call at the very top of the class removes the ordering concern entirely, because every dependency is guaranteed to exist before any other field, getter, method, or constructor statement runs. Codebases often wrap inject() in their own helpers, for example an injectTranslations() function that injects a translation service and derives a scoped accessor from it; such a helper has exactly the same ordering constraint, so it can be declared through the additionalInjectFunctions option to be treated like inject() itself.",
};
