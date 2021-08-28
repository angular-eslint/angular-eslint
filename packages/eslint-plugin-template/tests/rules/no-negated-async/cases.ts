import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/no-negated-async';

const messageId: MessageIds = 'noNegatedAsync';
const suggestFalseComparison: MessageIds = 'suggestFalseComparison';
const suggestNullComparison: MessageIds = 'suggestNullComparison';
const suggestUndefinedComparison: MessageIds = 'suggestUndefinedComparison';

export const valid = [
  // it should succeed if async pipe is not negated
  `{{ (foo | async) }}`,
  // it should succeed if async pipe is not the last pipe in the negated chain
  `{{ !(foo | async | somethingElse) }}`,
  // it should succeed if async pipe uses loose equality
  `{{ (foo | async) == null }}`,
  // it should succeed if async pipe uses strict equality
  `{{ (foo | async) === false }}`,
  // it should succeed if any other pipe is negated
  `{{ !(foo | notAnAsyncPipe) }}`,
  // https://github.com/angular-eslint/angular-eslint/issues/404
  `<div [class.mx-4]="!!(foo | async)"></div>`,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail if async pipe is negated',
    /**
     * Deliberately including some leading whitespace within the binding to assert
     * location correctness
     */
    annotatedSource: `
        {{      !(foo | async) }}
                ~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestFalseComparison,
        output: `
        {{      (foo | async) === false }}
                
      `,
      },
      {
        messageId: suggestNullComparison,
        output: `
        {{      (foo | async) === null }}
                
      `,
      },
      {
        messageId: suggestUndefinedComparison,
        output: `
        {{      (foo | async) === undefined }}
                
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if async pipe is the last pipe in the negated chain',
    annotatedSource: `
        {{ !(foo | somethingElse | async) }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestFalseComparison,
        output: `
        {{ (foo | somethingElse | async) === false }}
           
      `,
      },
      {
        messageId: suggestNullComparison,
        output: `
        {{ (foo | somethingElse | async) === null }}
           
      `,
      },
      {
        messageId: suggestUndefinedComparison,
        output: `
        {{ (foo | somethingElse | async) === undefined }}
           
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail if async pipe is negated using *ngIf',
    annotatedSource: `
        <div *ngIf="!(a | async)"></div>
                    ~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestFalseComparison,
        output: `
        <div *ngIf="(a | async) === false"></div>
                    
      `,
      },
      {
        messageId: suggestNullComparison,
        output: `
        <div *ngIf="(a | async) === null"></div>
                    
      `,
      },
      {
        messageId: suggestUndefinedComparison,
        output: `
        <div *ngIf="(a | async) === undefined"></div>
                    
      `,
      },
    ],
  }),
  // https://github.com/angular-eslint/angular-eslint/issues/280#issuecomment-760208638
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail if async pipe is negated within binary',
    annotatedSource: `
        {{ nullable ?? !(obsVar | async) }}
                       ~~~~~~~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestFalseComparison,
        output: `
        {{ nullable ?? (obsVar | async) === false }}
                       
      `,
      },
      {
        messageId: suggestNullComparison,
        output: `
        {{ nullable ?? (obsVar | async) === null }}
                       
      `,
      },
      {
        messageId: suggestUndefinedComparison,
        output: `
        {{ nullable ?? (obsVar | async) === undefined }}
                       
      `,
      },
    ],
  }),
];
