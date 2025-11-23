import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import {
  MessageIds,
  Options,
} from '../../../src/rules/no-implicit-take-until-destroyed';

const messageId: MessageIds = 'noImplicitTakeUntilDestroyed';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // in Component constructor (injection context)
  `
    @Component()
    class Test {
      constructor() {
        this.data$.pipe(takeUntilDestroyed()).subscribe();
      }
    }
  `,
  // in Directive constructor (injection context)
  `
    @Directive()
    class Test {
      constructor() {
        this.data$.pipe(takeUntilDestroyed()).subscribe();
      }
    }
  `,
  // in Injectable constructor (injection context)
  `
    @Injectable()
    class Test {
      constructor() {
        this.data$.pipe(takeUntilDestroyed()).subscribe();
      }
    }
  `,
  // in Pipe constructor (injection context)
  `
    @Pipe({ name: 'myPipe' })
    class MyPipe {
      constructor() {
        this.data$.pipe(takeUntilDestroyed()).subscribe();
      }
    }
  `,
  // in Component field initializer (injection context)
  `
    @Component()
    class Test {
      private data = this.http.get('/api').pipe(takeUntilDestroyed());
    }
  `,
  // in Service field initializer (injection context)
  `
    @Injectable()
    class TestService {
      private data = this.http.get('/api').pipe(takeUntilDestroyed());
    }
  `,
  // in Pipe field initializer (injection context)
  `
    @Pipe({ name: 'myPipe' })
    class MyPipe {
      private data = this.http.get('/api').pipe(takeUntilDestroyed());
    }
  `,
  // in InjectionToken factory (injection context)
  `
  const MY_TOKEN = new InjectionToken('my-token', {
    factory: () => {
      return someObservable.pipe(takeUntilDestroyed());
    }
  });
`,
  // explicit DestroyRef in Component lifecycle method
  `
    @Component()
    class Test {
      ngOnInit() {
        this.data$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      }
    }
  `,
  // explicit DestroyRef in Component regular method
  `
    @Component()
    class Test {
      doSomething() {
        this.data$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      }
    }
  `,
  // explicit DestroyRef in Service method
  `
    @Injectable()
    class TestService {
      loadData() {
        this.data$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      }
    }
  `,
  // in Provider useFactory
  `
  @Component({
    providers: [
      {
        provide: SomeToken,
        useFactory: () => data$.pipe(takeUntilDestroyed())
      }
    ]
  })
  class Test {}
`,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in Component ngOnInit without DestroyRef',
    annotatedSource: `
      @Component()
      class Test {
        ngOnInit() {
          this.data$.pipe(takeUntilDestroyed()).subscribe();
                          ~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in Component ngAfterViewInit without DestroyRef',
    annotatedSource: `
      @Component()
      class Test {
        ngAfterViewInit() {
          this.data$.pipe(takeUntilDestroyed()).subscribe();
                          ~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in Component regular method without DestroyRef',
    annotatedSource: `
      @Component()
      class Test {
        anyMethod() {
          this.data$.pipe(takeUntilDestroyed()).subscribe();
                          ~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in Directive method without DestroyRef',
    annotatedSource: `
      @Directive()
      class Test {
        anyMethod() {
          this.data$.pipe(takeUntilDestroyed()).subscribe();
                          ~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in Service ngOnDestroy without DestroyRef',
    annotatedSource: `
      @Injectable()
      class TestService {
        ngOnDestroy() {
          this.data$.pipe(takeUntilDestroyed()).subscribe();
                          ~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in Service regular method without DestroyRef',
    annotatedSource: `
      @Injectable()
      class TestService {
        loadData() {
          this.data$.pipe(takeUntilDestroyed()).subscribe();
                          ~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail in constructor class not stantiated by the DI system',
    annotatedSource: `
    class Test {
      constructor() {
        this.data$.pipe(takeUntilDestroyed()).subscribe();
                        ~~~~~~~~~~~~~~~~~~~~
      }
    }
  `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail in NgModule constructor (NgModule does not support DestroyRef)',
    annotatedSource: `
      @NgModule()
      class AppModule {
        constructor() {
          this.data$.pipe(takeUntilDestroyed()).subscribe();
                          ~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail in NgModule field initializer (NgModule does not support DestroyRef)',
    annotatedSource: `
      @NgModule()
      class AppModule {
        private data = this.http.get('/api').pipe(takeUntilDestroyed());
                                                  ~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
  }),
];
