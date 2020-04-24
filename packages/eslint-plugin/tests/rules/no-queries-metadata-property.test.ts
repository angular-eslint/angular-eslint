import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/no-queries-metadata-property';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'noQueriesMetadataProperty';

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
        'it should fail if "queries" metadata property is used in @Component',
      annotatedSource: `
        @Component({
          queries: {
          ~~~~~~~~~~
            contentChild: new ContentChild(ChildDirective),
            contentChildren: new ContentChildren(ChildDirective),
            viewChild: new ViewChild(ChildDirective),
            viewChildren: new ViewChildren(ChildDirective)
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
        'it should fail if "queries" metadata property is used in @Directive',
      annotatedSource: `
        @Directive({
          queries: {
          ~~~~~~~~~
            contentChild: new ContentChild(ChildDirective),
            contentChildren: new ContentChildren(ChildDirective),
            viewChild: new ViewChild(ChildDirective),
            viewChildren: new ViewChildren(ChildDirective)
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
