import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noQueriesMetadataProperty';
export const RULE_NAME = 'no-queries-metadata-property';

const METADATA_PROPERTY_NAME = 'queries';
const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-05-12';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Disallows usage of the \`${METADATA_PROPERTY_NAME}\` metadata property. See more at ${STYLE_GUIDE_LINK}.`,
      recommended: false,
    },
    schema: [],
    messages: {
      noQueriesMetadataProperty: `Use @${ASTUtils.AngularInnerClassDecorators.Output} rather than the \`${METADATA_PROPERTY_NAME}\` metadata property (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [Selectors.COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR](
        node: TSESTree.Decorator,
      ) {
        const propertyExpression = ASTUtils.getDecoratorPropertyValue(
          node,
          METADATA_PROPERTY_NAME,
        );
        if (!propertyExpression) {
          return;
        }

        context.report({
          node: propertyExpression.parent as TSESTree.Property,
          messageId: 'noQueriesMetadataProperty',
        });
      },
    };
  },
});
