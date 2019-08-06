import rule, { MessageIds, RULE_NAME } from '../../src/rules/no-output-rename';
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

const messageId: MessageIds = 'noOutputRename';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // should succeed when a directive output property is properly used
    `
    @Component({
      template: 'test'
    })
    class TestComponent {
      @Output() change = new EventEmitter<void>();
    }
    `,
    // should succeed when the directive's selector is also an output property
    `
    @Directive({
      selector: '[foo], test'
    })
    class TestDirective {
      @Output('foo') bar = new EventEmitter<void>();
    }
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail when a directive output property is renamed',
      annotatedSource: `
     @Component({
       template: 'test'
     })
     class TestComponent {
       @Output('onChange') change = new EventEmitter<void>();
       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     }
          `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail when a directive output property is renamed and its name is strictly equal to the property',
      annotatedSource: `
      @Component({
        template: 'test'
      })
      class TestComponent {
        @Output('change') change = new EventEmitter<void>();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
      `,
      messageId,
    }),

    convertAnnotatedSourceToFailureCase({
      description:
        "should fail when the directive's selector matches exactly both property name and the alias",
      annotatedSource: `
      @Directive({
        selector: '[test], foo'
      })
      class TestDirective {
        @Output('test') test = new EventEmitter<void>();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
      `,
      messageId,
    }),
  ],
});
