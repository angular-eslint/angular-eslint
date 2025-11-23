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
  `class Test {}`,
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
  // in InjectionToken factory with arrow function shorthand
  `
  const MY_TOKEN = new InjectionToken('my-token', {
    factory: () => someObservable.pipe(takeUntilDestroyed())
  });
`,
  // in Provider useFactory within Component
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
  // in Provider useFactory within NgModule
  `
  @NgModule({
    providers: [
      {
        provide: TOKEN,
        useFactory: () => data$.pipe(takeUntilDestroyed())
      }
    ]
  })
  class AppModule {}
`,
  // in Provider useFactory within Directive
  `
  @Directive({
    providers: [
      {
        provide: TOKEN,
        useFactory: () => data$.pipe(takeUntilDestroyed())
      }
    ]
  })
  class MyDirective {}
`,
  // in @Injectable useFactory
  `
  @Injectable({
    providedIn: 'root',
    useFactory: () => someObservable.pipe(takeUntilDestroyed())
  })
  class MyService {}
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
];
