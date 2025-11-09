import {
  ASTUtils,
  RuleFixes,
  isNotNullOrUndefined,
  Selectors,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds =
  | 'useComponentViewEncapsulation'
  | 'suggestRemoveViewEncapsulationNone';
export const RULE_NAME = 'use-component-view-encapsulation';
const VIEW_ENCAPSULATION_NONE = 'ViewEncapsulation.None';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Disallows using \`${VIEW_ENCAPSULATION_NONE}\``,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      useComponentViewEncapsulation: `Using \`${VIEW_ENCAPSULATION_NONE}\` makes your styles global, which may have an unintended effect`,
      suggestRemoveViewEncapsulationNone: `Remove \`${VIEW_ENCAPSULATION_NONE}\``,
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      [`${Selectors.COMPONENT_CLASS_DECORATOR} ${Selectors.metadataProperty(
        'encapsulation',
      )} > MemberExpression[object.name='ViewEncapsulation'] > Identifier[name='None']`](
        node: TSESTree.Identifier & {
          parent: TSESTree.MemberExpression & { parent: TSESTree.Property };
        },
      ) {
        context.report({
          node,
          messageId: 'useComponentViewEncapsulation',
          suggest: [
            {
              messageId: 'suggestRemoveViewEncapsulationNone',
              fix: (fixer) => {
                const importDeclarations =
                  ASTUtils.getImportDeclarations(node, '@angular/core') ?? [];

                return [
                  RuleFixes.getNodeToCommaRemoveFix(
                    sourceCode,
                    node.parent.parent,
                    fixer,
                  ),
                  RuleFixes.getImportRemoveFix(
                    sourceCode,
                    importDeclarations,
                    'ViewEncapsulation',
                    fixer,
                  ),
                ].filter(isNotNullOrUndefined);
              },
            },
          ],
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Setting encapsulation to ViewEncapsulation.None disables Angular's view encapsulation, making the component's styles global and affecting the entire application. This breaks component isolation and can cause unexpected styling conflicts throughout your app. When multiple components use ViewEncapsulation.None, their styles can interfere with each other in unpredictable ways, making it extremely difficult to reason about styling. A style intended for one component might accidentally affect completely unrelated components. This defeats one of Angular's key benefits: component style isolation. ViewEncapsulation.None is occasionally necessary for specific edge cases (like styling dynamically inserted content), but it should be avoided in normal component development. Use the default Emulated encapsulation, or ShadowDom for native Shadow DOM, to keep component styles properly isolated.",
};
