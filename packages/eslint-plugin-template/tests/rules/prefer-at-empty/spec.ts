import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/test-utils';
import rule, { RULE_NAME } from '../../../src/rules/prefer-at-empty';
import { invalid, valid } from './cases';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@angular-eslint/template-parser'),
  },
});

ruleTester.run(RULE_NAME, rule, {
  valid,
  invalid: [
    ...invalid,
    convertAnnotatedSourceToFailureCase({
      description:
        "fails when '@for' uses a callable collection followed by an empty length check",
      annotatedSource: `
        @for (evt of eventQueue(); track evt) {
          {{ evt }}
        }
        @if (eventQueue().length === 0) {
        ~~~~
          Awaiting app bootstrap...
        }
      `,
      messageId: 'preferAtEmpty',
      annotatedOutput: `
        @for (evt of eventQueue(); track evt) {
          {{ evt }}
        }
        @empty {
        
          Awaiting app bootstrap...
        }
      `,
    }),
  ],
});
