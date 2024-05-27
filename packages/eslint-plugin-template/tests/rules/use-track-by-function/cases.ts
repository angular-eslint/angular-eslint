import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/use-track-by-function';

const messageId: MessageIds = 'useTrackByFunction';

export const valid = [
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
  {
    options: [{ alias: ['ngForTrackByProperty'] }],
    code: `
        <div *ngFor="
          let item of [1, 2, 3];
          let i = index;
          trackByProperty: 'id'
        ">
      `,
  },
  {
    options: [{ alias: ['ngForTrackById'] }],
    code: `
      <div *ngFor="let photo of photos; trackById"></div>
    `,
  },
  {
    options: [{ alias: ['ngForTrackByProperty'] }],
    code: `
      <ng-template ngFor let-item [ngForOf]="[1, 2, 3]" let-i="index" [ngForTrackByProperty]="trackByFn">
        {{ item }}
      </ng-template>
    `,
  },
];

export const invalid = [
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
    description:
      'should fail when trackBy function (`ngForTrackByProperty` alias) is not present',
    options: [{ alias: ['ngForTrackByProperty'] }],
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
      'should fail when [ngForTrackByProperty] is missing in ng-template',
    options: [{ alias: ['ngForTrackByProperty'] }],
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
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when there are three ngFor and for the third, trackBy function (`ngForTrackByProperty` alias) is not present',
    options: [{ alias: ['ngForTrackByProperty'] }],
    annotatedSource: `
        <div *ngFor="let item of [1, 2, 3]; trackBy: trackByFn">
          {{ item }}
        </div>
        <div *ngFor="let item of [1, 2, 3]; trackByProperty: trackByFn">
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
];
