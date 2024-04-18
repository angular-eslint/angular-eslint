import { Selectors, toPattern } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';

type Options = [
  {
    readonly declarations?: boolean;
    readonly exports?: boolean;
    readonly imports?: boolean;
    readonly providers?: boolean;
  },
];
export type MessageIds = 'noDuplicatesInMetadataArrays';
export const RULE_NAME = 'no-duplicates-in-metadata-arrays';

const DEFAULT_OPTIONS: Options[0] = { imports: true };

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that metadata arrays do not contain duplicate entries.',
      recommended: 'recommended',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          imports: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.imports,
          },
        },
      },
    ],
    messages: {
      noDuplicatesInMetadataArrays: 'Entry is duplicated in metadata array',
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, [{ imports }]) {
    // TODO: How do we want the rule to be configured? By decorator? By metadata array?
    // TODO: For now, configured by metadata array
    const metadataArraysToCheckForNgModule = new Set();

    if (imports) {
      metadataArraysToCheckForNgModule.add('imports');
    }

    return {
      [`${Selectors.MODULE_CLASS_DECORATOR} Property[key.name=${toPattern([
        ...metadataArraysToCheckForNgModule,
      ])}] > ArrayExpression`]({ elements }: TSESTree.ArrayExpression) {
        if (!imports) {
          return;
        } else {
          getDuplicateItems(elements).forEach((duplicateImport) => {
            context.report({
              node: duplicateImport,
              messageId: 'noDuplicatesInMetadataArrays',
              // TODO: Add fixer to remove duplicates
            });
          });
        }
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
