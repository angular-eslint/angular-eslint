import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-output-on-prefix';
import rule, { RULE_NAME } from '../../src/rules/no-output-on-prefix';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});
const messageId: MessageIds = 'noOutputOnPrefix';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Component()
    class Test {
      @Output() change = new EventEmitter<void>();
    }
    `,
    `
    @Component()
    class Test {
      @Output('testing') oneProp = new EventEmitter<void>();
    }
    `,
    `
    @Directive()
    class Test {
      @Output() selectionChanged = new EventEmitter<void>();
    }
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: `it should fail if a component output property's name is prefixed with "on"`,
      annotatedSource: `
        @Component()
        class Test {
          @Output() onChange = new EventEmitter<void>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: `it should fail if a component output property's alias is prefixed with "on"`,
      annotatedSource: `
        @Component()
        class Test {
          @Output('onChange') test = new EventEmitter<void>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if a directive output property name is equal to "on"',
      annotatedSource: `
        @Directive()
        class Test {
          @Output() on = new EventEmitter<void>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
  ],
});
