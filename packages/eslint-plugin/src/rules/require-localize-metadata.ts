import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [
  {
    readonly requireDescription?: boolean;
  },
];

const DEFAULT_OPTIONS: Options[number] = {
  requireDescription: false,
};

const VALID_LOCALIZED_STRING_WITH_DESCRIPTION = new RegExp(/`:[^|]*:.*`/);

// TODO: The following values are also used in eslint-plugin-template/i18n, and should likely be centralized
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
      description: `Ensures that $localize tagged messages contain a description.`,
      category: 'Best Practices',
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
    function reportRequireLocalizeMetadataError(token: TSESTree.Token) {
      context.report({
        node: token,
        messageId: 'requireLocalizeMetadata',
      });
    }

    function testTaggedMessageTokenWithDescription(token: TSESTree.Token) {
      if (!VALID_LOCALIZED_STRING_WITH_DESCRIPTION.test(token.value)) {
        reportRequireLocalizeMetadataError(token);
      }
    }

    function testTaggedMessageToken(token: TSESTree.Token) {
      if (requireDescription) {
        // Test for i18n description only
        testTaggedMessageTokenWithDescription(token);
      }
    }

    return {
      Program(programNode: TSESTree.Program) {
        const tokens = programNode.tokens;

        if (!tokens || !requireDescription) {
          return;
        } else {
          tokens.forEach((token, i) => {
            if (token.value === '$localize') {
              testTaggedMessageToken(tokens[i + 1]);
            }
          });
        }
      },
    };
  },
});
