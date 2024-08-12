import {
  ASTUtils,
  Selectors,
  toHumanReadableText,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [{ readonly prefixes: readonly string[] }];
export type MessageIds = 'noInputPrefix';
export const RULE_NAME = 'no-input-prefix';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that input bindings, including aliases, are not named or prefixed by the configured disallowed prefixes',
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
    return {
      [Selectors.INPUT_PROPERTY_OR_SETTER](
        node: TSESTree.Identifier | TSESTree.Literal | TSESTree.TemplateElement,
      ) {
        const rawPropertyName = ASTUtils.getRawText(node);
        const hasDisallowedPrefix = prefixes.some((prefix) =>
          isDisallowedPrefix(prefix, rawPropertyName),
        );

        // Direct violation on the property name
        if (hasDisallowedPrefix) {
          context.report({
            node,
            messageId: 'noInputPrefix',
            data: {
              prefixes: toHumanReadableText(prefixes),
            },
          });
        }

        // Check if decorator alias has a violation
        let aliasProperty: TSESTree.Node | undefined;
        if (!node.parent) {
          return;
        }
        const inputDecorator = ASTUtils.getDecorator(
          node.parent as any,
          'Input',
        );

        if (
          inputDecorator &&
          ASTUtils.isCallExpression(inputDecorator.expression)
        ) {
          // Angular 16+ alias property syntax
          aliasProperty = ASTUtils.getDecoratorPropertyValue(
            inputDecorator,
            'alias',
          );
          let aliasValue = '';
          let aliasArg: TSESTree.Node | undefined;
          if (aliasProperty) {
            aliasValue = ASTUtils.getRawText(aliasProperty);
          } else if (
            inputDecorator.expression.arguments.length > 0 &&
            (ASTUtils.isLiteral(inputDecorator.expression.arguments[0]) ||
              ASTUtils.isTemplateLiteral(
                inputDecorator.expression.arguments[0],
              ))
          ) {
            aliasArg = inputDecorator.expression.arguments[0];
            aliasValue = ASTUtils.getRawText(aliasArg);
          }
          const hasDisallowedPrefix = prefixes.some((prefix) =>
            isDisallowedPrefix(prefix, aliasValue),
          );
          if (!hasDisallowedPrefix) {
            return;
          }

          return context.report({
            node: aliasProperty || aliasArg || node,
            messageId: 'noInputPrefix',
            data: {
              prefixes: toHumanReadableText(prefixes),
            },
          });
        }
      },
      [Selectors.INPUTS_METADATA_PROPERTY_LITERAL](
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
  aliasName = '',
): boolean {
  const prefixPattern = new RegExp(`^${prefix}(([^a-z])|(?=$))`);
  return prefixPattern.test(propertyName) || prefixPattern.test(aliasName);
}
