import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-async-lifecycle-method';

const messageId: MessageIds = 'noAsyncLifecycleMethod';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    @Component()
    class Test {
      ngAfterContentChecked() { }
    }
  `,
  `
    @Component()
    class Test {
      ngAfterContentInit() { }
    }
  `,
  `
    @Component()
    class Test {
      ngAfterViewChecked() { }
    }
  `,
  `
    @Component()
    class Test {
      ngAfterViewInit() { }
    }
  `,
  `
    @Component()
    class Test {
      ngDoBootstrap() { }
    }
  `,
  `
    @Component()
    class Test {
      ngDoCheck() { }
    }
  `,
  `
    @Component()
    class Test {
      ngOnChanges() { }
    }
  `,
  `
    @Component()
    class Test {
      ngOnDestroy() { }
    }
  `,
  `
    @Component()
    class Test {
      ngOnInit() { }
    }
  `,
  // should not fail with regular function which are not part of Angular Component
  `
    async function ngAfterContentChecked() {}
    async function ngAfterContentInit() {}
    async function ngAfterViewChecked() {}
    async function ngAfterViewInit() {}
    async function ngDoBootstrap() {}
    async function ngDoCheck() {}
    async function ngOnChanges() {}
    async function ngOnDestroy() {}
    async function ngOnInit() {}
  `,
  // should not fail with non Angular class
  `
  class Test {
    async ngOnInit() {}
  }
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if ngAfterContentChecked() is async',
    annotatedSource: `
      @Component()
      class Test {
        async ngAfterContentChecked() { }
              ~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if ngAfterContentInit() is async',
    annotatedSource: `
      @Component()
      class Test {
        async ngAfterContentInit() { }
              ~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if ngAfterViewChecked() is async',
    annotatedSource: `
      @Component()
      class Test {
        async ngAfterViewChecked() { }
              ~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if ngAfterViewInit() is async',
    annotatedSource: `
      @Component()
      class Test {
        async ngAfterViewInit() { }
              ~~~~~~~~~~~~~~~
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if ngDoBootstrap() is async',
    annotatedSource: `
      @Pipe()
      class Test {
        async ngDoBootstrap() { }
              ~~~~~~~~~~~~~
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if ngDoCheck() is async',
    annotatedSource: `
      @Component()
      class Test {
        async ngDoCheck() { }
              ~~~~~~~~~
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if ngOnChanges() is async',
    annotatedSource: `
      @Component()
      class Test {
        async ngOnChanges() { }
              ~~~~~~~~~~~
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if ngOnDestroy() is async',
    annotatedSource: `
      @Component()
      class Test {
        async ngOnDestroy() { }
              ~~~~~~~~~~~
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if ngOnInit() is async',
    annotatedSource: `
      @Component()
      class Test {
        async ngOnInit() { }
              ~~~~~~~~
      }
    `,
    messageId,
  }),
];
