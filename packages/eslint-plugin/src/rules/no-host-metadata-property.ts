import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR } from '../utils/selectors';
import {
  AngularInnerClassDecorators,
  isLiteral,
  isProperty,
} from '../utils/utils';

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
      category: 'Best Practices',
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
      noHostMetadataProperty: `Use @${AngularInnerClassDecorators.HostBinding} or @${AngularInnerClassDecorators.HostListener} rather than the \`${METADATA_PROPERTY_NAME}\` metadata property (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, [{ allowStatic }]) {
    return {
      [`${COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR} Property[key.name="${METADATA_PROPERTY_NAME}"]`](
        node: TSESTree.Property & { value: TSESTree.ObjectExpression },
      ) {
        const properties = allowStatic
          ? node.value.properties.filter(isDynamicProperty)
          : [node];

        properties.forEach((property: TSESTree.Property) => {
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

function isDynamicProperty(
  property: TSESTree.ObjectLiteralElement,
): property is TSESTree.Property & {
  key: TSESTree.Literal & { value: string };
} {
  return (
    isProperty(property) &&
    isLiteral(property.key) &&
    typeof property.key.value === 'string' &&
    !startsWithLetter(property.key.value)
  );
}
