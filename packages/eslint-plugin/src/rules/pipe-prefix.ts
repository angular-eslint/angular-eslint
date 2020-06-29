import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { PIPE_CLASS_DECORATOR } from '../utils/selectors';
import {
  getClassName,
  getDecoratorPropertyValue,
  isLiteral,
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
    type: 'layout',
    docs: {
      description: `Enforce consistent prefix for pipes.`,
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
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      pipePrefix: `The name of the Pipe decorator of class "{{className}}" should start with prefix "{{prefixes}}", however its value is "{{propName}}"`,
    },
  },
  defaultOptions: [
    {
      prefixes: [],
    },
  ],
  create(context, [options]) {
    const { prefixes } = options;

    function checkValidOption(prefixes: any) {
      return Array.isArray(prefixes) && prefixes.length > 0;
    }

    return {
      [PIPE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const rawNameSelector = getDecoratorPropertyValue(node, 'name');
        const classParent = node.parent as TSESTree.ClassDeclaration;
        const className = getClassName(classParent);

        if (!rawNameSelector) {
          return;
        }

        const isValidOption = checkValidOption(prefixes);

        if (!isValidOption) {
          return;
        }

        const prefixStr = prefixes.join(',');
        const prefixExpression = prefixes.join('|');
        const prefixValidator = SelectorValidator.prefix(
          prefixExpression,
          'camelCase',
        );

        let propName = null;

        if (rawNameSelector && isLiteral(rawNameSelector)) {
          propName = rawNameSelector.value as string;
        } else if (
          rawNameSelector &&
          isTemplateLiteral(rawNameSelector) &&
          rawNameSelector.quasis[0]
        ) {
          propName = rawNameSelector.quasis[0].value.raw as string;
        }

        if (propName === null) {
          return;
        }

        if (!prefixValidator.apply(this, [propName])) {
          context.report({
            node: rawNameSelector,
            messageId: 'pipePrefix',
            data: {
              className,
              prefixStr,
              propName,
            },
          });
        }
      },
    };
  },
});
