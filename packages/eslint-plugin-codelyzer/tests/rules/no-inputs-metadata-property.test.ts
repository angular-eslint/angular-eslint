import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/no-inputs-metadata-property';
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

const messageId: MessageIds = 'noInputsMetadataProperty';

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
        'it should fail if "inputs" metadata property is used in @Component',
      annotatedSource: `
        @Component({
          inputs: [
          ~~~~~~~~~
            'id: foo'
          ],
          ~
          selector: 'app-test'
        })
        class TestComponent {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if "inputs" metadata property is used in @Directive',
      annotatedSource: `
        @Directive({
          inputs: [
          ~~~~~~~~~
            'id: foo'
          ],
          ~
          selector: 'app-test'
        })
        class TestDirective {}
      `,
      messageId,
    }),
  ],
});
