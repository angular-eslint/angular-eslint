import { Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [
  {
    readonly locale: string;
  },
];

export type MessageIds = 'sortImportsMetadata';
export const RULE_NAME = 'sort-imports-metadata';
const DEFAULT_LOCALE = 'en-US';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures ASC alphabetical order for import arrays for easy visual scanning',
      recommended: false,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          locale: {
            type: 'string',
            description: 'A string with a BCP 47 language tag.',
            default: DEFAULT_LOCALE,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      sortImportsMetadata: 'Imports should be sorted in ASC alphabetical order',
    },
  },
  defaultOptions: [
    {
      locale: DEFAULT_LOCALE,
    },
  ],
  create(context, [{ locale }]) {
    const selectors = [
      `${Selectors.COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR} Property[key.name="imports"] > ArrayExpression`,
      `${Selectors.MODULE_CLASS_DECORATOR} Property[key.name="imports"] > ArrayExpression`,
      `${Selectors.PIPE_CLASS_DECORATOR} Property[key.name="imports"] > ArrayExpression`,
    ].join(',');

    return {
      [selectors]({ elements }: TSESTree.ArrayExpression) {
        const imports = elements.filter(TSESLintASTUtils.isIdentifier);

        if (importsAreSorted(imports, locale)) {
          return;
        }

        imports.sort((importA, importB) =>
          importA.name.localeCompare(importB.name, locale),
        );

        let sortedImportsString = imports
          .map((importEntry) => importEntry.name)
          .toString();
        sortedImportsString = sortedImportsString.replace(/,/g, ', ');

        const firstOriginalElement = elements[0] as TSESTree.Expression;
        const lastOriginalElement = elements[
          elements.length - 1
        ] as TSESTree.Expression;
        const nodeForFixer = firstOriginalElement.parent as TSESTree.Node;

        context.report({
          messageId: 'sortImportsMetadata',
          loc: {
            start: firstOriginalElement.loc.start,
            end: lastOriginalElement.loc.end,
          },
          fix: (fixer) =>
            fixer.replaceText(nodeForFixer, `[${sortedImportsString}]`),
        });
      },
    };
  },
});

function importsAreSorted(
  imports: TSESTree.Identifier[],
  locale: string,
): boolean {
  const importNames = imports.map((importEntry) => importEntry.name);
  let secondIndex;

  for (let firstIndex = 0; firstIndex < importNames.length; firstIndex++) {
    secondIndex = firstIndex + 1;

    if (
      importNames[firstIndex].localeCompare(importNames[secondIndex], locale) >
      0
    ) {
      return false;
    }
  }

  return true;
}
