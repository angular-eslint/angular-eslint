import {
  ASTUtils,
  getNativeEventNames,
  Selectors,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noOutputNative';
export const RULE_NAME = 'no-output-native';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that output bindings, including aliases, are not named as standard DOM events',
      recommended: 'recommended',
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

export const RULE_DOCS_EXTENSION = {
  rationale: `Naming an @Output() the same as a native DOM event (like 'click', 'change', or 'blur') creates ambiguous and confusing template bindings. For example, if a component has '@Output() click', the template '(click)="handler()"' could be binding to either the component's custom output OR the native DOM click event, depending on the context. This ambiguity leads to bugs and makes code harder to understand. Instead, use descriptive names that clearly indicate these are custom component events, such as 'userSelected' or 'itemDeleted' instead of generic names like 'click' or 'select'.`,
};
