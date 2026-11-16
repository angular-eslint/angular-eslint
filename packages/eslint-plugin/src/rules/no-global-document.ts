import { ASTUtils as AngularASTUtils } from '@angular-eslint/utils';
import type { TSESLint } from '@typescript-eslint/utils';
import {
  AST_NODE_TYPES,
  ASTUtils,
  type TSESTree,
} from '@typescript-eslint/utils';
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

const ANGULAR_CORE = '@angular/core';
const COMPONENT_DECORATORS: ReadonlySet<string> = new Set([
  'Component',
  'Directive',
]);
const SERVICE_DECORATORS: ReadonlySet<string> = new Set([
  'Injectable',
  'Pipe',
  'Service',
]);
const GLOBAL_OBJECT_NAMES = ['window', 'globalThis'] as const;

type ClassNode = TSESTree.ClassDeclaration | TSESTree.ClassExpression;

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
    const { sourceCode } = context;
    const isAngularClassCache = new Map<ClassNode, boolean>();

    function isCheckedDecoratorName(name: string | undefined): boolean {
      if (name === undefined) return false;
      return (
        COMPONENT_DECORATORS.has(name) ||
        (!!checkServices && SERVICE_DECORATORS.has(name))
      );
    }

    function getImportDefinition(
      identifier: TSESTree.Identifier,
    ):
      | TSESTree.ImportSpecifier
      | TSESTree.ImportNamespaceSpecifier
      | TSESTree.ImportDefaultSpecifier
      | undefined {
      const variable = ASTUtils.findVariable(
        sourceCode.getScope(identifier),
        identifier,
      );
      const definition = variable?.defs.find(
        (def) => def.type === 'ImportBinding',
      );
      if (
        !definition ||
        definition.parent?.type !== AST_NODE_TYPES.ImportDeclaration ||
        definition.parent.source.value !== ANGULAR_CORE
      ) {
        return undefined;
      }
      return definition.node as
        | TSESTree.ImportSpecifier
        | TSESTree.ImportNamespaceSpecifier
        | TSESTree.ImportDefaultSpecifier;
    }

    /**
     * Resolves the Angular name of a class decorator. Supports the plain form
     * (`@Component`), aliased imports from `@angular/core`
     * (`import { Component as C }`) and namespace imports from `@angular/core`
     * (`import * as core from '@angular/core'; @core.Component`).
     *
     * A plain identifier that is not imported from `@angular/core` is matched
     * by name, consistent with the other rules in this plugin.
     */
    function getAngularDecoratorName(
      decorator: TSESTree.Decorator,
    ): string | undefined {
      const callee =
        decorator.expression.type === AST_NODE_TYPES.CallExpression
          ? decorator.expression.callee
          : decorator.expression;

      if (callee.type === AST_NODE_TYPES.Identifier) {
        const importDefinition = getImportDefinition(callee);
        if (importDefinition?.type === AST_NODE_TYPES.ImportSpecifier) {
          const { imported } = importDefinition;
          return imported.type === AST_NODE_TYPES.Identifier
            ? imported.name
            : imported.value;
        }
        if (importDefinition) return undefined;
        return AngularASTUtils.getDecoratorName(decorator);
      }

      if (
        callee.type === AST_NODE_TYPES.MemberExpression &&
        !callee.computed &&
        callee.object.type === AST_NODE_TYPES.Identifier &&
        callee.property.type === AST_NODE_TYPES.Identifier &&
        getImportDefinition(callee.object)?.type ===
          AST_NODE_TYPES.ImportNamespaceSpecifier
      ) {
        return callee.property.name;
      }

      return undefined;
    }

    function isAngularClass(node: ClassNode): boolean {
      let result = isAngularClassCache.get(node);
      if (result === undefined) {
        result =
          node.decorators?.some((decorator) =>
            isCheckedDecoratorName(getAngularDecoratorName(decorator)),
          ) ?? false;
        isAngularClassCache.set(node, result);
      }
      return result;
    }

    /**
     * Only the nearest enclosing class counts, so a plain class declared
     * inside a method of an Angular class is not treated as Angular.
     */
    function isInsideAngularClass(node: TSESTree.Node): boolean {
      for (
        let current: TSESTree.Node | undefined = node.parent;
        current;
        current = current.parent
      ) {
        if (
          current.type === AST_NODE_TYPES.ClassDeclaration ||
          current.type === AST_NODE_TYPES.ClassExpression
        ) {
          return isAngularClass(current);
        }
      }
      return false;
    }

    /**
     * Returns the value references to the real global variable `name`, that
     * is, references that are not shadowed by any declaration in the file.
     */
    function getGlobalValueReferences(
      globalScope: TSESLint.Scope.Scope,
      name: string,
    ): TSESLint.Scope.Reference[] {
      const references: TSESLint.Scope.Reference[] = [];
      const variable = globalScope.set.get(name);
      // A variable with definitions was declared by the user (e.g. a top-level
      // `var` in a script), so it is not the browser global.
      if (variable && variable.defs.length === 0) {
        references.push(...variable.references);
      }
      for (const reference of globalScope.through) {
        if (reference.identifier.name === name) references.push(reference);
      }
      return references.filter(
        (reference) =>
          reference.isValueReference &&
          !isInTypeQuery(reference.identifier as TSESTree.Node),
      );
    }

    return {
      'Program:exit'(program: TSESTree.Program) {
        const globalScope = sourceCode.getScope(program);

        for (const { identifier } of getGlobalValueReferences(
          globalScope,
          'document',
        )) {
          if (isInsideAngularClass(identifier as TSESTree.Node)) {
            context.report({ node: identifier, messageId: 'noGlobalDocument' });
          }
        }

        for (const name of GLOBAL_OBJECT_NAMES) {
          for (const { identifier } of getGlobalValueReferences(
            globalScope,
            name,
          )) {
            const node = getDocumentAccess(identifier as TSESTree.Identifier);
            if (node && isInsideAngularClass(node)) {
              context.report({ node, messageId: 'noGlobalDocument' });
            }
          }
        }
      },
    };
  },
});

