import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-global-document';

const messageId: MessageIds = 'noGlobalDocument';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // should allow document access outside of Angular classes
  `
    class NotAngular {
      getTitle() {
        return document.title;
      }
    }
  `,
  // should allow document access at module level (no class)
  `
    const title = document.title;
  `,
  // should allow inject(DOCUMENT) usage inside a Component
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      private readonly document = inject(DOCUMENT);

      getTitle() {
        return this.document.title;
      }
    }
  `,
  // should allow @Inject(DOCUMENT) constructor parameter
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      constructor(@Inject(DOCUMENT) private readonly document: Document) {}

      getTitle() {
        return this.document.title;
      }
    }
  `,
  // should allow a local variable named 'document' inside a method
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      method(document: Document) {
        return document.title;
      }
    }
  `,
  // should allow a function parameter named 'document'
  `
    @Directive({ selector: '[appFoo]' })
    class FooDirective {
      method() {
        const fn = (document: Document) => document.title;
        return fn;
      }
    }
  `,
  // should allow a block-scoped variable named 'document' that shadows the global
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      method() {
        const document = inject(DOCUMENT);
        return document.title;
      }
    }
  `,
  // should not report document on a nested plain class inside an Angular class
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      method() {
        class InnerHelper {
          getTitle() {
            return document.title;
          }
        }
        return InnerHelper;
      }
    }
  `,
  // should allow window.document in a non-Angular class
  `
    class NotAngular {
      getDoc() {
        return window.document;
      }
    }
  `,
  // should allow document access in @Injectable when checkServices is false
  {
    code: `
      @Injectable({ providedIn: 'root' })
      class FooService {
        getTitle() {
          return document.title;
        }
      }
    `,
    options: [{ checkServices: false }],
  },
  // should allow document access in @Pipe when checkServices is false
  {
    code: `
      @Pipe({ name: 'foo' })
      class FooPipe {
        transform() {
          return document.title;
        }
      }
    `,
    options: [{ checkServices: false }],
  },
  // should allow document access in @Service when checkServices is false
  {
    code: `
      @Service()
      class FooService {
        getTitle() {
          return document.title;
        }
      }
    `,
    options: [{ checkServices: false }],
  },
  // should allow accessing a property that is NOT the global 'document' identifier
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      private readonly iframe = viewChild<ElementRef>('iframe');

      getContent() {
        return this.iframe()?.nativeElement.contentWindow.document;
      }
    }
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when accessing document.title in a Component',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        getTitle() {
          return document.title;
                 ~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when accessing document through a chained property in a Component',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        getBodyColor() {
          return document.body.style.color;
                 ~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when calling document.addEventListener in a Component',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        ngOnInit() {
          document.addEventListener('click', () => {});
          ~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when using window.document in a Component',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        getTitle() {
          return window.document.title;
                 ~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when using globalThis.document in a Component',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        getTitle() {
          return globalThis.document.title;
                 ~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when using optional chaining on the global document in a Component',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        getTitle() {
          return document?.title;
                 ~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when using the global document inside a Directive',
    annotatedSource: `
      @Directive({ selector: '[appFoo]' })
      class FooDirective {
        ngAfterViewInit() {
          const title = document.title;
                        ~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should report multiple global document usages in the same class',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        ngOnInit() {
          const title = document.title;
                        ~~~~~~~~
          const body = document.body;
                       ^^^^^^^^
        }
      }
    `,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when using document.title in @Injectable (checkServices defaults to true)',
    annotatedSource: `
      @Injectable({ providedIn: 'root' })
      class FooService {
        getTitle() {
          return document.title;
                 ~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when using document.title in @Pipe (checkServices defaults to true)',
    annotatedSource: `
      @Pipe({ name: 'foo' })
      class FooPipe {
        transform() {
          return document.title;
                 ~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when using document.title in @Service (checkServices defaults to true)',
    annotatedSource: `
      @Service()
      class FooService {
        getTitle() {
          return document.title;
                 ~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when document is used in a class field initializer',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        private title = document.title;
                        ~~~~~~~~
      }
    `,
    messageId,
  }),
];
