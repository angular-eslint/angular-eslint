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
  // should allow inject(DOCUMENT) with DOCUMENT imported from @angular/core
  `
    import { Component, DOCUMENT, inject } from '@angular/core';

    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      private readonly document = inject(DOCUMENT);

      getTitle() {
        return this.document.title;
      }
    }
  `,
  // should allow inject(DOCUMENT) with DOCUMENT imported from @angular/common
  `
    import { DOCUMENT } from '@angular/common';
    import { Component, inject } from '@angular/core';

    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      private readonly document = inject(DOCUMENT);

      ngOnInit() {
        this.document.body.classList.add('foo');
      }
    }
  `,
  // should allow an imported @Inject(DOCUMENT) constructor parameter
  `
    import { DOCUMENT } from '@angular/common';
    import { Component, Inject } from '@angular/core';

    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      constructor(@Inject(DOCUMENT) private readonly document: Document) {}

      ngOnInit() {
        this.document.addEventListener('click', () => {});
      }
    }
  `,
  // should allow a class member and a method named 'document'
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      document = inject(DOCUMENT);

      getDocument() {
        return this.document;
      }

      ['document']() {
        return this['document'];
      }
    }
  `,
  // should allow 'document' as an object literal key and in a type member
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      private readonly options: { document: Document } = {
        document: inject(DOCUMENT),
      };

      configure(options: { document?: Document }) {
        return { ...options, document: this.options.document };
      }
    }
  `,
  // should allow 'typeof document' in a type position
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      private readonly document: typeof document = inject(DOCUMENT);
      private body?: typeof document.body;

      method(): typeof globalThis.document {
        return this.document;
      }
    }
  `,
  // should allow a parameter named 'window' typed as Window
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      getTitle(window: Window) {
        return window.document.title;
      }
    }
  `,
  // should allow an imported binding named 'window'
  `
    import { Component } from '@angular/core';
    import { window } from './window-adapter';

    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      getTitle() {
        const { document } = window;
        return window.document.title + window['document'].title + document.title;
      }
    }
  `,
  // should allow a local variable named 'globalThis'
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      getTitle() {
        const globalThis = { document: inject(DOCUMENT) };
        return globalThis.document.title;
      }
    }
  `,
  // should allow reading other properties from window and globalThis
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      method() {
        const { location } = window;
        return [location, globalThis.navigator, window['documentElement']];
      }
    }
  `,
  // should not report a nested plain class expression inside an Angular class
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      private readonly helper = class {
        getTitle() {
          return window.document.title + document.title;
        }
      };
    }
  `,
  // should not treat a non-Angular decorator aliased to an Angular name as Angular
  `
    import { Component } from '@angular/core';
    import { Component as Widget } from './my-widgets';

    @Widget()
    class FooWidget {
      getTitle() {
        return document.title;
      }
    }
  `,
  // should use the imported name of an aliased @angular/core decorator
  {
    code: `
      import { Injectable as Component } from '@angular/core';

      @Component({ providedIn: 'root' })
      class FooService {
        getTitle() {
          return document.title;
        }
      }
    `,
    options: [{ checkServices: false }],
  },
  // should not report a namespace-imported service decorator when checkServices is false
  {
    code: `
      import * as core from '@angular/core';

      @core.Injectable({ providedIn: 'root' })
      class FooService {
        getTitle() {
          return document.title;
        }
      }
    `,
    options: [{ checkServices: false }],
  },
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
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when calling document.body.querySelector',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        ngAfterViewInit() {
          return document.body.querySelector('x');
                 ~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when calling document.addEventListener with a handler reference',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        ngOnInit() {
          const fn = () => {};
          document.addEventListener('click', fn);
          ~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when calling window.document.getElementById',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        ngOnInit() {
          return window.document.getElementById('x');
                 ~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when calling globalThis.document.getElementById',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        ngOnInit() {
          return globalThis.document.getElementById('x');
                 ~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when calling document?.querySelector',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        ngOnInit() {
          return document?.querySelector('x');
                 ~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when using window?.document',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        getTitle() {
          return window?.document.title;
                 ~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail when using window['document'] and globalThis['document']",
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        getTitles() {
          return [window['document'].title, globalThis[\`document\`].title];
                  ~~~~~~~~~~~~~~~~~~        ^^^^^^^^^^^^^^^^^^^^^^
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
      'should fail when destructuring document from window or globalThis',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        getTitles() {
          const { document } = window;
                  ~~~~~~~~
          const { document: doc } = globalThis;
                  ^^^^^^^^^^^^^
          return document.title + doc.title;
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
      'should fail when destructuring document from window in an assignment',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        getTitle() {
          let document: Document;
          ({ document } = window);
             ~~~~~~~~
          return document.title;
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when using typeof document in a value position',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        isBrowser() {
          return typeof document !== 'undefined';
                        ~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when passing the global document in a shorthand property',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        getContext() {
          return { document };
                   ~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a type-only declaration named document exists',
    annotatedSource: `
      type document = { title: string };
      interface Props { document: document }

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
      'should fail when using the global document in a callback inside a Component',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        ngOnInit() {
          setTimeout(() => {
            document.title = 'loaded';
            ~~~~~~~~
          });
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail in the Angular class but not in a nested plain class',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        method() {
          class InnerHelper {
            getTitle() {
              return document.title;
            }
          }
          return [new InnerHelper(), document.body];
                                     ~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail for an aliased Component decorator imported from @angular/core',
    annotatedSource: `
      import { Component as NgComponent } from '@angular/core';

      @NgComponent({ selector: 'app-foo', template: '' })
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
      'should fail for a namespace-imported Directive decorator from @angular/core',
    annotatedSource: `
      import * as core from '@angular/core';

      @core.Directive({ selector: '[appFoo]' })
      class FooDirective {
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
      'should fail for a namespace-imported Injectable decorator (checkServices defaults to true)',
    annotatedSource: `
      import * as core from '@angular/core';

      @core.Injectable({ providedIn: 'root' })
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
    description: 'should fail inside a decorated class expression',
    annotatedSource: `
      const FooComponent = @Component({ selector: 'app-foo', template: '' })
      class {
        getTitle() {
          return document.title;
                 ~~~~~~~~
        }
      };
    `,
    messageId,
  }),
];
