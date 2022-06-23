import {
  ASTUtils,
  getNativeEventNames,
  Selectors,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noOutputNative';
export const RULE_NAME = 'no-output-native';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that output bindings, including aliases, are not named as standard DOM events',
      recommended: 'error',
    },
    schema: [],
    messages: {
      noOutputNative:
        'Output bindings, including aliases, should not be named as standard DOM events',
    },
  },
  defaultOptions: [],
  create(context) {
    const nativeEventNames = getNativeEventNames();
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
          !nativeEventNames.has(propertyName) &&
          !nativeEventNames.has(aliasName)
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'noOutputNative',
        });
      },
    };
  },
});
