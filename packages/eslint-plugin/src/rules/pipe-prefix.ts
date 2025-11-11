import {
  ASTUtils,
  Selectors,
  SelectorUtils,
  toHumanReadableText,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [
  {
    prefixes: string[];
  },
];
export type MessageIds = 'pipePrefix' | 'selectorAfterPrefixFailure';
export const RULE_NAME = 'pipe-prefix';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce consistent prefix for pipes.',
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
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      pipePrefix: '@Pipes should be prefixed with {{prefixes}}',
      selectorAfterPrefixFailure:
        '@Pipes should have a selector after the {{prefixes}} prefix',
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
          ASTUtils.OPTION_STYLE_CAMEL_CASE,
        );
        const selectorAfterPrefixValidator =
          SelectorUtils.SelectorValidator.selectorAfterPrefix(
            allowPrefixesExpression,
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
          return;
        }

        if (!selectorAfterPrefixValidator.apply(this, [nameValue])) {
          context.report({
            node: nameSelector,
            messageId: 'selectorAfterPrefixFailure',
            data: {
              prefixes: toHumanReadableText(prefixes),
            },
          });
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Prefixing pipe names helps prevent naming collisions between pipes from different libraries or modules, and makes it clear which pipes belong to your application versus third-party libraries. For example, prefixing with 'app' creates pipe names like 'appCurrency' instead of just 'currency', avoiding conflicts with Angular's built-in pipes.",
};
