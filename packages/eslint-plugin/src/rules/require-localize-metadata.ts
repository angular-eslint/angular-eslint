import { ASTUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [
  {
    readonly requireDescription?: boolean;
  },
];

const DEFAULT_OPTIONS: Options[number] = {
  requireDescription: false,
};

const VALID_LOCALIZED_STRING_WITH_DESCRIPTION = new RegExp(
  /:(.*\|)?([\w\s]+){1}(@@.*)?:.+/,
);

const STYLE_GUIDE_LINK = 'https://angular.io/guide/i18n';
const STYLE_GUIDE_LINK_COMMON_PREPARE = `${STYLE_GUIDE_LINK}-common-prepare`;
const STYLE_GUIDE_LINK_METADATA_FOR_TRANSLATION = `${STYLE_GUIDE_LINK_COMMON_PREPARE}#i18n-metadata-for-translation`;

export type MessageIds = 'requireLocalizeMetadata';
export const RULE_NAME = 'require-localize-metadata';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that $localize tagged messages contain helpful metadata to aid with translations.',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          requireDescription: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.requireDescription,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      requireLocalizeMetadata: `$localize tagged messages should contain a description. See more at ${STYLE_GUIDE_LINK_METADATA_FOR_TRANSLATION}`,
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, [{ requireDescription }]) {
    function reportRequireLocalizeMetadataError(
      templateElement: TSESTree.TemplateElement,
    ) {
      context.report({
        loc: templateElement.loc,
        messageId: 'requireLocalizeMetadata',
      });
    }

    function testLocalizeTemplateElementWithDescription(
      templateElement: TSESTree.TemplateElement,
    ) {
      if (
        !VALID_LOCALIZED_STRING_WITH_DESCRIPTION.test(templateElement.value.raw)
      ) {
        reportRequireLocalizeMetadataError(templateElement);
      }
    }

    return {
      TaggedTemplateExpression(
        taggedTemplateExpression: TSESTree.TaggedTemplateExpression,
      ) {
        if (
          requireDescription &&
          ASTUtils.isIdentifier(taggedTemplateExpression.tag)
        ) {
          const identifierName = taggedTemplateExpression.tag.name;
          const templateElement = taggedTemplateExpression.quasi.quasis[0];

          if (identifierName === '$localize' && !!templateElement) {
            // Test for i18n description only
            testLocalizeTemplateElementWithDescription(templateElement);
          }
        }
      },
    };
  },
});
