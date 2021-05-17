import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/i18n';
import rule, { RULE_NAME } from '../../src/rules/i18n';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});
const i18nId: MessageIds = 'i18nId';
const i18nText: MessageIds = 'i18nText';
const i18nAttribute: MessageIds = 'i18nAttribute';
const i18nIdOnAttribute: MessageIds = 'i18nIdOnAttribute';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
      <div>
        <span i18n="@@my-custom-id">Some text to translate</span>
      </div>
    `,
    `
      <div i18n-tooltip="@@my-custom-id" tooltip="This also requires translation">
        <span i18n="@@my-custom-id">Some text to translate</span>
      </div>
    `,
    `
      <div>
        <span class="red" i18n="@@my-custom-id">
          Some text to translate
        </span>
      </div>
    `,
    {
      code: `
        <div tooltip="This tooltip property is ignored">
          <span i18n>Some text to translate</span>
        </div>
      `,
      options: [{ checkId: false, ignoreAttributes: ['tooltip'] }],
    },
    {
      code: `
        <div i18n-tooltip="@@tooltip.label" tooltip="This tooltip property is ignored">
          <span>Some text to translate</span>
        </div>
      `,
      options: [{ checkText: false }],
    },
    {
      code: `
        <div i18n-tooltip="@@tooltip.label" tooltip="This tooltip property is ignored">
          <mat-icon>valid</mat-icon>
        </div>
      `,
      options: [{ ignoreTags: ['mat-icon'] }],
    },
    {
      code: `
        <div i18n-tooltip="@@tooltip.label" tooltip="This tooltip property is ignored">
          -{{data_from_backend}}
        </div>
      `,
      options: [{}],
    },
    {
      // https://github.com/angular-eslint/angular-eslint/issues/298
      code: `
        <my-component size="s">
          <span>-{{data_from_backend}}</span>
        </my-component>
      `,
      options: [{ ignoreTags: ['my-component'] }],
    },
    {
      // https://github.com/angular-eslint/angular-eslint/issues/327
      code: `<p i18n="@@customId">Lorem ipsum <i>dolor</i> sit amet.</p>`,
      options: [
        {
          checkAttributes: false,
          checkId: true,
          checkText: false,
        },
      ],
    },
    {
      // https://github.com/angular-eslint/angular-eslint/issues/466
      code: `
        <a
          mat-button
          ngClass="class"
          routerLink="exclusions"
          i18n="@@keywording.tools.exclusions"
        >
          Exclusions
        </a>
      `,
    },
    {
      // https://github.com/angular-eslint/angular-eslint/issues/466
      code: `
        <a
          mat-button
          routerLink="exclusions"
          i18n="@@keywording.tools.exclusions"
        >
          Exclusions
        </a>
      `,
      options: [
        {
          checkId: true,
          checkText: true,
          checkAttributes: false,
        },
      ],
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if i18n is missing',
      annotatedSource: `
        <div>
          <span>Some text to translate</span>
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        </div>
      `,
      messageId: i18nText,
      options: [{ ignoreAttributes: [] }],
      data: { attributeName: 'span' },
    }),
    {
      code: `
        <div
          tooltip="This also requires translation"
          i18n-placeholder
          placeholder="More translation, please"
          class="red"
        >
          <div
            *ngIf="true"
            width="100px"
            label="Templates need translation too."
          >
            <span i18n label="valid with i18n">Some text to translate</span>
          </div>
        </div>
      `,
      errors: [
        {
          messageId: i18nAttribute,
          line: 2,
          column: 9,
          data: { attributeName: 'tooltip' },
        },
        {
          messageId: i18nIdOnAttribute,
          line: 2,
          column: 9,
          data: { attributeName: 'placeholder' },
        },
        {
          messageId: i18nAttribute,
          line: 8,
          column: 11,
          data: { attributeName: 'label' },
        },
        {
          messageId: i18nAttribute,
          line: 8,
          column: 11,
          data: { attributeName: 'label' },
        },
        {
          messageId: i18nId,
          line: 13,
          column: 13,
          data: { attributeName: 'tooltip' },
        },
      ],
      output: `
        <div i18n-tooltip
          tooltip="This also requires translation"
          i18n-placeholder
          placeholder="More translation, please"
          class="red"
        >
          <div i18n-label
            *ngIf="true"
            width="100px"
            label="Templates need translation too."
          >
            <span i18n label="valid with i18n">Some text to translate</span>
          </div>
        </div>
      `,
      options: [{ ignoreAttributes: ['span[label]'] }],
    },
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail because of the custom pattern',
      annotatedSource: `
        <div>
          <span>-{{data_from_backend}}</span>
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        </div>
      `,
      messageId: i18nText,
      options: [{ boundTextAllowedPattern: '-' }],
      data: { attributeName: 'span' },
    }),
  ],
});
