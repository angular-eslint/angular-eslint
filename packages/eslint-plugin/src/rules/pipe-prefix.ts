import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { PIPE_CLASS_DECORATOR } from '../utils/selectors';
import {
  getDecoratorPropertyValue,
  getReadablePrefixes,
  isLiteralWithStringValue,
  isTemplateLiteral,
  SelectorValidator,
} from '../utils/utils';

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
      category: 'Stylistic Issues',
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
      pipePrefix: `@Pipe's name should be prefixed by {{prefixes}}`,
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
      [PIPE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const nameSelector = getDecoratorPropertyValue(node, 'name');

        if (!nameSelector) {
          return;
        }

        const isValidOption = checkValidOption(prefixes);

        if (!isValidOption) {
          return;
        }

        const allowPrefixesExpression = prefixes.join('|');
        const prefixValidator = SelectorValidator.prefix(
          allowPrefixesExpression,
          'camelCase',
        );

        let nameValue;

        if (isLiteralWithStringValue(nameSelector)) {
          nameValue = nameSelector.value;
        } else if (isTemplateLiteral(nameSelector) && nameSelector.quasis[0]) {
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
              prefixes: getReadablePrefixes(prefixes),
            },
          });
        }
      },
    };
  },
});
