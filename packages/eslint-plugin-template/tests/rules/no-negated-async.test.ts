import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-negated-async';
import rule, { RULE_NAME } from '../../src/rules/no-negated-async';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});
const messageId: MessageIds = 'noNegatedAsync';

ruleTester.run(RULE_NAME, rule, {
  valid: [
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
  ],
  invalid: [
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
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if async pipe is the last pipe in the negated chain',
      annotatedSource: `
        {{ !(foo | somethingElse | async) }}
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if async pipe is negated using *ngIf',
      annotatedSource: `
        <div *ngIf="!(a | async)"></div>
                    ~~~~~~~~~~~~
      `,
      messageId,
    }),
    // https://github.com/angular-eslint/angular-eslint/issues/280#issuecomment-760208638
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if async pipe is negated within binary',
      annotatedSource: `
        {{ nullable ?? !(obsVar | async) }}
                       ~~~~~~~~~~~~~~~~~
      `,
      messageId,
    }),
  ],
});
