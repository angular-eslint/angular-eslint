import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/use-component-selector';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'useComponentSelector';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Component({
      selector: 'sg-bar-foo'
    })
    class Test {}
`,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail when selector is not given in @Component',
      annotatedSource: `
        @Component()
        ~~~~~~~~~~~~
        class Test {}
      `,
      messageId,
      data: {
        className: 'Test',
      },
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail when selector is not given in @Component',
      annotatedSource: `
        @Component()
        ~~~~~~~~~~~~
        class Test {}
      `,
      messageId,
      data: {
        className: 'Test',
      },
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail when selector is empty in @Component',
      annotatedSource: `
        @Component({
        ~~~~~~~~~~~~
          selector: ''
        })
        ~~
        class Test {}
      `,
      messageId,
      data: {
        className: 'Test',
      },
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail when selector equals 0 in @Component',
      annotatedSource: `
        @Component({
        ~~~~~~~~~~~~
          selector: 0
        })
        ~~
        class Test {}
      `,
      messageId,
      data: {
        className: 'Test',
      },
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail when selector equals null in @Component',
      annotatedSource: `
        @Component({
        ~~~~~~~~~~~~
          selector: null
        })
        ~~
        class Test {}
      `,
      messageId,
      data: {
        className: 'Test',
      },
    }),
  ],
});
