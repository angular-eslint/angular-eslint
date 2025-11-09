import { ASTUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [
  {
    readonly requireDescription?: boolean;
    readonly requireMeaning?: boolean;
    readonly requireCustomId?: boolean | string;
  },
];

const DEFAULT_OPTIONS: Options[number] = {
  requireDescription: false,
  requireMeaning: false,
  requireCustomId: false,
};

const STYLE_GUIDE_LINK = 'https://angular.dev/guide/i18n';
const STYLE_GUIDE_LINK_PREPARE = `${STYLE_GUIDE_LINK}/prepare`;
const STYLE_GUIDE_LINK_METADATA_FOR_TRANSLATION = `${STYLE_GUIDE_LINK_PREPARE}#i18n-metadata-for-translation`;

export type MessageIds =
  | 'requireLocalizeDescription'
  | 'requireLocalizeMeaning'
  | 'requireLocalizeCustomId';
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
            oneOf: [{ type: 'boolean' }, { type: 'string' }],
            default: DEFAULT_OPTIONS.requireCustomId,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      requireLocalizeDescription: `$localize tagged messages should contain a description. See more at ${STYLE_GUIDE_LINK_METADATA_FOR_TRANSLATION}`,
      requireLocalizeMeaning: `$localize tagged messages should contain a meaning. See more at ${STYLE_GUIDE_LINK_METADATA_FOR_TRANSLATION}`,
      requireLocalizeCustomId: `$localize tagged messages should contain a custom id{{patternMessage}}. See more at ${STYLE_GUIDE_LINK_METADATA_FOR_TRANSLATION}`,
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, [{ requireDescription, requireMeaning, requireCustomId }]) {
    return {
      TaggedTemplateExpression(
        taggedTemplateExpression: TSESTree.TaggedTemplateExpression,
      ) {
        if (
          (requireDescription || requireMeaning || requireCustomId) &&
          ASTUtils.isIdentifier(taggedTemplateExpression.tag)
        ) {
          const identifierName = taggedTemplateExpression.tag.name;
          const templateElement = taggedTemplateExpression.quasi.quasis[0];

          if (identifierName === '$localize' && !!templateElement) {
            const metadata = parseMetadata(templateElement.value.raw.trim());

            if (requireDescription && !metadata.description) {
              context.report({
                loc: templateElement.loc,
                messageId: 'requireLocalizeDescription',
              });
            }

            if (requireMeaning && !metadata.meaning) {
              context.report({
                loc: templateElement.loc,
                messageId: 'requireLocalizeMeaning',
              });
            }

            if (
              requireCustomId &&
              !(
                metadata.customId &&
                (typeof requireCustomId === 'string'
                  ? RegExp(requireCustomId).test(metadata.customId)
                  : true)
              )
            ) {
              context.report({
                loc: templateElement.loc,
                messageId: 'requireLocalizeCustomId',
                data: {
                  patternMessage:
                    typeof requireCustomId === 'string'
                      ? ` matching the pattern /${requireCustomId}/ on '${metadata.customId}'`
                      : '',
                },
              });
            }
          }
        }
      },
    };
  },
});

// see https://github.com/angular/angular/blob/main/packages/localize/src/utils/src/messages.ts#L247
const BLOCK_MARKER = ':';
const MEANING_SEPARATOR = '|';
const ID_SEPARATOR = '@@';
function parseMetadata(rawText: string): {
  rawText: string;
  meaning: string | undefined;
  description: string | undefined;
  customId: string | undefined;
} {
  const output = {
    rawText,
    meaning: undefined,
    description: undefined,
    customId: undefined,
  };
  if (rawText.charAt(0) !== BLOCK_MARKER) {
    return output;
  }
  const endOfTheBlock = rawText.lastIndexOf(BLOCK_MARKER);
  if (endOfTheBlock === -1) {
    return output;
  }
  const text = rawText.slice(1, endOfTheBlock);
  const [meaningAndDesc, customId] = text.split(ID_SEPARATOR, 2);
  let [meaning, description]: (string | undefined)[] = meaningAndDesc.split(
    MEANING_SEPARATOR,
    2,
  );
  if (description === undefined) {
    description = meaning;
    meaning = undefined;
  }
  if (description === '') {
    description = undefined;
  }
  return { rawText, meaning, description, customId };
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    'When internationalizing Angular applications with @angular/localize, adding metadata (description, meaning, and custom IDs) to $localize tagged strings is essential for high-quality translations. The description helps translators understand the context and purpose of the text they\'re translating. For example, "Submit" could mean "submit a form" or "submit to authority" - context matters for accurate translation. The meaning field distinguishes identical text that needs different translations in different contexts. Custom IDs provide stable references that persist across code changes, preventing retranslation when only code structure changes. Without this metadata, translators work blind, leading to poor translations, wasted effort on retranslating unchanged strings, and difficulty managing large translation projects. This rule ensures your $localize strings include helpful metadata for translation workflows.',
};
