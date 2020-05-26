import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, { MessageIds, RULE_NAME } from '../../src/rules/i18n';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const i18nId: MessageIds = 'i18nId';
const i18nText: MessageIds = 'i18nText';
const i18nAttrib: MessageIds = 'i18nAttrib';
const i18nIdOnAttrib: MessageIds = 'i18nIdOnAttrib';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      filename: 'test.component.html',
      code: `
        <div>
          <span i18n="@@my-custom-id">Some text to translate</span>
        </div>`,
    },
    {
      filename: 'test.component.html',
      code: `
      <div
        i18n-tooltip="@@my-custom-id"
        tooltip="This also requires translation"
      >
        <span i18n="@@my-custom-id">Some text to translate</span>
      </div>`,
    },
    {
      filename: 'test.component.html',
      code: `
        <div>
          <span
            class="red"
            i18n="@@my-custom-id"
          >
            Some text to translate
          </span>
        </div>`,
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if i18n is missing',
      annotatedSource: `
        <div>
          <span>Some text to translate</span>
          ~~~~~~
        </div>`,
      messageId: i18nText,
      annotatedOutput: `
        <div>
          <span i18n>Some text to translate</span>
          ~~~~~~~~~~~
        </div>`,
    }),
    {
      filename: 'test.component.html',
      code: `
        <div
          tooltip="This also requires translation"
          i18n-placeholder
          placeholder="More translation, please"
          class="red"
        >
          <span i18n>Some text to translate</span>
        </div>`,
      errors: [
        {
          messageId: i18nAttrib,
          line: 2,
          column: 9,
        },
        {
          messageId: i18nIdOnAttrib,
          line: 2,
          column: 9,
        },
        {
          messageId: i18nId,
          line: 8,
          column: 11,
        },
      ],
      output: `
        <div i18n-tooltip
          tooltip="This also requires translation"
          i18n-placeholder
          placeholder="More translation, please"
          class="red"
        >
          <span i18n>Some text to translate</span>
        </div>`,
    },
  ],
});
