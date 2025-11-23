import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  isProperty,
  isPropertyDefinition,
} from '@angular-eslint/utils/src/eslint-plugin/ast-utils';

export type Options = [];
export type MessageIds = 'noImplicitTakeUntilDestroyed';
export const RULE_NAME = 'no-implicit-take-until-destroyed';
const RXJS_INTEROP_LINK =
  'https://angular.dev/ecosystem/rxjs-interop/take-until-destroyed';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Ensures that \`takeUntilDestroyed()\` is called with an explicit \`DestroyRef\` when used outside of an injection context`,
    },
    schema: [],
    messages: {
      noImplicitTakeUntilDestroyed: `\`takeUntilDestroyed()\` must be called with an explicit \`DestroyRef\` parameter when used outside of an injection context (constructor or field initializer). See more at ${RXJS_INTEROP_LINK}`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type !== AST_NODE_TYPES.Identifier ||
          node.callee.name !== 'takeUntilDestroyed' ||
          node.arguments.length > 0 ||
          isInInjectionContext(node)
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'noImplicitTakeUntilDestroyed',
        });
      },
    };
  },
});

function isInInjectionContext(node: TSESTree.Node): boolean {
  let current: TSESTree.Node | undefined = node;

  while (current) {
    if (
      isPropertyDefinition(current) ||
      isConstructorMethod(current) ||
      isInFactoryFunction(current)
    ) {
      return true;
    }

    current = current.parent;
  }

  return false;
}

function isConstructorMethod(node: TSESTree.Node) {
  return (
    node.type === AST_NODE_TYPES.MethodDefinition && node.kind === 'constructor'
  );
}

function isInFactoryFunction(node: TSESTree.Node): boolean {
  if (
    node.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
    node.type !== AST_NODE_TYPES.FunctionExpression
  ) {
    return false;
  }

  const parent = node.parent;

  if (!isProperty(parent)) {
    return false;
  }

  const key = parent.key;

  if (
    key.type === AST_NODE_TYPES.Identifier &&
    ['factory', 'useFactory'].includes(key.name)
  ) {
    return true;
  }

  return false;
}

export const RULE_DOCS_EXTENSION = {
  rationale: `The \`takeUntilDestroyed()\` operator can automatically infer the current component's or directive's \`DestroyRef\` only when called within an injection context — specifically in constructors, field initializers, or factory functions (\`useFactory\` in providers or \`factory\` in InjectionTokens). When used in lifecycle methods like \`ngOnInit()\` or \`ngAfterViewInit()\`, or in regular methods, the injection context is not available, and \`takeUntilDestroyed()\` will throw a runtime error: "NG0203: inject() must be called from an injection context." To fix this, inject \`DestroyRef\` using \`inject(DestroyRef)\` and pass it explicitly: \`takeUntilDestroyed(this.destroyRef)\`. This rule catches these mistakes at compile time, preventing runtime errors that can be difficult to debug.`,
};
