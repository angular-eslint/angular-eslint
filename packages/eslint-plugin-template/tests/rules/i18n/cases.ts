import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/i18n';

const i18nAttribute: MessageIds = 'i18nAttribute';
const i18nAttributeOnIcuOrText: MessageIds = 'i18nAttributeOnIcuOrText';
const i18nCustomIdOnAttribute: MessageIds = 'i18nCustomIdOnAttribute';
const i18nCustomIdOnElement: MessageIds = 'i18nCustomIdOnElement';
const i18nDuplicateCustomId: MessageIds = 'i18nDuplicateCustomId';
const suggestAddI18nAttribute: MessageIds = 'suggestAddI18nAttribute';
const i18nMissingDescription: MessageIds = 'i18nMissingDescription';

export const valid = [
  `
    <div>
      <span i18n="@@custom-id">Some text to translate</span>
    </div>
  `,
  `
    <div>
      <span class="red" i18n="@@custom-id">
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
  `<div>-{{data_from_backend}}</div>`,
  `<div>1{{data_from_backend}}</div>`,
  `<div>-1{{data_from_backend}}</div>`,
  {
    code: `
      <div>
        My company untranslatable name{{data_from_backend}}
      </div>
    `,
    options: [{ boundTextAllowedPattern: 'My company untranslatable name' }],
  },
  {
    // https://github.com/angular-eslint/angular-eslint/issues/298
    code: `<my-component size="s"></my-component>`,
    options: [{ ignoreTags: ['my-component'] }],
  },
  {
    // https://github.com/angular-eslint/angular-eslint/issues/327
    code: `<p i18n="@@customId">Lorem ipsum <em>dolor</em> sit amet.</p>`,
    options: [{ checkAttributes: false, checkId: true, checkText: false }],
  },
  // https://github.com/angular-eslint/angular-eslint/issues/466
  `
    <a
      mat-button
      ngClass="class"
      routerLink="exclusions"
      i18n="@@keywording.tools.exclusions"
    >
      Exclusions
    </a>
  `,
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
    options: [{ checkId: true, checkText: true }],
  },
  // https://github.com/angular-eslint/angular-eslint/issues/682
  `
    <ng-template #errorMessage>
      {{ error.title }}
    </ng-template>
  `,
  `
    <ng-container i18n="@@description">
      { value, plural, =0 {<div>No elements</div>} =1 {111} }
    </ng-container>
  `,
  {
    code: `
      <span i18n>
        The author is {gender, select, male {male} female {female} other {other}}
      </span>
    `,
    options: [{ checkId: false }],
  },
  `
    <mat-option *ngFor="let mode of modes" [value]="mode.id" i18n="@@option">
      {mode.name, select, mode {mode} other { {{mode.name}} } }
    </mat-option>
  `,
  `<ng-container ngProjectAs="top">&ngsp;</ng-container>`,
  {
    code: `
      <p [ngPlural]="components">
        <ng-template ngPluralCase="1">1 component removed</ng-template>
        <ng-template ngPluralCase="1">{{components}} components removed</ng-template>
      </p>
    `,
    options: [{ checkText: false }],
  },
  {
    code: `
      <div tooltip="This requires translation"></div>
      <div>
        <span i18n label="valid with i18n">Some text to translate</span>
      </div>
      <div tooltip="This requires translation" i18n-tooltip></div>
      <div>
        <ng-container>Some text&nbsp;t@ tr1nslate</ng-container>
      </div>
      <div>
        <span>-{{data_from_backend}}</span>
      </div>
    `,
    options: [{ checkAttributes: false, checkId: false, checkText: false }],
  },
  `
    <div label="1">
      <div matBadge="&#8288;">5</div>
    </div>
  `,
  `
    <div ariaselected="0"></div>
    <div>+</div>
    <span>&nbsp;</span>
    <span>123</span>
    <ng-content select=".content-area"></ng-content>
    <ul i18n="@@list">
      <li>ItemA</li>
      <li>ItemB</li>
      <li>ItemC</li>
    </ul>
  `,
  {
    code: `
      <h1 i18n="An introduction header for this sample">Hello i18n!</h1>
    `,
    options: [{ checkId: false, requireDescription: true }],
  },
  {
    code: `
      <h1 i18n="An introduction header for this sample@@custom-id">Hello i18n!</h1>
    `,
    options: [{ requireDescription: true }],
  },
  {
    code: `
      <h1 i18n="An introduction header for this sample" i18n-title="Title of the sample" title="Translated title">
        Hello i18n!
      </h1>
    `,
    options: [{ checkId: false, requireDescription: true }],
  },
  {
    code: `
      <h1 i18n="An introduction header for this sample@@custom-id" i18n-title="Title of the sample@@title-id" title="Translated title">
        Hello i18n!
      </h1>
    `,
    options: [{ requireDescription: true }],
  },
  {
    code: `
      <img 
        [src]="logo"
        i18n-title="Logo for the app"
        title="App Logo"
        i18n-alt="Translated alt logo"
        alt="Alternate logo"
      /> 
    `,
    options: [{ checkId: false, requireDescription: true }],
  },
  {
    code: `
      <span i18n="@@custom-id">Some text to translate</span>
      <span i18n="@@custom-id">Some text to translate</span>
    `,
    options: [{ checkDuplicateId: false }],
  },
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `i18n-*` attribute is missing',
    annotatedSource: `
      <div tooltip="This requires translation"></div>
           ~~~~~~~
    `,
    messageId: i18nAttribute,
    data: { attributeName: 'tooltip' },
    annotatedOutput: `
      <div tooltip="This requires translation" i18n-tooltip></div>
           ~~~~~~~
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `i18n` attribute is missing on element containing bound text',
    annotatedSource: `
      <div>
        <span>test{{data_from_backend}}</span>
              ~~~~~~~~~~~~~~~~~~~~~~~~~
      </div>
    `,
    messageId: i18nAttributeOnIcuOrText,
    options: [{ ignoreTags: [] }],
    annotatedOutput: `
      <div>
        <span i18n>test{{data_from_backend}}</span>
              
      </div>
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `i18n` attribute is missing on element containing ICU',
    annotatedSource: `
      { value, plural, =0 {<div>No elements</div>} =1 {111} }
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: i18nAttributeOnIcuOrText,
    options: [{ checkAttributes: false }],
    annotatedOutput: `
      <ng-container i18n>{ value, plural, =0 {<div>No elements</div>} =1 {111} }</ng-container>
      
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `i18n` attribute is missing on element containing text',
    annotatedSource: `
      <div>
        <ng-container>Some text&nbsp;t@ tr1nslate</ng-container>
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      </div>
    `,
    messageId: i18nAttributeOnIcuOrText,
    options: [{ checkId: false }],
    annotatedOutput: `
      <div>
        <ng-container i18n>Some text&nbsp;t@ tr1nslate</ng-container>
                      
      </div>
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `i18n-*` attribute is missing with nested elements',
    annotatedSource: `
      <p>Lorem ipsum <em i18n="@@dolor">dolor</em> sit amet.</p>
         ~~~~~~~~~~~~                              ^^^^^^^^^
    `,
    messages: [
      {
        char: '~',
        messageId: i18nAttributeOnIcuOrText,
        suggestions: [
          {
            messageId: suggestAddI18nAttribute,
            output: `
      <p i18n>Lorem ipsum <em i18n="@@dolor">dolor</em> sit amet.</p>
                                                   
    `,
          },
        ],
      },
      {
        char: '^',
        messageId: i18nAttributeOnIcuOrText,
        suggestions: [
          {
            messageId: suggestAddI18nAttribute,
            output: `
      <p i18n>Lorem ipsum <em i18n="@@dolor">dolor</em> sit amet.</p>
                                                   
    `,
          },
        ],
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `i18n-{{attribute}}` attribute is missing a custom ID',
    annotatedSource: `
      <div tooltip="This requires translation" i18n-tooltip></div>
           ~~~~~~~
    `,
    messageId: i18nCustomIdOnAttribute,
    data: { attributeName: 'tooltip' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `i18n` attribute is missing a custom ID',
    annotatedSource: `
      <div>
        <span i18n label="label is ignored in 'ignoreAttributes'">
        ~
          Missing custom ID
        </span>
              ~
      </div>
    `,
    messageId: i18nCustomIdOnElement,
    options: [{ ignoreAttributes: ['span[label]'] }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if i18n custom ID is duplicate in attributes',
    annotatedSource: `
      <div
        i18n-tooltip="@@custom-id"
        tooltip="This requires translation"
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        label="Custom label"
        ^^^^^^^^^^^^^^^^^^^^
        i18n-label="@@custom-id"
      ></div>
    `,
    messages: [
      {
        char: '~',
        messageId: i18nDuplicateCustomId,
        data: { customId: 'custom-id' },
      },
      {
        char: '^',
        messageId: i18nDuplicateCustomId,
        data: { customId: 'custom-id' },
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if i18n custom ID is duplicate in elements',
    annotatedSource: `
      <h3 i18n="@@myId">Hello</h3>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      <p i18n="@@myId">Good bye</p>
      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    `,
    messages: [
      {
        char: '~',
        messageId: i18nDuplicateCustomId,
        data: { customId: 'myId' },
      },
      {
        char: '^',
        messageId: i18nDuplicateCustomId,
        data: { customId: 'myId' },
      },
    ],
    options: [{ ignoreTags: [] }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if i18n custom ID is duplicate in attribute and element',
    annotatedSource: `
      <div i18n-tooltip="@@custom-id" tooltip="This requires translation">
                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        <span i18n="@@custom-id">Some text to translate</span>
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      </div>
    `,
    messages: [
      {
        char: '~',
        messageId: i18nDuplicateCustomId,
        data: { customId: 'custom-id' },
      },
      {
        char: '^',
        messageId: i18nDuplicateCustomId,
        data: { customId: 'custom-id' },
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if i18n custom ID appears multiple times in attributes and elements',
    annotatedSource: `
      <div i18n-tooltip="@@custom-id" tooltip="This requires translation">
                                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        <span i18n="@@custom-id">Some text to translate</span>
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      </div>
      <div i18n-label="@@custom-id" label="A label"></div>
                                    ###############
    `,
    messages: [
      {
        char: '~',
        messageId: i18nDuplicateCustomId,
        data: { customId: 'custom-id' },
      },
      {
        char: '^',
        messageId: i18nDuplicateCustomId,
        data: { customId: 'custom-id' },
      },
      {
        char: '#',
        messageId: i18nDuplicateCustomId,
        data: { customId: 'custom-id' },
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail for multiple cases',
    annotatedSource: `
      <div
        tooltip="This requires translation"
        ~~~~~~~
        i18n-placeholder
        placeholder="More translation, please"
        ^^^^^^^^^^^
        class="red"
      >
        <div
          *ngIf="true"
          width="100px"
          label="Templates need translation too."
          #####
        >
          <span i18n label="label is ignored in 'ignoreAttributes'">
          %
            Missing custom ID
          </span>
                %
        </div>
      </div>
    `,
    options: [{ ignoreAttributes: ['span[label]'] }],
    messages: [
      {
        char: '~',
        messageId: i18nAttribute,
        data: { attributeName: 'tooltip' },
      },
      {
        char: '^',
        messageId: i18nCustomIdOnAttribute,
        data: { attributeName: 'placeholder' },
      },
      {
        char: '#',
        messageId: i18nAttribute,
        data: { attributeName: 'label' },
      },
      { char: '%', messageId: i18nCustomIdOnElement },
    ],
    annotatedOutput: `
      <div
        tooltip="This requires translation" i18n-tooltip
               
        i18n-placeholder
        placeholder="More translation, please"
                   
        class="red"
      >
        <div
          *ngIf="true"
          width="100px"
          label="Templates need translation too." i18n-label
               
        >
          <span i18n label="label is ignored in 'ignoreAttributes'">
          
            Missing custom ID
          </span>
                
        </div>
      </div>
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if i18n description is missing',
    annotatedSource: `
      <h1 i18n>Hello</h1>
      ~~~~~~~~~~~~~~~~~~~
    `,
    messageId: i18nMissingDescription,
    options: [{ checkId: false, requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if i18n description is missing, despite an ID being provided',
    annotatedSource: `
      <h1 i18n="@@custom-id">Hello</h1>
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: i18nMissingDescription,
    options: [{ requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if i18n-<attr> description is missing',
    annotatedSource: `
      <span i18n="A balloon that displays data" data-balloon="Translated title" i18n-data-balloon>
                                                ~~~~~~~~~~~~  
        Hello
      </span>
    `,
    messageId: i18nMissingDescription,
    options: [{ checkId: false, requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if i18n-<attr> description is missing, despite an ID being provided',
    annotatedSource: `
      <h1 i18n="Title of the sample@@custom-id" i18n-title="@@title-id" title="Translated title">
                                                                        ~~~~~
        Hello
      </h1>
    `,
    messageId: i18nMissingDescription,
    options: [{ requireDescription: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if i18n-<attr> description is missing when there is no text content to translate',
    annotatedSource: `
      <img [src]="logo" i18n-title title="App Logo" i18n-alt="App logo" alt="App Logo"/>
                                   ~~~~~
    `,
    messageId: i18nMissingDescription,
    options: [{ requireDescription: true, checkId: false }],
  }),
];
