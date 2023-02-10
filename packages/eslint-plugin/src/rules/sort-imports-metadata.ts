import { Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
// import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';
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
  create(context /* [{ locale }] */) {
    const selectors = [
      `${Selectors.COMPONENT_CLASS_DECORATOR} Property[key.name!="deps"] > ArrayExpression`,
      `${Selectors.MODULE_CLASS_DECORATOR} Property[key.name!="deps"] > ArrayExpression`,
    ].join(',');

    return {
      [selectors]({ elements }: TSESTree.ArrayExpression) {
        // TODO: Add logic to determine if imports are sorted
        // const imports = elements.filter(TSESLintASTUtils.isIdentifier);
        // imports.sort((importA, importB) => importA.name.localeCompare(importB.name, locale));

        context.report({
          messageId: 'sortImportsMetadata',
          // TODO: Determine which node(s) to report on
          loc: {
            start: elements[0].loc.start,
            end: elements[elements.length - 1].loc.end,
          },
          // TODO: Add auto-fix logic
        });
      },
    };
  },
});
