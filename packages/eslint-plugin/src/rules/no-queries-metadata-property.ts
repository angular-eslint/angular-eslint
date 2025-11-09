import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noQueriesMetadataProperty';
export const RULE_NAME = 'no-queries-metadata-property';

const METADATA_PROPERTY_NAME = 'queries';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Disallows usage of the \`${METADATA_PROPERTY_NAME}\` metadata property.`,
    },
    schema: [],
    messages: {
      noQueriesMetadataProperty: `Use @${ASTUtils.AngularInnerClassDecorators.Output} rather than the \`${METADATA_PROPERTY_NAME}\` metadata property`,
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

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Using decorators like @ContentChild or @ViewChild allows property renaming in one location.',
};
