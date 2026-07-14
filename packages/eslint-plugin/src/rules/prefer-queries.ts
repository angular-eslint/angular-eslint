import { Selectors, toPattern } from '@angular-eslint/utils';
import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'preferQueries';
export const RULE_NAME = 'prefer-queries';

const DOCUMENT_QUERY_METHODS = new Set([
  'getElementById',
  'getElementsByClassName',
  'getElementsByName',
  'getElementsByTagName',
  'querySelector',
  'querySelectorAll',
]);

const angularDecoratorsPattern = toPattern(['Component', 'Directive']);

function isDocumentQueryCall(node: TSESTree.CallExpression): boolean {
  if (node.callee.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }

  const { object, property } = node.callee;

  if (
    property.type !== AST_NODE_TYPES.Identifier ||
    !DOCUMENT_QUERY_METHODS.has(property.name)
  ) {
    return false;
  }

  if (object.type === AST_NODE_TYPES.Identifier && object.name === 'document') {
    return true;
  }

  if (
    object.type === AST_NODE_TYPES.MemberExpression &&
    object.property.type === AST_NODE_TYPES.Identifier &&
    object.property.name === 'document'
  ) {
    return true;
  }

  return false;
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows direct DOM querying via `document` methods inside Angular components and directives and suggests using Angular queries such as `viewChild`, `viewChildren`, `contentChild`, or `contentChildren` instead.',
    },
    schema: [],
    messages: {
      preferQueries:
        'Avoid querying the DOM directly via `document.{{ method }}()`. Use Angular queries such as `viewChild()`, `viewChildren()`, `contentChild()`, or `contentChildren()` instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [`${Selectors.decoratorDefinition(angularDecoratorsPattern)} CallExpression`](
        node: TSESTree.CallExpression,
      ): void {
        if (!isDocumentQueryCall(node)) {
          return;
        }

        const method = (
          (node.callee as TSESTree.MemberExpression)
            .property as TSESTree.Identifier
        ).name;

        context.report({
          node,
          messageId: 'preferQueries',
          data: { method },
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Direct DOM querying via `document.getElementById()`, `document.querySelector()`, and similar methods bypasses Angular's component encapsulation and change detection. These calls create tight coupling between component logic and the DOM structure, making the code fragile to template changes. Angular provides first-class [query APIs](https://angular.dev/guide/components/queries) — `viewChild()`, `viewChildren()`, `contentChild()`, and `contentChildren()` — that integrate with the component lifecycle, work with Angular's rendering pipeline, and are automatically updated when the view changes. Using Angular queries also improves testability because they can be resolved in Angular's testing environment without requiring a real DOM.",
};
