import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getNativeEventNames } from '../utils/get-native-event-names';
import {
  OUTPUTS_METADATA_PROPERTY,
  OUTPUT_ALIAS,
  OUTPUT_PROPERTY_OR_GETTER,
} from '../utils/selectors';
import { getRawText } from '../utils/utils';

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
      category: 'Best Practices',
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
      OUTPUTS_METADATA_PROPERTY,
      OUTPUT_ALIAS,
      OUTPUT_PROPERTY_OR_GETTER,
    ].join(',');

    return {
      [selectors](
        node:
          | TSESTree.Identifier
          | TSESTree.StringLiteral
          | TSESTree.TemplateElement,
      ) {
        const [propertyName, aliasName] = getRawText(node)
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
