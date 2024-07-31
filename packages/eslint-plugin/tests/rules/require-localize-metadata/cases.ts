import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/require-localize-metadata';

const messageIdRequireLocalizeDescription: MessageIds =
  'requireLocalizeDescription';
const messageIdRequireLocalizeMeaning: MessageIds = 'requireLocalizeMeaning';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `const localizedText = $localize\`Hello i18n!\`;`,
  `const localizedText = $localize\`:site header|:Hello i18n!\`;`,
  `const localizedText = $localize\`:@@custom_id:Hello i18n!\`;`,
  `const localizedText = $localize\`:site header|@@custom_id:Hello i18n!\`;`,
  {
    code: `
      let localizedText = $localize\`:An introduction header for this sample:Hello i18n!\`;
      localizedText = $localize\`:An introduction header for this sample modified:Hello i18n modified!\`;
    `,
    options: [{ requireDescription: true }],
  },
  {
    code: `
      const localizedTexts = {
        helloI18n: $localize\`:An introduction header for this sample:Hello i18n!\`
      };
      localizedTexts.helloI18n = $localize\`:An introduction header for this sample modified:Hello i18n modified!\`;
    `,
    options: [{ requireDescription: true }],
  },
  {
    code: `
      return $localize\`:An introduction header for this sample:Hello i18n!\`;
    `,
    options: [{ requireDescription: true }],
  },
  {
    code: `
      someFunction($localize\`:An introduction header for this sample:Hello i18n!\`);
    `,
    options: [{ requireDescription: true }],
  },
  {
    code: `const localizedText = \`Hello i18n!\`;`,
    options: [{ requireDescription: true }],
  },
  {
    code: `const localizedText = $localize\`:site header|:Hello i18n!\`;`,
    options: [{ requireMeaning: true }],
  },
  {
    code: `const localizedText = $localize\`:site header|An introduction header for this sample:Hello i18n!\`;`,
    options: [{ requireDescription: true, requireMeaning: true }],
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if no $localize description is provided when required for variable declarations',
    annotatedSource: `
      const localizedText = $localize\`Hello i18n!\`;
                                     ~~~~~~~~~~~~~
    `,
    messageId: messageIdRequireLocalizeDescription,
    options: [{ requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if no $localize description is provided when required for expressions statements',
    annotatedSource: `
      const localizedTexts = {
        helloI18n: $localize\`:An introduction header for this sample:Hello i18n!\`
      };
      localizedTexts.helloI18n = $localize\`Hello i18n!\`;
                                          ~~~~~~~~~~~~~
    `,
    messageId: messageIdRequireLocalizeDescription,
    options: [{ requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if no $localize description is provided when required for return statements',
    annotatedSource: `
      return $localize\`Hello i18n!\`;
                      ~~~~~~~~~~~~~
    `,
    messageId: messageIdRequireLocalizeDescription,
    options: [{ requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if no $localize description is provided when required for call expressions',
    annotatedSource: `
      someFunction($localize\`Hello i18n!\`);
                            ~~~~~~~~~~~~~
    `,
    messageId: messageIdRequireLocalizeDescription,
    options: [{ requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if no $localize description is provided when required for variable declarations, despite a meaning being provided',
    annotatedSource: `
      const localizedText = $localize\`:site header|:Hello i18n!\`;
                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: messageIdRequireLocalizeDescription,
    options: [{ requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if no $localize description is provided when required for variable declarations, despite a ID being provided',
    annotatedSource: `
      const localizedText = $localize\`:@@custom_id:Hello i18n!\`;
                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: messageIdRequireLocalizeDescription,
    options: [{ requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if no $localize description is provided when required for variable declarations, despite a meaning and ID being provided',
    annotatedSource: `
      const localizedText = $localize\`:site header|@@custom_id:Hello i18n!\`;
                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: messageIdRequireLocalizeDescription,
    options: [{ requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail if no $localize meaning is provided',
    annotatedSource: `
      const localizedText = $localize\`Hello i18n!\`;
                                     ~~~~~~~~~~~~~
    `,
    messageId: messageIdRequireLocalizeMeaning,
    options: [{ requireMeaning: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if no $localize meaning is provided despite a description being provided',
    annotatedSource: `
      const localizedText = $localize\`:An introduction header for this sample:Hello i18n!\`;
                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: messageIdRequireLocalizeMeaning,
    options: [{ requireDescription: true, requireMeaning: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail if the $localize meaning is empty',
    annotatedSource: `
      const localizedText = $localize\`:|An introduction header for this sample:Hello i18n!\`;
                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: messageIdRequireLocalizeMeaning,
    options: [{ requireMeaning: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail if no $localize metadata is provided',
    annotatedSource: `
      const localizedText = $localize\`:Hello i18n!\`;
                                     ~~~~~~~~~~~~~~
    `,
    messages: [
      {
        char: '~',
        messageId: messageIdRequireLocalizeDescription,
      },
      {
        char: '~',
        messageId: messageIdRequireLocalizeMeaning,
      },
    ],
    options: [{ requireDescription: true, requireMeaning: true }],
  }),
];
