import {
  ASTUtils,
  Selectors,
  SelectorUtils,
  toHumanReadableText,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [
  {
    prefixes: string[];
  },
];
export type MessageIds = 'pipePrefix';
export const RULE_NAME = 'pipe-prefix';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce consistent prefix for pipes.',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          prefixes: {
            type: 'array',
            items: {
              type: 'string',
            },
            minimum: 1,
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      pipePrefix: '@Pipes should be prefixed by {{prefixes}}',
    },
  },
  defaultOptions: [
    {
      prefixes: [],
    },
  ],
  create(context, [{ prefixes }]) {
    function checkValidOption(prefixes: unknown) {
      return Array.isArray(prefixes) && prefixes.length > 0;
    }

    return {
      [Selectors.PIPE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const nameSelector = ASTUtils.getDecoratorPropertyValue(node, 'name');

        if (!nameSelector) {
          return;
        }

        const isValidOption = checkValidOption(prefixes);

        if (!isValidOption) {
          return;
        }

        const allowPrefixesExpression = prefixes.join('|');
        const prefixValidator = SelectorUtils.SelectorValidator.prefix(
          allowPrefixesExpression,
          'camelCase',
        );

        let nameValue;

        if (ASTUtils.isStringLiteral(nameSelector)) {
          nameValue = nameSelector.value;
        } else if (
          ASTUtils.isTemplateLiteral(nameSelector) &&
          nameSelector.quasis[0]
        ) {
          nameValue = nameSelector.quasis[0].value.raw as string;
        }

        if (!nameValue) {
          return;
        }

        if (!prefixValidator.apply(this, [nameValue])) {
          context.report({
            node: nameSelector,
            messageId: 'pipePrefix',
            data: {
              prefixes: toHumanReadableText(prefixes),
            },
          });
        }
      },
    };
  },
});
