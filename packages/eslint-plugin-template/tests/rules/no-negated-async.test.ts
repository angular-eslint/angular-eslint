import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, { RULE_NAME } from '../../src/rules/no-negated-async';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // it should succeed if async pipe is not negated
    `
      {{ (foo | async) }}
    `,
    // it should succeed if async pipe is not the last pipe in the negated chain
    `
      {{ !(foo | async | somethingElse) }}
    `,
    // it should succeed if async pipe uses strict equality
    `
      {{ (foo | async) === false }}
    `,
    // it should succeed if any other pipe is negated
    `
      {{ !(foo | notAnAsyncPipe) }}
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if async pipe is negated',
      annotatedSource: `
        {{ !(foo | async) }}
           ~~~~~~~~~~~~~~
      `,
      messageId: 'noNegatedAsync',
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if async pipe is the last pipe in the negated chain',
      annotatedSource: `
          {{ !(foo | somethingElse | async) }}
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
      messageId: 'noNegatedAsync',
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if the async pipe uses loose equality',
      annotatedSource: `
        {{ (foo | async) == false }}
           ~~~~~~~~~~~~~~~~~~~~~~
      `,
      messageId: 'noLooseEquality',
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if async pipe is negated using *ngIf',
      annotatedSource: `
        <div *ngIf="!(a | async)"></div>
                    ~~~~~~~~~~~~
      `,
      messageId: 'noNegatedAsync',
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail for multiple negated/loose equality async pipes',
      annotatedSource: `
        <div *ngFor="let elem of [1, 2, 3]; trackBy: trackByFn">
          {{ elem }}
        </div>
        <div *ngIf="!(foo | async)">
                    ~~~~~~~~~~~~~~
          {{ (foo | async) == false }}
             ^^^^^^^^^^^^^^^^^^^^^^
          <div *ngIf="(foo | async) == false">
                      ######################
            works!
          </div>
        </div>
      `,
      messages: [
        { char: '~', messageId: 'noNegatedAsync' },
        { char: '^', messageId: 'noLooseEquality' },
        { char: '#', messageId: 'noLooseEquality' },
      ],
    }),
  ],
});
