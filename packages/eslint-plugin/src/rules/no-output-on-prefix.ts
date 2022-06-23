import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noOutputOnPrefix';
export const RULE_NAME = 'no-output-on-prefix';
const STYLE_GUIDE_LINK = 'https://angular.io/guide/styleguide#style-05-16';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures that output bindings, including aliases, are not named "on", nor prefixed with it. See more at ${STYLE_GUIDE_LINK}`,
      recommended: 'error',
    },
    schema: [],
    messages: {
      noOutputOnPrefix: `Output bindings, including aliases, should not be named "on", nor prefixed with it (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [],
  create(context) {
    const outputOnPattern = /^on(([^a-z])|(?=$))/;
    const selectors = [
      Selectors.OUTPUTS_METADATA_PROPERTY_LITERAL,
      Selectors.OUTPUT_ALIAS,
      Selectors.OUTPUT_PROPERTY_OR_GETTER,
    ].join(',');

    return {
      [selectors](
        node: TSESTree.Identifier | TSESTree.Literal | TSESTree.TemplateElement,
      ) {
        const [propertyName, aliasName] = ASTUtils.getRawText(node)
          .replace(/\s/g, '')
          .split(':');

        if (
          !outputOnPattern.test(propertyName) &&
          !outputOnPattern.test(aliasName)
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'noOutputOnPrefix',
        });
      },
    };
  },
});
