import {
  ASTUtils,
  Selectors,
  toHumanReadableText,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [{ readonly prefixes: readonly string[] }];
export type MessageIds = 'noInputPrefix';
export const RULE_NAME = 'no-input-prefix';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that input bindings, including aliases, are not named or prefixed by the configured disallowed prefixes',
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
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noInputPrefix:
        'Input bindings, including aliases, should not be named, nor prefixed by {{prefixes}}',
    },
  },
  defaultOptions: [{ prefixes: [] }],
  create(context, [{ prefixes }]) {
    const selectors = [
      Selectors.INPUTS_METADATA_PROPERTY_LITERAL,
      Selectors.INPUT_ALIAS,
      Selectors.INPUT_PROPERTY_OR_SETTER,
    ].join(',');

    return {
      [selectors](
        node: TSESTree.Identifier | TSESTree.Literal | TSESTree.TemplateElement,
      ) {
        const [propertyName, aliasName] = ASTUtils.getRawText(node)
          .replace(/\s/g, '')
          .split(':');
        const hasDisallowedPrefix = prefixes.some((prefix) =>
          isDisallowedPrefix(prefix, propertyName, aliasName),
        );

        if (!hasDisallowedPrefix) {
          return;
        }

        context.report({
          node,
          messageId: 'noInputPrefix',
          data: {
            prefixes: toHumanReadableText(prefixes),
          },
        });
      },
    };
  },
});

function isDisallowedPrefix(
  prefix: string,
  propertyName: string,
  aliasName: string,
): boolean {
  const prefixPattern = RegExp(`^${prefix}(([^a-z])|(?=$))`);
  return prefixPattern.test(propertyName) || prefixPattern.test(aliasName);
}
