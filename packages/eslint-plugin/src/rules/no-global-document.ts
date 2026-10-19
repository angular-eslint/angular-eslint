import { toPattern } from '@angular-eslint/utils';
import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [
  {
    readonly checkServices?: boolean;
  },
];

export type MessageIds = 'noGlobalDocument';
export const RULE_NAME = 'no-global-document';

const DEFAULT_OPTIONS: Options[number] = {
  checkServices: true,
};

const componentDecorators = ['Component', 'Directive'];
const serviceDecorators = ['Injectable', 'Pipe', 'Service'];

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallows usage of the global `document` inside Angular classes. The global is not available during server-side rendering. Use `inject(DOCUMENT)` instead.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          checkServices: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.checkServices,
            description:
              'Also check @Injectable(), @Pipe() & @Service() in addition to @Component() & @Directive(). Defaults to true because services and pipes also run during server-side rendering.',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noGlobalDocument:
        'Do not use the global `document`. It is not available during server-side rendering. Inject the `DOCUMENT` token instead: `private readonly document = inject(DOCUMENT);`',
    },
  },
  defaultOptions: [{ ...DEFAULT_OPTIONS }],
  create(context, [{ checkServices }]) {
    const decorators = checkServices
      ? [...componentDecorators, ...serviceDecorators]
      : componentDecorators;
    const decoratorsPattern = toPattern(decorators);

    // Stack tracking whether each enclosing class is Angular-decorated
    const classStack: boolean[] = [];

    function isInsideAngularClass(): boolean {
      return (
        classStack.length > 0 && classStack[classStack.length - 1] === true
      );
    }

    function isAngularDecoratedClass(
      node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
    ): boolean {
      return (
        node.decorators?.some(
          (decorator) =>
            decorator.expression.type === AST_NODE_TYPES.CallExpression &&
            decorator.expression.callee.type === AST_NODE_TYPES.Identifier &&
            decoratorsPattern.test(decorator.expression.callee.name),
        ) ?? false
      );
    }

    function isGlobalDocument(node: TSESTree.Identifier): boolean {
      // Walk up scope chain; if 'document' is declared in any non-global scope, it is a local variable
      let scope = context.sourceCode.getScope(node);
      while (scope.type !== 'global') {
        if (scope.set.has('document')) return false;
        if (!scope.upper) return true;
        scope = scope.upper;
      }
      return true;
    }

    return {
      'ClassDeclaration, ClassExpression'(
        node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
      ) {
        classStack.push(isAngularDecoratedClass(node));
      },
      'ClassDeclaration:exit'() {
        classStack.pop();
      },
      'ClassExpression:exit'() {
        classStack.pop();
      },

      'Identifier[name="document"]'(node: TSESTree.Identifier) {
        if (!isInsideAngularClass()) return;

        // Skip when 'document' is a property name, not a variable reference
        const { parent } = node;
        if (
          parent.type === AST_NODE_TYPES.MemberExpression &&
          !parent.computed &&
          parent.property === node
        ) {
          return;
        }
        if (
          (parent.type === AST_NODE_TYPES.PropertyDefinition ||
            parent.type === AST_NODE_TYPES.MethodDefinition ||
            parent.type === AST_NODE_TYPES.Property) &&
          !parent.computed &&
          parent.key === node
        ) {
          return;
        }

        if (!isGlobalDocument(node)) return;

        context.report({ node, messageId: 'noGlobalDocument' });
      },

      // Catch window.document and globalThis.document
      'MemberExpression[computed=false][property.name="document"]'(
        node: TSESTree.MemberExpression,
      ) {
        if (!isInsideAngularClass()) return;

        const { object } = node;
        if (
          object.type !== AST_NODE_TYPES.Identifier ||
          (object.name !== 'window' && object.name !== 'globalThis')
        ) {
          return;
        }

        context.report({ node, messageId: 'noGlobalDocument' });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'The global `document` object is only available in browser environments. Angular applications can run on the server during server-side rendering (SSR) and during hydration, where `document` does not exist and any access to it will throw a runtime error. Angular provides the `DOCUMENT` injection token as the correct abstraction: `private readonly document = inject(DOCUMENT)`. The token resolves to the real `document` in the browser and to a server-safe implementation when running under Angular Universal or the built-in SSR support. Using `inject(DOCUMENT)` also makes components and services easier to test because the token can be overridden in tests without patching global state. The same concern applies to `window.document` and `globalThis.document`, both of which bypass the token and access the global directly. For more information see the [Angular SSR guide](https://angular.dev/guide/ssr).',
};
