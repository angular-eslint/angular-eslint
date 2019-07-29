import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/no-host-metadata-property';
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

const messageId: MessageIds = 'noHostMetadataProperty';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Component({
      selector: 'app-test',
      template: 'Hello'
    })
    class TestComponent {}
`,
    `
    @Directive({
      selector: 'app-test'
    })
    class TestDirective {}
`,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if "host" metadata property is used in @Component',
      annotatedSource: `
        @Component({
          host: {
          ~~~~~~~
            class: 'my-class',
            [type]: 'test',
            '(click)': 'bar()'
          },
          ~
          selector: 'app-test'
        })
        class TestComponent {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if "host" metadata property is used in @Directive',
      annotatedSource: `
        @Directive({
          host: {
          ~~~~~~~
            class: 'my-class',
            [type]: 'test',
            '(click)': 'bar()'
          },
          ~
          selector: 'app-test'
        })
        class TestDirective {}
      `,
      messageId,
    }),
  ],
});
