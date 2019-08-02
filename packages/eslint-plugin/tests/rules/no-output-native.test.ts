import rule, { MessageIds, RULE_NAME } from '../../src/rules/no-output-native';
import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '../test-helper';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'noOutputNative';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // should succeed if a property is properly named
    `
      @Component()
      class Test {
        @Output() buttonChange = new EventEmitter<string>();
      }
    `,
    // should succeed if a property is properly renamed
    `
      @Component()
      class Test {
        @Output('buttonChange') _buttonChange = new EventEmitter<string>();
      }
      `,
    // should succeed if a property is properly named
    `
      @Directive()
      class Test {
        @Output() buttonChange = new EventEmitter<string>();
      }
      `,
    // should succeed if a property is properly renamed
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
      description: 'should fail if a property is renamed to "change"',
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
      description: 'should fail if a property is renamed to "change"',
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
