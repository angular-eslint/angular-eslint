import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noOutputsMetadataProperty';
export const RULE_NAME = 'no-outputs-metadata-property';
const METADATA_PROPERTY_NAME = 'outputs';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Disallows usage of the \`${METADATA_PROPERTY_NAME}\` metadata property`,
      recommended: 'recommended',
    },
    schema: [],
    messages: {
      noOutputsMetadataProperty: `Use \`@Output\` rather than the \`${METADATA_PROPERTY_NAME}\` metadata property`,
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
         * Angular v15 introduced the directive composition API: https://angular.dev/guide/directives/directive-composition-api
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

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Using the 'outputs' metadata property (@Component({ outputs: ['change'] })) is discouraged in favor of the @Output() decorator because: (1) @Output() makes it immediately clear which properties are event emitters when reading the class, (2) @Output() allows you to rename or configure the output in one place right next to the property, (3) @Output() works better with IDE features like Find References and Rename Refactoring, and (4) the decorator syntax is more consistent with modern Angular development practices. The metadata property obscures the component's interface and requires looking in two places (decorator metadata and class body) to understand the component's public API.",
};
