import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { COMPONENT_CLASS_DECORATOR } from '../utils/selectors';
import {
  getImportDeclarations,
  getImportRemoveFix,
  getNodeToCommaRemoveFix,
  isNotNullOrUndefined,
} from '../utils/utils';

type Options = [];
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
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      useComponentViewEncapsulation: `Using \`${VIEW_ENCAPSULATION_NONE}\` makes your styles global, which may have an unintended effect`,
      suggestRemoveViewEncapsulationNone: `Remove \`${VIEW_ENCAPSULATION_NONE}\``,
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      [`${COMPONENT_CLASS_DECORATOR} Property[key.name='encapsulation'] > MemberExpression[object.name='ViewEncapsulation'] > Identifier[name='None']`](
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
                  getImportDeclarations(node, '@angular/core') ?? [];

                return [
                  getNodeToCommaRemoveFix(
                    sourceCode,
                    node.parent.parent,
                    fixer,
                  ),
                  getImportRemoveFix(
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
