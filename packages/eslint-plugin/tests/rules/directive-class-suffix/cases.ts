import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/directive-class-suffix';

const messageId: MessageIds = 'directiveClassSuffix';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    @Directive({
      selector: 'sgBarFoo'
    })
    class TestDirective {}
    `,
  `
    @Directive({
      selector: 'sgBarFoo'
    })
    class TestValidator implements Validator {}
    `,
  `
    @Directive({
      selector: 'sgBarFoo'
    })
    class TestValidator implements AsyncValidator {}
    `,
  `
    @Directive
    class Test {}
    `,
  // https://github.com/angular-eslint/angular-eslint/issues/353
  `
    @Directive()
    class Test {}
    `,
  `
    @Component({
      selector: 'sg-bar-foo'
    })
    class TestComponent {}
    `,
  `
    @Pipe({
      name: 'sgPipe'
    })
    class TestPipe {}
    `,
  `
    @Injectable()
    class TestService {}
    `,
  `
    class TestEmpty {}
    `,
  {
    code: `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestDir {}
      `,
    options: [{ suffixes: ['Dir'] }],
  },
  {
    code: `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestPage {}
      `,
    options: [{ suffixes: ['Page', 'View'] }],
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if directive class name does not end with the default suffix',
    annotatedSource: `
        @Directive({
          selector: 'sg-foo-bar'
        })
        class Test {}
              ~~~~
      `,
    messageId,
    data: { suffixes: '"Directive"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if directive class name does not end with one of the default suffixes',
    annotatedSource: `
        @Directive({
          selector: 'sg-foo-bar'
        })
        class TestDirectivePage implements AsyncValidator {}
              ~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { suffixes: '"Directive" or "Validator"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if directive class name does not end with the custom suffix',
    annotatedSource: `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestPageDirective {}
              ~~~~~~~~~~~~~~~~~
      `,
    messageId,
    options: [{ suffixes: ['Page'] }],
    data: { suffixes: '"Page"' },
  }),
];
