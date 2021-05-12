import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/use-track-by-function';
import rule, { RULE_NAME } from '../../src/rules/use-track-by-function';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'useTrackByFunction';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
      <div *ngFor="let item of [1, 2, 3]; trackBy: trackByFn">
        {{ item }}
      </div>
    `,
    `
      <div *ngFor="let item of [1, 2, 3]; let i = index; trackBy: trackByFn">
        {{ item }}
      </div>
    `,
    `
      <div *ngFor="let item of [1, 2, 3]; trackBy : trackByFn">
        {{ item }}
      </div>
    `,
    `
      <div *ngFor='let item of [1, 2, 3]; let i = index; trackBy: trackByFn'>
        {{ item }}
      </div>
    `,
    `
      <div *ngFor  =  "let item of [1, 2, 3]; let i = index; trackBy : trackByFn">
        {{ item }}
      </div>
    `,
    `
      <ng-template ngFor let-item [ngForOf]="[1, 2, 3]" let-i="index"
        [ngForTrackBy]="trackByFn">
        {{ item }}
      </ng-template>
    `,
    `
      <div *ngFor="let item of ['a', 'b', 'c']; index as i; trackBy: trackByFn">
        {{ item }}
      </div>

      <ng-template ngFor let-item [ngForOf]="[1, 2, 3]" let-i="index"
        [ngForTrackBy]="trackByFn">
        {{ item }}
      </ng-template>
    `,
    `
      <div *ngFor="
        let item of [1, 2, 3];
        let i = index;
        trackBy : trackByFn
      ">
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail when trackBy function is not present',
      annotatedSource: `
        <ul>
          <li *ngFor="let item of [1, 2, 3];">
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            {{ item }}
          </li>
        </ul>
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail when [ngForTrackBy] is missing in ng-template',
      annotatedSource: `
        <ng-template ngFor let-item [ngForOf]="[1, 2, 3]" let-i="index">
                                    ~~~~~~~~~~~~~~~~~~~~~
          {{ item }}
        </ng-template>
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail when there are two ngFor and for the second, trackBy function is not present',
      annotatedSource: `
        <div *ngFor="let item of [1, 2, 3]; trackBy: trackByFn">
          {{ item }}
        </div>
        <ul>
          <li *ngFor="let item of [1, 2, 3];">
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            {{ item }}
          </li>
        </ul>
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail when trackBy function is missing in multiple *ngFor',
      annotatedSource: `
        <div *ngFor="let item of [1, 2, 3];">
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          {{ item }}
        </div>
        <ng-template ngFor let-item [ngForOf]="[1, 2, 3]" let-i="index">
                                    ^^^^^^^^^^^^^^^^^^^^^
          {{ item }}
        </ng-template>
      `,
      messages: [
        {
          char: '~',
          messageId,
        },
        {
          char: '^',
          messageId,
        },
      ],
    }),
  ],
});
