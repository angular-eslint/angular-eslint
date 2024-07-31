import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/prefer-control-flow';

const messageId: MessageIds = 'preferControlFlow';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `@if (condition) {
     Condition is truthy
  }`,
  `@if (condition) {
    Condition is truthy
  } @else if (anotherCondition) {
    Another condition is truthy
  } @else {
    No condition is truthy
  }`,
  `@for (item of items; track item.id) {
    {{ item.name }}
  } @empty {
    There are no items.
  }`,
  `@switch (condition) {
    @case (caseA) {
      Case A.
    }
    @case (caseB) {
      Case B.
    }
    @default {
      Default case.
    }
  }`,
  `<form [ngFormOptions]="{ updateOn: 'blur' }"></form>`,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when *ngIf is used',
    annotatedSource: `
        <div *ngIf="condition"></div>
              ~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { name: 'ngIf' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when *ngIf with else block is used',
    annotatedSource: `
        <div *ngIf="condition; else elseBlock"></div>
              ~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { name: 'ngIf' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when *ngIf with then and else block is used',
    annotatedSource: `
        <div *ngIf="condition; then thenBlock else elseBlock"></div>
              ~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { name: 'ngIf' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when *ngIf value is stored locally',
    annotatedSource: `
        <div *ngIf="condition as value; else elseBlock"></div>
              ~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { name: 'ngIf' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngIf] is used',
    annotatedSource: `
        <div [ngIf]="condition"></div>
             ~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { name: 'ngIf' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when basic *ngFor is used',
    annotatedSource: `
        <li *ngFor="let item of items">
                             ~~~~~~~~
          {{ item }}
        </li>
      `,
    messageId,
    data: { name: 'ngForOf' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when *ngFor with options is used',
    annotatedSource: `
        <li *ngFor="let item of items; index as i; trackBy: trackByFn">
                             ~~~~~~~~~~
          {{ item }}
        </li>
      `,
    messageId,
    data: { name: 'ngForOf' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when *ngFor with template is used',
    annotatedSource: `
        <ng-template ngFor let-item [ngForOf]="items" let-i="index" [ngForTrackBy]="trackByFn">
                                    ~~~~~~~~~~~~~~~~~
          <li>{{ item }}</li>
        </ng-template>
      `,
    messageId,
    data: { name: 'ngForOf' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when *ngFor with template is used',
    annotatedSource: `
        <ng-template ngFor let-item [ngForOf]="items" let-i="index" [ngForTrackBy]="trackByFn">
                                    ~~~~~~~~~~~~~~~~~
          <li>{{ item }}</li>
        </ng-template>
      `,
    messageId,
    data: { name: 'ngForOf' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when [ngSwitch] is used',
    annotatedSource: `
      <container-element [ngSwitch]="switch_expression">
                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         <some-element *ngSwitchCase="match_expression_1">1</some-element>
         <some-element *ngSwitchCase="match_expression_2">2</some-element>
         <some-element *ngSwitchDefault>default</some-element>
      </container-element>
      `,
    messageId,
    data: { name: 'ngSwitch' },
  }),
];
