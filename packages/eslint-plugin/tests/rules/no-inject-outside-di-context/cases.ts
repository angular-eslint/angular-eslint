import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import {
  MessageIds,
  Options,
} from '../../../src/rules/no-inject-outside-di-context';

const messageId: MessageIds = 'noInjectOutsideDiContext';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // in Component constructor
  `
  @Component()
  class Test {
    constructor() {
      inject(SomeService);
    }
  }
  `,
  // in Directive constructor
  `
  @Directive()
  class Test {
    constructor() {
      inject(SomeService);
    }
  }
  `,
  // in Pipe constructor
  `
  @Pipe({ name: 'myPipe' })
  class MyPipe {
    constructor() {
      inject(SomeService);
    }
  }
  `,
  // in Service constructor
  `
  @Injectable()
  class Test {
    constructor() {
      inject(SomeService);
    }
  }
  `,
  // in NgModule constructor
  `
  @NgModule()
  class MyModule {
    constructor() {
      inject(SomeService);
    }
  }
  `,
  // in Component field initializer
  `
  @Component()
  class Test {
    private service = inject(SomeService);
  }
  `,
  // in Directive field initializer
  `
  @Directive()
  class Test {
    private service = inject(SomeService);
  }
  `,
  // in Pipe field initializer
  `
  @Pipe({ name: 'myPipe' })
  class MyPipe {
    private service = inject(SomeService);
  }
  `,
  // in Service field initializer
  `
  @Injectable()
  class TestService {
    private service = inject(SomeService);
  }
  `,
  // in NgModule field initializer
  `
  @NgModule()
  class MyPipe {
    private service = inject(SomeService);
  }
  `,
  // in InjectionToken factory with a block
  `
  const MY_TOKEN = new InjectionToken('my-token', {
    factory: () => {
      return inject(SomeService).data;
    }
  });
`,
  // in InjectionToken factory with a direct return
  `
  const MY_TOKEN = new InjectionToken('my-token', {
    factory: () => inject(SomeService).data,
  });
`,
  // in Provider useFactory with a block
  `
  @Component({
    providers: [
      {
        provide: SomeToken,
        useFactory: () => {
          return inject(SomeService).data;
        },
      }
    ]
  })
  class Test {}
  `,
  // in Provider useFactory with a direct return
  `
  @Component({
    providers: [
      {
        provide: SomeToken,
        useFactory: () => inject(SomeService).data,
      }
    ]
  })
  class Test {}
  `,
  // in Injectable useFactory with a block
  `
  @Injectable({
    useFactory: () => {
      inject(SomeService);
      return () => {};
    },
  })
  class MyService {}
  `,
  // in Injectable useFactory with a direct return
  `
  @Injectable({
    useFactory: () => inject(SomeService).myFunction,
  })
  class MyService {}
  `,
  // in canActivate guard function in a block
  `
  const myGuard: CanActivateFn = () => {
    return inject(SomeService).isOK;
  };
  `,
  // in canActivate guard function in direct return
  `
  const myGuard: CanActivateFn = () => inject(SomeService).isOK;
  `,
  // in canActivateChild guard function
  `
  const myGuard: CanActivateChildFn = () => {
    return inject(SomeService).isOK;
  };
  `,
  // in canDeactivate guard function
  `
  const myGuard: CanDeactivateFn<MyComponent> = () => {
    return inject(SomeService).isOK;
  };
  `,
  // in canMatch guard function
  `
  const myGuard: CanMatchFn = () => {
    return inject(SomeService).isOK;
  };
  `,
  // in resolver function
  `
  const myResolver: ResolveFn<MyData> = () => {
    return inject(SomeService).data;
  };
  `,
  // in RunGuardsAndResolvers function
  `
  const canRun: RunGuardsAndResolvers = () => inject(SomeService).canRun;
  `,
  // in LoadChildren function
  `
  const children: LoadChildren = () => {
    inject(SomeService);
    return [];
  };
  `,
  // in LoadChildrenCallback function
  `
  const children: LoadChildrenCallback = () => {
    inject(SomeService);
    return [];
  };
  `,
  // in HTTP interceptor function
  `
  export const myInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    inject(SomeService);
    return next(req);
  };
  `,
  // in ViewTransitionsFeatureOptions
  `
  const options: ViewTransitionsFeatureOptions = {
    onViewTransitionCreated: () => {
      inject(SomeService);
    },
  };
  `,
  // in CanActivate guard class
  `
  @Injectable({
    providedIn: 'root',
  })
  export class MyGuard implements CanActivate {
    canActivate(): boolean {
      return inject(SomeService).isOK;
    }
  }
  `,
  // in CanActivateChild guard class
  `
  @Injectable({
    providedIn: 'root',
  })
  export class MyGuard implements CanActivateChild {
    canActivateChild(): boolean {
      return inject(SomeService).isOK;
    }
  }
  `,
  // in CanMatch guard class
  `
  @Injectable({
    providedIn: 'root',
  })
  export class MyGuard implements CanMatch {
    canMatch(): boolean {
      return inject(SomeService).isOK;
    }
  }
  `,
  // in CanDeactivate guard class
  `
  @Injectable({
    providedIn: 'root',
  })
  export class MyGuard implements CanDeactivate<SomeComponent> {
    canDeactivate(): boolean {
      return inject(SomeService).isOK;
    }
  }
  `,
  // in resolver class
  `
  @Injectable({
    providedIn: 'root',
  })
  export class MyGuard implements Resolve<SomeData> {
    resolve(): SomeData {
      return inject(SomeService).data;
    }
  }
  `,
  // in HTTP interceptor class
  `
  @Injectable({
    providedIn: 'root',
  })
  export class MyGuard implements HttpInterceptor {
    intercept(req: HttpRequest<unknown>, next: HttpHandlerFn) {
      inject(SomeService);
      return next(req);
    }
  }
  `,
  // in canActivate guard property in Routes list
  `
  const routes: Routes = [
    { path: 'test', canActivate: [(): boolean => {
      return inject(SomeService).isOK;
    }] },
  ];
  `,
  // in canActivateChild guard property in Routes list
  `
  const routes: Routes = [
    { path: 'test', canActivateChild: [(): boolean => {
      return inject(SomeService).isOK;
    }] },
  ];
  `,
  // in canMatch guard property in Routes list
  `
  const routes: Routes = [
    { path: 'test', canMatch: [(): boolean => {
      return inject(SomeService).isOK;
    }] },
  ];
  `,
  // in canDeactivate guard property in Routes list
  `
  const routes: Routes = [
    { path: 'test', canDeactivate: [(component: SomeComponent): boolean => {
      return inject(SomeService).isOK;
    }] },
  ];
  `,
  // in resolver property in Routes list
  `
  const routes: Routes = [
    { path: 'test', resolve: [(): SomeData => {
      return inject(SomeService).data;
    }] },
  ];
  `,
  // in runGuardsAndResolvers property in Routes list
  `
  const routes: Routes = [
    { path: 'test', runGuardsAndResolvers: [() => inject(SomeService).canRun] },
  ];
  `,
  // in loadChildren property in Routes list
  `
  const routes: Routes = [
    {
      path: 'test',
      loadChildren: () => {
        inject(SomeService);
        return [];
      },
    },
  ];
  `,
  // in redirectTo property in Routes list
  `
  const routes: Routes = [
    {
      path: 'test',
      redirectTo: () => {
        inject(SomeService);
        return '';
      },
    },
  ];
  `,
  // in canActivate guard property in Route object
  `
  const route: Route = {
    path: 'test',
    canActivate: [(): boolean => {
      return inject(SomeService).isOK;
    }],
  };
  `,
  // in manual injection context
  `
  @Injectable({
    providedIn: 'root',
  })
  export class MyService {
    private environmentInjector = inject(EnvironmentInjector);
    someMethod() {
      runInInjectionContext(this.environmentInjector, () => {
        inject(SomeService);
      });
    }
  }
  `,
  // in provideAppInitializer()
  `
  bootstrapApplication(App, {
    providers: [
      provideAppInitializer(() => {
        inject(SomeService);
      }),
    ],
  });
  `,
  // in providePlatformInitializer()
  `
  const platformRef = platformBrowser([
    providePlatformInitializer(() =>  {
      inject(SomeService);
    }),
  ]);
  bootstrapApplication(App, appConfig, { platformRef })
  `,
  // in provideEnvironmentInitializer()
  `
  createEnvironmentInjector(
    [
      provideEnvironmentInitializer(() => {
        inject(SomeService);
      }),
    ],
    parentInjector,
  );
  `,
  // in withViewTransitions()
  `
  bootstrapApplication(App, {
    providers: [
      provideRouter(
        routes,
        withViewTransitions({
          onViewTransitionCreated: () => {
            inject(SomeService);
          },
        }),
      ),
    ],
  });
  `,
  // when asserted
  `
  function customOperator() {
    assertInInjectionContext(customOperator);
    inject(SomeService);
  }
  `,
  // before an await
  `
  const myGuard: CanActivateFn = async () => {
    const someService = inject(SomeService);
    await someAsyncFunction();
    return someService.isOK;
  };
  `,
  // should not trigger on unrelated inject
  `
  TestBed.inject(SomeService);
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in Component ngOnInit',
    annotatedSource: `
      @Component()
      class Test {
        ngOnInit() {
          inject(SomeService);
          ~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in Component ngAfterViewInit',
    annotatedSource: `
      @Component()
      class Test {
        constructor() {}
        ngAfterViewInit() {
          inject(SomeService);
          ~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in Component regular method',
    annotatedSource: `
      @Component()
      class Test {
        anyMethod() {
          inject(SomeService);
          ~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in Directive method',
    annotatedSource: `
      @Directive()
      class Test {
        anyMethod() {
          inject(SomeService);
          ~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in Pipe method',
    annotatedSource: `
      @Pipe()
      class Test {
        anyMethod() {
          inject(SomeService);
          ~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in Service regular method',
    annotatedSource: `
      @Injectable()
      class TestService {
        loadData() {
          inject(SomeService);
          ~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail in constructor class not instantiated by the DI system',
    annotatedSource: `
    class Test {
      constructor() {
        inject(SomeService);
        ~~~~~~~~~~~~~~~~~~~
      }
    }
  `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail in field initializer of a class not instantiated by the DI system',
    annotatedSource: `
    class Test {
      private service = inject(SomeService);
                        ~~~~~~~~~~~~~~~~~~~
    }
  `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail in constructor if inside an arrow callback with block',
    annotatedSource: `
      @Component()
      class Test {
        constructor() {
          someFunction(() => {
            inject(SomeService);
            ~~~~~~~~~~~~~~~~~~~
          });
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail in constructor if inside an arrow callback with direct return',
    annotatedSource: `
      @Component()
      class Test {
        constructor() {
          someFunction(() => inject(SomeService));
                             ~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail in field initializer if inside an arrow callback with block',
    annotatedSource: `
      @Component()
      class Test {
        private service = someFunction(() => {
          inject(SomeService);
          ~~~~~~~~~~~~~~~~~~~
        });
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail in field initializer if inside an arrow callback with direct return',
    annotatedSource: `
      @Component()
      class Test {
        private service = someFunction(() => inject(SomeService));
                                             ~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail in a special function with injection context if inside a callback',
    annotatedSource: `
    const myGuard: CanActivateFn = () => {
      someFunction(() => {
        inject(SomeService);
        ~~~~~~~~~~~~~~~~~~~
      });
      return true;
    };
  `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail after an await',
    annotatedSource: `
    const myGuard: CanActivateFn = async () => {
      await someAsyncFunction();
      return inject(SomeService).isOK;
             ~~~~~~~~~~~~~~~~~~~
    };
  `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail in a function which is not a special function with injection context',
    annotatedSource: `
    const myFunction: TestFn = () => {
      inject(SomeService);
      ~~~~~~~~~~~~~~~~~~~
    }
  `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail in a special method but not inside the according class',
    annotatedSource: `
    @Injectable({
      providedIn: 'root',
    })
    class MyService {
      canActivate(): boolean {
        return inject(SomeService).isOK;
               ~~~~~~~~~~~~~~~~~~~
      }
    }
  `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in a special property but not inside a route',
    annotatedSource: `
    const test = {
      canActivate: [(): boolean => {
        return inject(SomeService).isOK;
               ~~~~~~~~~~~~~~~~~~~
      }],
    };
  `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if in a factory property which is not in an InjectionToken',
    annotatedSource: `
    const myObject = {
      factory: () => inject(SomeService),
                     ~~~~~~~~~~~~~~~~~~~
    };
  `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if in a useFactory property which is not a provider',
    annotatedSource: `
    const myObject = {
      useFactory: () => inject(SomeService),
                        ~~~~~~~~~~~~~~~~~~~
    };
  `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in runInInjectionContext if in a callback',
    annotatedSource: `
    @Injectable({
      providedIn: 'root',
    })
    export class MyService {
      someMethod() {
        runInInjectionContext(this.environmentInjector, () => {
          someFunction(() => {
            inject(SomeService);
            ~~~~~~~~~~~~~~~~~~~
          });
        });
      }
    }
  `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail in a function which is not runInInjectionContext or another special function',
    annotatedSource: `
    @Injectable({
      providedIn: 'root',
    })
    export class MyService {
      someMethod() {
        someFunction(() => {
          inject(SomeService);
          ~~~~~~~~~~~~~~~~~~~
        });
      }
    }
  `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail in global scope',
    annotatedSource: `
    inject(SomeService);
    ~~~~~~~~~~~~~~~~~~~
  `,
    messageId,
  }),
];
