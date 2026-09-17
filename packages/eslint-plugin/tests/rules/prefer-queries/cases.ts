import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/prefer-queries';

const messageId: MessageIds = 'preferQueries';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // document queries outside of Angular classes are allowed
  `
    class NotAngular {
      foo() {
        return document.getElementById('foo');
      }
    }
  `,
  // using viewChild is fine
  `
    import { Component, viewChild } from '@angular/core';

    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      private el = viewChild<ElementRef>('foo');
    }
  `,
  // document access that is not a query method is allowed
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      getTitle() {
        return document.title;
      }
    }
  `,
  // other object method calls are fine
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      foo() {
        return someService.getElementById('foo');
      }
    }
  `,
  // static method calls that look similar but use a different callee
  `
    @Component({ selector: 'app-foo', template: '' })
    class FooComponent {
      foo() {
        const el = this.el.nativeElement.querySelector('.child');
        return el;
      }
    }
  `,
  // document queries inside Injectable are allowed when checkServices is not enabled (default)
  `
    @Injectable({ providedIn: 'root' })
    class FooService {
      findElement() {
        return document.getElementById('foo');
      }
    }
  `,
  // document queries inside Injectable are allowed when checkServices is explicitly false
  {
    code: `
      @Injectable({ providedIn: 'root' })
      class FooService {
        findElement() {
          return document.getElementById('foo');
        }
      }
    `,
    options: [{ checkServices: false }],
  },
  // document queries inside Pipe are allowed when checkServices is not enabled (default)
  `
    @Pipe({ name: 'foo' })
    class FooPipe {
      transform() {
        return document.querySelector('.foo');
      }
    }
  `,
  // document queries inside Service are allowed when checkServices is not enabled (default)
  `
    @Service()
    class FooService {
      transform() {
        return document.querySelector('.foo');
      }
    }
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail when using document.getElementById inside a Component',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        ngAfterViewInit() {
          const el = document.getElementById('my-id');
                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
    data: { method: 'getElementById' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail when using document.querySelector inside a Component',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        ngAfterViewInit() {
          const el = document.querySelector('.my-class');
                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
    data: { method: 'querySelector' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail when using document.querySelectorAll inside a Component',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        ngAfterViewInit() {
          const els = document.querySelectorAll('.items');
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
    data: { method: 'querySelectorAll' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail when using document.getElementsByClassName inside a Component',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        getItems() {
          return document.getElementsByClassName('item');
                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
    data: { method: 'getElementsByClassName' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail when using document.getElementsByName inside a Component',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        getItems() {
          return document.getElementsByName('item');
                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
    data: { method: 'getElementsByName' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail when using document.getElementsByTagName inside a Component',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        getItems() {
          return document.getElementsByTagName('div');
                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
    data: { method: 'getElementsByTagName' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail when using document.getElementById inside a Directive',
    annotatedSource: `
      @Directive({ selector: '[appFoo]' })
      class FooDirective {
        ngAfterViewInit() {
          const el = document.getElementById('my-id');
                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
    data: { method: 'getElementById' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail when using window.document.getElementById inside a Component',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        ngAfterViewInit() {
          const el = window.document.getElementById('my-id');
                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
    data: { method: 'getElementById' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'should fail for multiple document queries in the same class',
    annotatedSource: `
      @Component({ selector: 'app-foo', template: '' })
      class FooComponent {
        ngAfterViewInit() {
          const a = document.getElementById('a');
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          const b = document.querySelector('.b');
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        }
      }
    `,
    messages: [
      { char: '~', messageId, data: { method: 'getElementById' } },
      { char: '^', messageId, data: { method: 'querySelector' } },
    ],
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail when using document.getElementById inside an Injectable with checkServices: true',
    annotatedSource: `
      @Injectable({ providedIn: 'root' })
      class FooService {
        findElement() {
          return document.getElementById('foo');
                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    options: [{ checkServices: true }],
    messageId,
    data: { method: 'getElementById' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail when using document.querySelector inside a Pipe with checkServices: true',
    annotatedSource: `
      @Pipe({ name: 'foo' })
      class FooPipe {
        transform() {
          return document.querySelector('.foo');
                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    options: [{ checkServices: true }],
    messageId,
    data: { method: 'querySelector' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'should fail when using document.querySelector inside a Service with checkServices: true',
    annotatedSource: `
      @Service()
      class FooService {
        transform() {
          return document.querySelector('.foo');
                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    options: [{ checkServices: true }],
    messageId,
    data: { method: 'querySelector' },
  }),
];
