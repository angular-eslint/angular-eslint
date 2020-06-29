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
        const nameSelector = getDecoratorPropertyValue(node, 'name');
        const classParent = node.parent as TSESTree.ClassDeclaration;
        const className = getClassName(classParent);

        if (!nameSelector) {
          return;
        }

        const isValidOption = checkValidOption(prefixes);

        if (!isValidOption) {
          return;
        }

        const allowPrefixesMsg = prefixes.join(',');
        const allowPrefixesExpression = prefixes.join('|');
        const prefixValidator = SelectorValidator.prefix(
          allowPrefixesExpression,
          'camelCase',
        );

        let nameValue = null;

        if (nameSelector && isLiteral(nameSelector)) {
          nameValue = nameSelector.value as string;
        } else if (
          nameSelector &&
          isTemplateLiteral(nameSelector) &&
          nameSelector.quasis[0]
        ) {
          nameValue = nameSelector.quasis[0].value.raw as string;
        }

        if (nameValue === null) {
          return;
        }

        if (!prefixValidator.apply(this, [nameValue])) {
          context.report({
            node: nameSelector,
            messageId: 'pipePrefix',
            data: {
              className,
              prefixStr: allowPrefixesMsg,
              propName: nameValue,
            },
          });
        }
      },
    };
  },
});
