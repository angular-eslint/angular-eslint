import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Mode = 'array' | 'string';
export type Options = [mode: Mode];
export type MessageIds =
  | 'useStylesArray'
  | 'useStylesString'
  | 'useStyleUrl'
  | 'useStyleUrls';
export const RULE_NAME = 'consistent-component-styles';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures consistent usage of `styles`/`styleUrls`/`styleUrl` within Component metadata',
    },
    fixable: 'code',
    schema: [
      {
        type: 'string',
        enum: ['array', 'string'],
      },
    ],
    messages: {
      useStyleUrl:
        'Use `styleUrl` instead of `styleUrls` for a single stylesheet',
      useStyleUrls: 'Use `styleUrls` instead of `styleUrl`',
      useStylesArray:
        'Use a `string[]` instead of a `string` for the `styles` property',
      useStylesString:
        'Use a `string` instead of a `string[]` for the `styles` property',
    },
  },
  defaultOptions: ['string'],
  create(context, [mode]) {
    const { COMPONENT_CLASS_DECORATOR, metadataProperty } = Selectors;
    const LITERAL_OR_TEMPLATE_LITERAL = ':matches(Literal, TemplateLiteral)';

    if (mode === 'array') {
      const stylesStringExpression = `${COMPONENT_CLASS_DECORATOR} ${metadataProperty(
        'styles',
      )} > ${LITERAL_OR_TEMPLATE_LITERAL}`;
      const styleUrlProperty = `${COMPONENT_CLASS_DECORATOR} ${metadataProperty(
        'styleUrl',
      )}:has(:matches(Literal, TemplateElement))`;

      return {
        [stylesStringExpression](
          node: TSESTree.Literal | TSESTree.TemplateLiteral,
        ) {
          context.report({
            node,
            messageId: 'useStylesArray',
            fix: (fixer) => {
              return fixer.replaceText(
                node,
                ASTUtils.isStringLiteral(node)
                  ? `[${node.raw}]`
                  : `[${context.sourceCode.getText(node)}]`,
              );
            },
          });
        },

        [styleUrlProperty](node: TSESTree.Property) {
          context.report({
            node,
            messageId: 'useStyleUrls',
            fix: (fixer) => {
              return fixer.replaceText(
                node,
                ASTUtils.isStringLiteral(node.value)
                  ? `styleUrls: [${node.value.raw}]`
                  : `styleUrls: [${context
                      .getSourceCode()
                      .getText(node.value)}]`,
              );
            },
          });
        },
      };
    } else {
      const singleArrayStringLiteral = `ArrayExpression:matches([elements.length=1]:has(${LITERAL_OR_TEMPLATE_LITERAL}))`;
      const singleStylesArrayExpression = `${COMPONENT_CLASS_DECORATOR} ${metadataProperty(
        'styles',
      )} > ${singleArrayStringLiteral}`;
      const singleStyleUrlsProperty = `${COMPONENT_CLASS_DECORATOR} ${metadataProperty(
        'styleUrls',
      )}:has(${singleArrayStringLiteral})`;

      return {
        [singleStylesArrayExpression](node: TSESTree.ArrayExpression) {
          // The selector ensures the element is not null.
          const el = node.elements[0]!;

          context.report({
            node,
            messageId: 'useStylesString',
            fix: (fixer) => {
              return fixer.replaceText(
                node,
                ASTUtils.isStringLiteral(el)
                  ? el.raw
                  : context.sourceCode.getText(el),
              );
            },
          });
        },
        [singleStyleUrlsProperty](node: TSESTree.Property) {
          // The selector ensures the value is an array with a single non-null element.
          const el = (node.value as TSESTree.ArrayExpression).elements[0]!;

          context.report({
            node,
            messageId: 'useStyleUrl',
            fix: (fixer) => {
              return fixer.replaceText(
                node,
                ASTUtils.isStringLiteral(el)
                  ? `styleUrl: ${el.raw}`
                  : `styleUrl: ${context.sourceCode.getText(el)}`,
              );
            },
          });
        },
      };
    }
  },
});
