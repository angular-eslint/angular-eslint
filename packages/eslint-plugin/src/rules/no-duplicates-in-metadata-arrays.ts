import { Selectors, toPattern } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';

export type Options = [];
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
        'providers',
        'viewProviders',
        'styleUrls',
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
): (TSESTree.Identifier | TSESTree.StringLiteral)[] {
  const items = elements.filter(
    (element): element is TSESTree.Identifier | TSESTree.StringLiteral =>
      TSESLintASTUtils.isIdentifier(element) ||
      (element?.type === 'Literal' && typeof element.value === 'string'),
  );
  const uniqueItemKeys = new Set<string>();
  const duplicateItems = new Array<
    TSESTree.Identifier | TSESTree.StringLiteral
  >();

  items.forEach((item) => {
    const key = item.type === 'Identifier' ? item.name : item.value;
    if (uniqueItemKeys.has(key)) {
      duplicateItems.push(item);
    } else {
      uniqueItemKeys.add(key);
    }
  });

  return duplicateItems;
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Duplicate entries in Angular metadata arrays like providers, imports, declarations, or exports serve no purpose and indicate a mistake. When the same provider is listed twice in a providers array, Angular will create it twice, potentially leading to unexpected behavior with singleton services. Duplicate imports or declarations simply waste bundle size and make the metadata harder to read. These duplicates typically occur from copy-paste errors, merge conflicts, or refactoring mistakes. Catching these duplicates early prevents subtle bugs and keeps module metadata clean and understandable.',
};
