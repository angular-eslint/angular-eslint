import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [{ readonly allowStatic?: boolean }];
export type MessageIds = 'noHostMetadataProperty';
export const RULE_NAME = 'no-host-metadata-property';
const DEFAULT_OPTIONS: Options[0] = { allowStatic: false };
const METADATA_PROPERTY_NAME = 'host';
const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-06-03';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Disallows usage of the \`${METADATA_PROPERTY_NAME}\` metadata property. See more at ${STYLE_GUIDE_LINK}`,
      recommended: 'error',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowStatic: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.allowStatic,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noHostMetadataProperty: `Use @${ASTUtils.AngularInnerClassDecorators.HostBinding} or @${ASTUtils.AngularInnerClassDecorators.HostListener} rather than the \`${METADATA_PROPERTY_NAME}\` metadata property (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, [{ allowStatic }]) {
    return {
      [`${Selectors.COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR} Property[key.name="${METADATA_PROPERTY_NAME}"]`](
        node: TSESTree.Property,
      ) {
        const properties =
          allowStatic && ASTUtils.isObjectExpression(node.value)
            ? node.value.properties.filter(isDynamic)
            : [node];

        properties.forEach((property) => {
          context.report({
            node: property,
            messageId: 'noHostMetadataProperty',
          });
        });
      },
    };
  },
});

function startsWithLetter({ [0]: firstLetter }: string) {
  return firstLetter.toLowerCase() !== firstLetter.toUpperCase();
}

function isEmptyStringValue(
  property: TSESTree.Property,
): property is TSESTree.Property & {
  value: TSESTree.Literal & { value: '' };
} {
  return (
    ASTUtils.isStringLiteral(property.value) && property.value.value === ''
  );
}

function isStatic(
  property: TSESTree.Property,
): property is TSESTree.Property & {
  computed: false;
  key: (TSESTree.Identifier | TSESTree.Literal) & { value: string };
} {
  return (
    !property.computed &&
    (TSESLintASTUtils.isIdentifier(property.key) ||
      (ASTUtils.isStringLiteral(property.key) &&
        startsWithLetter(property.key.value)))
  );
}

function isDynamic(
  property: TSESTree.ObjectLiteralElement,
): property is TSESTree.Property {
  return (
    ASTUtils.isProperty(property) &&
    !isStatic(property) &&
    !isEmptyStringValue(property)
  );
}
