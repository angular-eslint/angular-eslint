import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/prefer-output-readonly';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'preferOutputReadonly';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    class Test {
      @Output() readonly testEmitter = new EventEmitter<string>();
    }
`,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail when an @Output is not readonly',
      annotatedSource: `
        class Test {
          @Output() testEmitter = new EventEmitter<string>();
                    ~~~~~~~~~~~
        }
      `,
      messageId,
    }),
  ],
});
