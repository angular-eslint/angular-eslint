import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noOutputsMetadataProperty';
export const RULE_NAME = 'no-outputs-metadata-property';
const METADATA_PROPERTY_NAME = 'outputs';
const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-05-12';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Disallows usage of the \`${METADATA_PROPERTY_NAME}\` metadata property. See more at ${STYLE_GUIDE_LINK}`,
      recommended: 'error',
    },
    schema: [],
    messages: {
      noOutputsMetadataProperty: `Use \`@Output\` rather than the \`${METADATA_PROPERTY_NAME}\` metadata property (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [`${
        Selectors.COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR
      } ${Selectors.metadataProperty(METADATA_PROPERTY_NAME)}`](
        node: TSESTree.Property,
      ) {
        /**
         * Angular v15 introduced the directive composition API: https://angular.io/guide/directive-composition-api
         * Using host directive outputs using this API is not a bad practice and should not be reported
         */
        const ancestorMayBeHostDirectiveAPI = node.parent?.parent?.parent;

        if (
          ancestorMayBeHostDirectiveAPI &&
          ASTUtils.isProperty(ancestorMayBeHostDirectiveAPI)
        ) {
          const hostDirectiveAPIPropertyName = 'hostDirectives';

          if (
            (ASTUtils.isLiteral(ancestorMayBeHostDirectiveAPI.key) &&
              ancestorMayBeHostDirectiveAPI.key.value ===
                hostDirectiveAPIPropertyName) ||
            (TSESLintASTUtils.isIdentifier(ancestorMayBeHostDirectiveAPI.key) &&
              ancestorMayBeHostDirectiveAPI.key.name ===
                hostDirectiveAPIPropertyName)
          ) {
            return;
          }
        }

        context.report({
          node,
          messageId: 'noOutputsMetadataProperty',
        });
      },
    };
  },
});
