import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/component-class-suffix';

const messageId: MessageIds = 'componentClassSuffix';

export const valid = [
  `
    @Component({
      selector: 'sg-foo-bar',
      template: '<foo-bar [foo]="bar">{{baz + 42}}</foo-bar>'
    })
    class TestComponent {}
`,
  `
    @Directive({
      selector: '[myHighlight]'
    })
    class TestDirective {}
`,
  `
    @Pipe({
      selector: 'sg-test-pipe'
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
        @Component({
          selector: 'sgBarFoo'
        })
        class TestPage {}
      `,
    options: [{ suffixes: ['Page'] }],
  },
  {
    code: `
        @Component({
          selector: 'sgBarFoo'
        })
        class TestPage {}
      `,
    options: [{ suffixes: ['Page', 'View'] }],
  },
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail when component class is with the wrong suffix',
    annotatedSource: `
        @Component({
          selector: 'sg-foo-bar'
        })
        class Test {}
              ~~~~
      `,
    messageId,
    data: { suffixes: '"Component"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `it should fail when a different list of suffixes is set and doesn't match`,
    annotatedSource: `
        @Component({
          selector: 'sgBarFoo'
        })
        class TestPage {}
              ~~~~~~~~
      `,
    messageId,
    options: [{ suffixes: ['Component', 'View'] }],
    data: { suffixes: '"Component" or "View"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `it should fail when a different list of suffixes is set and doesn't match`,
    annotatedSource: `
        @Component({
          selector: 'sgBarFoo'
        })
        class TestPage {}
              ~~~~~~~~
      `,
    messageId,
    options: [{ suffixes: ['Component'] }],
    data: { suffixes: '"Component"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `it should fail when a different list of suffixes is set and doesn't match`,
    annotatedSource: `
        @Component({
          selector: 'sgBarFoo'
        })
        class TestDirective {}
              ~~~~~~~~~~~~~
      `,
    messageId,
    options: [{ suffixes: ['Page'] }],
    data: { suffixes: '"Page"' },
  }),
];
