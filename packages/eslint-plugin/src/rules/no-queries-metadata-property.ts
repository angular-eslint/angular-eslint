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
    "Using the 'queries' metadata property (@Component({ queries: { child: new ViewChild('ref') } })) is discouraged in favor of decorator syntax (@ViewChild('ref')) because: (1) decorators make it immediately clear which properties are view/content queries when reading the class, (2) decorators allow configuration right next to the property declaration, (3) decorator syntax works better with IDE features and TypeScript type checking, and (4) the decorator approach is the standard modern Angular pattern. The metadata property approach is a legacy pattern that makes code harder to read and maintain.",
};
