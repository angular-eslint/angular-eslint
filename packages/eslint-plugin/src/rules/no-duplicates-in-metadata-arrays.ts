import { Selectors, toPattern } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';

type Options = [];
export type MessageIds = 'noDuplicatesInMetadataArrays';
export const RULE_NAME = 'no-duplicates-in-metadata-arrays';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that metadata arrays do not contain duplicate entries.',
    },
    schema: [],
    messages: {
      noDuplicatesInMetadataArrays: 'Entry is duplicated in metadata array',
    },
  },
  defaultOptions: [],
  create(context) {
    const selectors = [
      // https://angular.dev/api/core/NgModule
      `${Selectors.MODULE_CLASS_DECORATOR} Property[key.name=${toPattern([
        'providers',
        'declarations',
        'imports',
        'exports',
      ])}] > ArrayExpression`,
      // https://angular.dev/api/core/Component
      `${Selectors.COMPONENT_CLASS_DECORATOR} Property[key.name=${toPattern([
        'imports',
      ])}] > ArrayExpression`,
      // https://angular.dev/api/core/Directive
      `${Selectors.DIRECTIVE_CLASS_DECORATOR} Property[key.name=${toPattern([
        'providers',
      ])}] > ArrayExpression`,
    ].join(',');

    return {
      [selectors]({ elements }: TSESTree.ArrayExpression) {
        getDuplicateItems(elements).forEach((duplicateImport) => {
          context.report({
            node: duplicateImport,
            messageId: 'noDuplicatesInMetadataArrays',
          });
        });
      },
    };
  },
});

function getDuplicateItems(
  elements: (TSESTree.Expression | TSESTree.SpreadElement | null)[],
): TSESTree.Identifier[] {
  const items = elements.filter(TSESLintASTUtils.isIdentifier);
  const uniqueItemNames = new Set();
  const duplicateItems: TSESTree.Identifier[] = [];

  items.forEach((item) => {
    if (uniqueItemNames.has(item.name)) {
      duplicateItems.push(item);
    } else {
      uniqueItemNames.add(item.name);
    }
  });

  return duplicateItems;
}
