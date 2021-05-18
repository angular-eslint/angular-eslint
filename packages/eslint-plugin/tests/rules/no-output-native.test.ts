import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-output-native';
import rule, { RULE_NAME } from '../../src/rules/no-output-native';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});
const messageId: MessageIds = 'noOutputNative';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Component()
    class Test {
      @Output() buttonChange = new EventEmitter<string>();
    }
    `,
    `
    @Component()
    class Test {
      @Output('buttonChange') _buttonChange = new EventEmitter<string>();
    }
    `,
    `
    @Directive()
    class Test {
      @Output() buttonChange = new EventEmitter<string>();
    }
    `,
    `
    @Directive()
    class Test {
      @Output('buttonChange') _buttonChange = new EventEmitter<string>();
    }
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if a property is named "change"',
      annotatedSource: `
        @Component()
        class Test {
          @Output() change = new EventEmitter<string>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if a property is aliased as "change"',
      annotatedSource: `
        @Component()
        class Test {
          @Output('change') _change = new EventEmitter<string>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if a property is named "change"',
      annotatedSource: `
        @Directive()
        class Test {
          @Output() change = new EventEmitter<string>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if a property is aliased as "change"',
      annotatedSource: `
        @Directive()
        class Test {
          @Output('change') _change = new EventEmitter<string>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
  ],
});