/**
 * `typeof document` in a type position (e.g. `let d: typeof document`) is a
 * value reference for the scope manager, but it never runs.
 */
function isInTypeQuery(node: TSESTree.Node): boolean {
  let current = node;
  while (current.parent?.type === AST_NODE_TYPES.TSQualifiedName) {
    current = current.parent;
  }
  return current.parent?.type === AST_NODE_TYPES.TSTypeQuery;
}

function isDocumentKey(key: TSESTree.Node, computed: boolean): boolean {
  if (!computed) {
    return key.type === AST_NODE_TYPES.Identifier && key.name === 'document';
  }
  if (key.type === AST_NODE_TYPES.Literal) return key.value === 'document';
  return (
    key.type === AST_NODE_TYPES.TemplateLiteral &&
    key.expressions.length === 0 &&
    key.quasis[0].value.cooked === 'document'
  );
}

/**
 * Given a reference to the global `window` or `globalThis`, returns the node
 * that reads `document` from it, if any:
 * - `window.document`, `window?.document`, `window['document']`
 * - `const { document } = window`, `({ document } = window)`
 */
function getDocumentAccess(
  identifier: TSESTree.Identifier,
): TSESTree.Node | undefined {
  const { parent } = identifier;

  if (
    parent.type === AST_NODE_TYPES.MemberExpression &&
    parent.object === identifier &&
    isDocumentKey(parent.property, parent.computed)
  ) {
    return parent;
  }

  let pattern: TSESTree.Node | undefined;
  if (
    parent.type === AST_NODE_TYPES.VariableDeclarator &&
    parent.init === identifier
  ) {
    pattern = parent.id;
  } else if (
    parent.type === AST_NODE_TYPES.AssignmentExpression &&
    parent.right === identifier
  ) {
    pattern = parent.left;
  }

  if (pattern?.type === AST_NODE_TYPES.ObjectPattern) {
    return pattern.properties.find(
      (property) =>
        property.type === AST_NODE_TYPES.Property &&
        isDocumentKey(property.key, property.computed),
    );
  }

  return undefined;
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    "The global `document` object only exists in the browser. When an Angular application is rendered on the server (SSR or prerendering), components, directives, services and pipes are instantiated in Node.js, where there is no global `document`, so any access to it throws a `ReferenceError` and breaks the render. Angular provides the `DOCUMENT` injection token as the platform-safe abstraction: `private readonly document = inject(DOCUMENT)`. It resolves to the real `document` in the browser and to the server-side document that Angular renders into on the server. Working around the missing global, for example with a `typeof document` check, makes the server and the browser render different output, which can cause hydration mismatches. Injecting the token also keeps the dependency explicit and lets tests provide their own document instead of patching global state. For elements in a component's own template, prefer Angular's queries such as `viewChild()` and `contentChild()` over looking them up through the document, which keeps the component encapsulated. The rule reports every use of the global `document` inside an Angular class, including `window.document`, `globalThis.document` and destructuring such as `const { document } = window`. `typeof document` checks in code are reported too: inject the token instead, and use `isPlatformBrowser()` or `afterNextRender()` for code that must only run in the browser. Local variables, parameters and class members named `document`, such as `this.document`, are not reported. For more information see the [Angular SSR guide](https://angular.dev/guide/ssr).",
};
