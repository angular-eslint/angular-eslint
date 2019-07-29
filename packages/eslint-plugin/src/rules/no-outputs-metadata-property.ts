import { TSESTree } from '@typescript-eslint/typescript-estree';
import { createESLintRule } from '../utils/create-eslint-rule';
import { COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR } from '../utils/selectors';
import {
  AngularInnerClassDecorators,
  getDecoratorPropertyValue,
} from '../utils/utils';

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
      description: `Disallows usage of the \`${METADATA_PROPERTY_NAME}\` metadata property. See more at ${STYLE_GUIDE_LINK}.`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noOutputsMetadataProperty: `Use @${
        AngularInnerClassDecorators.Output
      } rather than the \`${METADATA_PROPERTY_NAME}\` metadata property (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const propertyExpression = getDecoratorPropertyValue(
          node,
          METADATA_PROPERTY_NAME,
        );
        if (!propertyExpression) {
          return;
        }

        context.report({
          node: propertyExpression.parent as TSESTree.Property,
          messageId: 'noOutputsMetadataProperty',
        });
      },
    };
  },
});
