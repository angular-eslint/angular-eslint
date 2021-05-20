import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-duplicate-attributes';
import rule, { RULE_NAME } from '../../src/rules/no-duplicate-attributes';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});
const messageId: MessageIds = 'noDuplicateAttributes';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    '<input name="foo">',
    '<input [name]="foo">',
    '<input (change)="bar()">',
    '<input [(ngModel)]="foo">',
    '<input [(ngModel)]="model" (ngModelChange)="modelChanged()">',
    '<div (@fade.start)="animationStarted($event)" (@fade.done)="animationDone($event)"></div>',
    '<div (window:keydown)="windowKeydown($event)" (document:keydown)="documentKeydown($event)" (document:keyup)="documentKeyup($event)" (keyup)="keyup($event)" (keydown)="keydown($event)"></div>',
    '<div [style.width.px]="col.width" [width]="col.width"></div>',
    '<button [class.disabled]="!enabled" [disabled]="!enabled"></button>',
    '<button [@.disabled]="!enabled" [.disabled]="!enabled"></button>',
    '<div [style.width]="col.width + \'px\'" [width]="col.width"></div>',
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail with 2 inputs with the same name',
      annotatedSource: `
        <input [name]="foo" [name]="bar">
               ~~~~~~~~~~~~ ^^^^^^^^^^^^
      `,
      messages: [
        { char: '~', messageId, data: { attributeName: 'name' } },
        { char: '^', messageId, data: { attributeName: 'name' } },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail with an input and a text attribute with the same name',
      annotatedSource: `
        <input [name]="foo" name="bar">
               ~~~~~~~~~~~~ ^^^^^^^^^^
      `,
      messages: [
        { char: '~', messageId, data: { attributeName: 'name' } },
        { char: '^', messageId, data: { attributeName: 'name' } },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail with 2 text attributes with the same name',
      annotatedSource: `
        <input name="foo" name="bar">
               ~~~~~~~~~~ ^^^^^^^^^^
      `,
      messages: [
        { char: '~', messageId, data: { attributeName: 'name' } },
        { char: '^', messageId, data: { attributeName: 'name' } },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail with 2 outputs with the same name',
      annotatedSource: `
        <input (change)="foo($event)" (change)="bar($event)">
               ~~~~~~~~~~~~~~~~~~~~~~ ^^^^^^^^^^^^^^^^^^^^^^
      `,
      messages: [
        { char: '~', messageId, data: { attributeName: 'change' } },
        { char: '^', messageId, data: { attributeName: 'change' } },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail with 2 banana in a box with the same name',
      annotatedSource: `
        <input [(ngModel)]="model" [(ngModel)]="otherModel">
               ~~~~~~~~~~~~~~~~~~~ ^^^^^^^^^^^^^^^^^^^^^^^^
      `,
      messages: [
        { char: '~', messageId, data: { attributeName: 'ngModel' } },
        { char: '^', messageId, data: { attributeName: 'ngModel' } },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail with duplicate attributes but allow non duplicates',
      annotatedSource: `
        <input [name]="foo" [other]="bam" [name]="bar">
               ~~~~~~~~~~~~               ^^^^^^^^^^^^
      `,
      messages: [
        { char: '~', messageId, data: { attributeName: 'name' } },
        { char: '^', messageId, data: { attributeName: 'name' } },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail with 3 duplications',
      annotatedSource: `
        <input [name]="foo" [name]="bar" [name]="bam">
               ~~~~~~~~~~~~ ^^^^^^^^^^^^ ############
      `,
      messages: [
        { char: '~', messageId, data: { attributeName: 'name' } },
        { char: '^', messageId, data: { attributeName: 'name' } },
        { char: '#', messageId, data: { attributeName: 'name' } },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail multiple combinations of duplicates',
      annotatedSource: `
        <input [(ngModel)]="model" [name]="foo" [(ngModel)]="otherModel" name="bar">
               ~~~~~~~~~~~~~~~~~~~ ^^^^^^^^^^^^ ######################## %%%%%%%%%%
      `,
      messages: [
        { char: '~', messageId, data: { attributeName: 'ngModel' } },
        { char: '^', messageId, data: { attributeName: 'name' } },
        { char: '#', messageId, data: { attributeName: 'ngModel' } },
        { char: '%', messageId, data: { attributeName: 'name' } },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail with multiple animation outputs',
      annotatedSource: `
        <input (@fade.start)="animationStarted($event)" (@fade.start)="animationStarted($event)">
               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      `,
      messages: [
        { char: '~', messageId, data: { attributeName: '@fade.start' } },
        { char: '^', messageId, data: { attributeName: '@fade.start' } },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail with multiple outputs on the window',
      annotatedSource: `
        <input (window:resize)="windowResized($event)" (resize)="resize()" (window:resize)="windowResized2($event)">
               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      `,
      messages: [
        { char: '~', messageId, data: { attributeName: 'window:resize' } },
        { char: '^', messageId, data: { attributeName: 'window:resize' } },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'not allow two way binding and output with the change event',
      annotatedSource: `
        <input [(ngModel)]="model" (ngModelChange)="modelChanged()">
               ~~~~~~~~~~~~~~~~~~~ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      `,
      options: [{ allowTwoWayDataBinding: false }],
      messages: [
        { char: '~', messageId, data: { attributeName: 'ngModelChange' } },
        { char: '^', messageId, data: { attributeName: 'ngModelChange' } },
      ],
    }),
  ],
});
