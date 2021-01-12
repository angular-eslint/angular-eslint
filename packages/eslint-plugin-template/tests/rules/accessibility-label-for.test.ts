import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/accessibility-label-for';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'accessibilityLabelFor';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    <ng-container *ngFor="let item of items; index as index">
      <label for="item-{{index}}">Label #{{index}</label>
      <input id="item-{{index}}" [(ngModel)]="item.name">
    </ng-container>
    <label for="id"></label>
    <label for="{{id}}"></label>
    <label [attr.for]="id"></label>
    <label [htmlFor]="id"></label>
    `,
    {
      code: `
      <app-label id="name"></app-label>
      <app-label id="{{name}}"></app-label>
      <app-label [id]="name"></app-label>
      `,
      options: [{ labelAttributes: ['id'], labelComponents: ['app-label'] }],
    },
    {
      code: ` 
      <label><button>Button</button></label>
      <label><input type="radio"></label>
      <label><meter></meter></label>
      <label><output></output></label>
      <label><progress></progress></label>
      <label><select><option>1</option></select></label>
      <label><textarea></textarea></label>
      <a-label><input></a-label>
      <label>
        Label
        <input>
      </label>
      <label>
        Label
        <span><input></span>
      </label>
      <app-label>
        <span>
          <app-input></app-input>
        </span>
      </app-label>
      `,
      options: [
        { controlComponents: ['app-input'], labelComponents: ['app-label'] },
      ],
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail if a label does not have a "for" attribute',
      annotatedSource: `
        <label>Label</label>
        ~~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description:
        'should fail if a label component does not have a label attribute',
      annotatedSource: `
        <app-label anotherAttribute="id"></app-label>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
      options: [{ labelAttributes: ['id'], labelComponents: ['app-label'] }],
    }),
  ],
});
