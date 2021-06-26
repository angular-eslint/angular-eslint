import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'relativeUrlPrefix';
export const RULE_NAME = 'relative-url-prefix';
const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-05-04';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures that URLs uses the prefixes './' and '../'. See more at ${STYLE_GUIDE_LINK}`,
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
    messages: {
      relativeUrlPrefix: `Use './' or '../' prefixes for URLs (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [],
  create(context) {
    const relativeUrlPrefixPattern = /^\.\.?\/.+/;
    const styleUrlLiteralOrTemplateElement = `${Selectors.metadataProperty(
      'styleUrls',
    )} ArrayExpression :matches(Literal, TemplateElement)` as const;
    const templateUrlProperty = `${Selectors.metadataProperty(
      'templateUrl',
    )}[value.type=/^(Template)?Literal$/]` as const;
    const selector =
      `${Selectors.COMPONENT_CLASS_DECORATOR} :matches(${styleUrlLiteralOrTemplateElement}, ${templateUrlProperty})` as const;

    return {
      [selector](
        node:
          | (Omit<TSESTree.PropertyNonComputedName, 'value'> & {
              value: TSESTree.Literal | TSESTree.TemplateLiteral;
            })
          | TSESTree.Literal
          | TSESTree.TemplateElement,
      ) {
        const nodeValue = ASTUtils.isProperty(node) ? node.value : node;
        const url = ASTUtils.getRawText(nodeValue);

        if (!url || relativeUrlPrefixPattern.test(url)) {
          return;
        }

        context.report({
          node: nodeValue,
          messageId: 'relativeUrlPrefix',
          fix: (fixer) =>
            fixer.replaceText(
              nodeValue,
              ASTUtils.getReplacementText(nodeValue, `./${url}`),
            ),
        });
      },
    };
  },
});
