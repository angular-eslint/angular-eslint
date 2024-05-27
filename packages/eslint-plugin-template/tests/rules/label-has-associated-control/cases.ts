import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/label-has-associated-control';

const messageId: MessageIds = 'labelHasAssociatedControl';

export const valid = [
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
      <label [htmlFor]="id"></label>
      `,
    options: [
      {
        controlComponents: ['app-input'],
        labelComponents: [{ inputs: ['id'], selector: 'app-label' }],
      },
    ],
  },
  {
    code: `
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
      {
        controlComponents: ['app-input'],
        labelComponents: [{ inputs: ['id'], selector: 'app-label' }],
      },
    ],
  },
  {
    code: `
      <input type="radio" id="id"/>
      <label for="id"></label>
      `,
    options: [{ checkIds: true }],
  },
];

export const invalid = [
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
      'should fail if a label does a "for" attribute with a non matching id and ids are checked',
    annotatedSource: `
        <label for="id">Label</label>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        <input id="otherId" />
      `,
    options: [{ checkIds: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a label component does not have a label attribute',
    annotatedSource: `
        <app-label anotherAttribute="id"></app-label>
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    options: [{ labelComponents: [{ inputs: ['id'], selector: 'app-label' }] }],
  }),
];
