import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { OUTPUT_DECORATOR } from '../utils/selectors';

type Options = [];
export type MessageIds = 'noOutputOnPrefix';
export const RULE_NAME = 'no-output-on-prefix';
const STYLE_GUIDE_LINK = 'https://angular.io/guide/styleguide#style-05-16';
const OUTPUT_ON_PATTERN = /^on((?![a-z])|(?=$))/;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures that output bindings, including aliases, are not named "on", nor prefixed with it. See more at ${STYLE_GUIDE_LINK}`,
      category: 'Best Practices',
      recommended: 'error',
    },
    schema: [],
    messages: {
      noOutputOnPrefix: `Output bindings, including aliases, should not be named "on", nor prefixed with it (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [],
  create(context) {
    const outputAliasSelector = `ClassProperty ${OUTPUT_DECORATOR} :matches(Literal[value=${OUTPUT_ON_PATTERN}], TemplateElement[value.raw=${OUTPUT_ON_PATTERN}])`;
    const outputPropertySelector = `ClassProperty[computed=false]:has(${OUTPUT_DECORATOR}) > :matches(Identifier[name=${OUTPUT_ON_PATTERN}], Literal[value=${OUTPUT_ON_PATTERN}])`;
    const selectors = [outputAliasSelector, outputPropertySelector].join(',');

    return {
      [selectors](
        node: TSESTree.Identifier | TSESTree.Literal | TSESTree.TemplateElement,
      ) {
        context.report({
          node,
          messageId: 'noOutputOnPrefix',
        });
      },
    };
  },
});
