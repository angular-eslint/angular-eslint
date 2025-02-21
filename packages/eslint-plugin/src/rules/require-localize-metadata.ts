import { ASTUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [
  {
    readonly requireDescription?: boolean;
    readonly requireMeaning?: boolean;
    readonly requireCustomId?: boolean;
    readonly requireDefaultValue?: boolean;
    readonly boundTextAllowedPattern?: string;
  },
];

const DEFAULT_OPTIONS: Options[number] = {
  requireDescription: false,
  requireMeaning: false,
  requireCustomId: false,
  requireDefaultValue: false,
};

export interface I18NMetadata {
  meaning: boolean;
  description: boolean;
  customKey: boolean;
  defaultValue: boolean;
}

const validate = (
  input: string,
  typeToValidate: string,
  boundTextAllowedPattern?: string,
): boolean => {
  const regex =
    /^(?::(?:(?<meaning>[^|]+)\|)?(?<description>[^@:]*)?(?:@@(?<customId>[^:]*))?(?::(?<defaultValue>.*))?)$/;

  const match = regex.exec(input.trim());

  let result = false;
  if (/^(:[^:].[^|:@]*)$/.test(input) === false) {
    if (
      typeToValidate === 'defaultValue' &&
      !input.includes(':') &&
      !input.includes('|') &&
      !input.includes('@@')
    ) {
      // Input is plain text without special markers
      result = true;
    } else if (match && match.groups) {
      if (typeToValidate === 'customId' && boundTextAllowedPattern) {
        const boundTextAllowedRegex = new RegExp(boundTextAllowedPattern);
        return boundTextAllowedRegex.test(match.groups[typeToValidate]);
      } else {
        result = !!match.groups[typeToValidate];
      }
    }
  }
  return result;
};

const STYLE_GUIDE_LINK = 'https://angular.dev/guide/i18n/prepare';
const STYLE_GUIDE_LINK_COMMON_PREPARE = `${STYLE_GUIDE_LINK}-common-prepare`;
const STYLE_GUIDE_LINK_METADATA_FOR_TRANSLATION = `${STYLE_GUIDE_LINK_COMMON_PREPARE}#i18n-metadata-for-translation`;

export type MessageIds =
  | 'requireLocalizeDescription'
  | 'requireLocalizeMeaning'
  | 'requireLocalizeCustomId'
  | 'requireLocalizeDefaultValue'
  | 'requireLocalizeAllowedCustomIdPattern';
export const RULE_NAME = 'require-localize-metadata';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that $localize tagged messages contain helpful metadata to aid with translations.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          requireDescription: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.requireDescription,
          },
          requireMeaning: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.requireMeaning,
          },
          requireCustomId: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.requireCustomId,
          },
          requireDefaultValue: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.requireDefaultValue,
          },
          requireCustomIdMatchingPattern: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      requireLocalizeDescription: `$localize tagged messages should contain a description. See more at ${STYLE_GUIDE_LINK_METADATA_FOR_TRANSLATION}`,
      requireLocalizeMeaning: `$localize tagged messages should contain a meaning. See more at ${STYLE_GUIDE_LINK_METADATA_FOR_TRANSLATION}`,
      requireLocalizeCustomId: `$localize tagged messages should contain a custom id. See more at ${STYLE_GUIDE_LINK_METADATA_FOR_TRANSLATION}`,
      requireLocalizeDefaultValue: `$localize tagged messages should contain a default value. See more at ${STYLE_GUIDE_LINK_METADATA_FOR_TRANSLATION}`,
      requireLocalizeAllowedCustomIdPattern: `$localize tagged messages should contain a custom id following this pattern - "{{allowedPattern}}". See more at ${STYLE_GUIDE_LINK_METADATA_FOR_TRANSLATION}`,
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(
    context,
    [
      {
        requireDescription,
        requireMeaning,
        requireCustomId,
        requireDefaultValue,
        boundTextAllowedPattern,
      },
    ],
  ) {
    return {
      TaggedTemplateExpression(
        taggedTemplateExpression: TSESTree.TaggedTemplateExpression,
      ) {
        if (
          (requireDescription ||
            requireMeaning ||
            requireCustomId ||
            requireDefaultValue) &&
          ASTUtils.isIdentifier(taggedTemplateExpression.tag)
        ) {
          const identifierName = taggedTemplateExpression.tag.name;
          const templateElement = taggedTemplateExpression.quasi.quasis[0];

          if (identifierName === '$localize' && !!templateElement) {
            const templateElementRawValue = templateElement.value.raw;

            if (
              requireMeaning &&
              !validate(templateElementRawValue, 'meaning')
            ) {
              context.report({
                loc: templateElement.loc,
                messageId: 'requireLocalizeMeaning',
              });
            }

            if (
              requireDescription &&
              !validate(templateElementRawValue, 'description')
            ) {
              context.report({
                loc: templateElement.loc,
                messageId: 'requireLocalizeDescription',
              });
            }

            if (
              requireCustomId &&
              !validate(templateElementRawValue, 'customId')
            ) {
              context.report({
                loc: templateElement.loc,
                messageId: 'requireLocalizeCustomId',
              });
            }

            if (
              requireCustomId &&
              boundTextAllowedPattern &&
              !validate(
                templateElementRawValue,
                'customId',
                boundTextAllowedPattern,
              )
            ) {
              context.report({
                loc: templateElement.loc,
                messageId: 'requireLocalizeAllowedCustomIdPattern',
                data: {
                  allowedPattern: boundTextAllowedPattern,
                },
              });
            }

            if (
              requireDefaultValue &&
              !validate(templateElementRawValue, 'defaultValue')
            ) {
              context.report({
                loc: templateElement.loc,
                messageId: 'requireLocalizeDefaultValue',
              });
            }
          }
        }
      },
    };
  },
});
