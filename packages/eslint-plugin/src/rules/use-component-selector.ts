import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'useComponentSelector';
export const RULE_NAME = 'use-component-selector';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Component selector must be declared',
    },
    schema: [],
    messages: {
      useComponentSelector: 'The selector of the component is mandatory',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [Selectors.COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const selector = ASTUtils.getDecoratorPropertyValue(node, 'selector');

        if (
          selector &&
          ((ASTUtils.isStringLiteral(selector) && selector.value.length) ||
            ASTUtils.isTemplateLiteral(selector))
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'useComponentSelector',
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Every component should have a selector that defines how it's used in templates. Omitting the selector makes the component unusable in templates and can only be used with dynamic component loading or routing, which is rarely the intent. When debugging, components without selectors are harder to identify in the component tree and browser DevTools. If a component is truly only meant for dynamic loading (like a modal or route component), you can disable this rule for that component, but in most cases, every component should have a meaningful selector.",
};
