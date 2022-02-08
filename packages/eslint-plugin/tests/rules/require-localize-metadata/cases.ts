import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/require-localize-metadata';

const messageId: MessageIds = 'requireLocalizeMetadata';

export const valid = [
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
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if no $localize description is provided when required for variable declarations',
    annotatedSource: `
      const localizedText = $localize\`Hello i18n!\`;
                                     ~~~~~~~~~~~~~
    `,
    messageId,
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
    messageId,
    options: [{ requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if no $localize description is provided when required for return statements',
    annotatedSource: `
      return $localize\`Hello i18n!\`;
                      ~~~~~~~~~~~~~
    `,
    messageId,
    options: [{ requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if no $localize description is provided when required for call expressions',
    annotatedSource: `
      someFunction($localize\`Hello i18n!\`);
                            ~~~~~~~~~~~~~
    `,
    messageId,
    options: [{ requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if no $localize description is provided when required for variable declarations, despite a $localize meaning being provided',
    annotatedSource: `
      const localizedText = $localize\`:site header|:Hello i18n!\`;
                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
    options: [{ requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if no $localize description is provided when required for variable declarations, despite a $localize ID being provided',
    annotatedSource: `
      const localizedText = $localize\`:@@custom_id:Hello i18n!\`;
                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
    options: [{ requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if no $localize description is provided when required for variable declarations, despite a $localize meaning and ID being provided',
    annotatedSource: `
      const localizedText = $localize\`:site header|@@custom_id:Hello i18n!\`;
                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
    options: [{ requireDescription: true }],
  }),
];
