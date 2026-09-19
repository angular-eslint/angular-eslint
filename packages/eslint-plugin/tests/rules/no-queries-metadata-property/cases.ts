import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-queries-metadata-property';

const messageId: MessageIds = 'noQueriesMetadataProperty';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
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
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
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
];
