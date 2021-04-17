import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-pipe-impure';
import rule, { RULE_NAME } from '../../src/rules/no-pipe-impure';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'noPipeImpure';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // should succeed if pure property is set to true
    `
    @Pipe({
      name: 'test',
      pure: true
    })
    class Test {}
`,
    // should succeed if pure property is not set
    `
        @Pipe({
          name: 'test'
        })
        class Test {}
`,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if pure property is set to false',
      annotatedSource: `
      @Pipe({
        name: 'test',
        pure: false
              ~~~~~
      })
      class Test {}
      `,
      messageId,
    }),
  ],
});
