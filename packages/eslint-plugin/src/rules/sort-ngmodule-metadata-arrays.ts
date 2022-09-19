import { Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [
  {
    readonly locale: string;
  },
];
export type MessageIds = 'sortNgmoduleMetadataArrays';
export const RULE_NAME = 'sort-ngmodule-metadata-arrays';
const DEFAULT_LOCALE = 'en-US';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures ASC alphabetical order for `NgModule` metadata arrays for easy visual scanning',
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
      sortNgmoduleMetadataArrays:
        '`NgModule` metadata arrays should be sorted in ASC alphabetical order',
    },
  },
  defaultOptions: [
    {
      locale: DEFAULT_LOCALE,
    },
  ],
  create(context, [{ locale }]) {
    return {
      [`${Selectors.MODULE_CLASS_DECORATOR} Property[key.name!="deps"] > ArrayExpression`]({
        elements,
      }: TSESTree.ArrayExpression) {
        const unorderedNodes = elements
          .filter(TSESLintASTUtils.isIdentifier)
          .map((current, index, list) => [current, list[index + 1]])
          .find(([current, next]) => {
            return next && current.name.localeCompare(next.name, locale) === 1;
          });

        if (!unorderedNodes) return;

        const [unorderedNode, nextNode] = unorderedNodes;
        context.report({
          node: nextNode,
          messageId: 'sortNgmoduleMetadataArrays',
          fix: (fixer) => [
            fixer.replaceText(unorderedNode, nextNode.name),
            fixer.replaceText(nextNode, unorderedNode.name),
          ],
        });
      },
    };
  },
});
