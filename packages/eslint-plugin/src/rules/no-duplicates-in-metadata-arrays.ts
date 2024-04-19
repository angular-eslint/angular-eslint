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
    // https://angular.io/api/core/NgModule
    const ngModuleMetadataArrays = new Set([
      'providers',
      'declarations',
      'imports',
      'exports',
    ]);

    // https://angular.io/api/core/Component
    const componentMetadataArrays = new Set(['imports']);

    // https://angular.io/api/core/Directive
    const directiveMetadataArrays = new Set(['providers']);

    const selectors = [
      `${Selectors.MODULE_CLASS_DECORATOR} Property[key.name=${toPattern([
        ...ngModuleMetadataArrays,
      ])}] > ArrayExpression`,
      `${Selectors.COMPONENT_CLASS_DECORATOR} Property[key.name=${toPattern([
        ...componentMetadataArrays,
      ])}] > ArrayExpression`,
      `${Selectors.DIRECTIVE_CLASS_DECORATOR} Property[key.name=${toPattern([
        ...directiveMetadataArrays,
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
