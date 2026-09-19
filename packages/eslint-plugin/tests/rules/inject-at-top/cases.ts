import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/inject-at-top';

const messageId: MessageIds = 'injectAtTop';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // should ignore classes without an Angular decorator
  `
  class PlainClass {
    private get userName() {
      return this.userService.name;
    }
    private readonly userService = inject(UserService);
  }
  `,
  // should pass when inject() is the first member
  `
  @Component({})
  class MyComponent {
    private readonly userService = inject(UserService);

    protected readonly pageTitle = \`Dashboard \${this.fullName}\`;

    private get fullName() {
      return \`\${this.userService.firstName} \${this.userService.lastName}\`.trim();
    }
  }
  `,
  // should pass when every inject() call is grouped at the top
  `
  @Injectable()
  class MyService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly config = inject(CONFIG_TOKEN);

    doThing() {}
  }
  `,
  // should pass when the class does not use inject() at all
  `
  @Component({})
  class MyComponent {
    private value = 42;
    private get doubled() {
      return this.value * 2;
    }
  }
  `,
  // should pass when inject() is called with an options argument
  `
  @Directive({})
  class MyDirective {
    private readonly optional = inject(SOME_TOKEN, { optional: true });
    foo() {}
  }
  `,
  // should allow static members declared above inject()
  `
  @Pipe({ name: 'x' })
  class MyPipe {
    static readonly DEFAULT = 'default';
    private readonly myService = inject(MyService);
  }
  `,
  // should pass when inject() is the first member of an @Service class
  `
  @Service()
  class UserService {
    private readonly http = inject(HttpClient);

    private get baseUrl() {
      return this.http.baseUrl;
    }
  }
  `,
  // should ignore inject() buried inside an arrow callback stored as a field (lazy)
  `
  @Component({})
  class MyComponent {
    private readonly count = 0;
    private readonly userServiceFactory = () => inject(UserService);
  }
  `,
  // should ignore inject() buried inside a method body (lazy)
  `
  @Injectable()
  class MyService {
    private value = 0;
    build() {
      return inject(HttpClient);
    }
  }
  `,
  // should ignore inject() buried inside a function expression stored as a field (lazy)
  `
  @Directive({})
  class MyDirective {
    private flag = false;
    private readonly userServiceFactory = function () { return inject(UserService); };
  }
  `,
  // should pass when a ConditionalExpression containing inject() is the first member
  `
  @Component({})
  class MyComponent {
    private readonly strategy = cond ? inject(PrimaryStrategy) : inject(FallbackStrategy);
    private count = 0;
  }
  `,
  // should pass when a LogicalExpression containing inject() is the first member
  `
  @Component({})
  class MyComponent {
    private readonly logger = inject(LoggerService, { optional: true }) ?? noopLogger;
    private count = 0;
  }
  `,
  // should pass when a TSNonNullExpression containing inject() is the first member
  `
  @Component({})
  class MyComponent {
    private readonly config = inject(AppConfig, { optional: true })!;
    private count = 0;
  }
  `,
  // should pass when a TSAsExpression containing inject() is the first member
  `
  @Component({})
  class MyComponent {
    private readonly featureFlags = inject(FlagsService) as FeatureFlags;
    private count = 0;
  }
  `,
  // should pass when a wrapping CallExpression containing inject() is the first member
  `
  @Component({})
  class MyComponent {
    private readonly tracedHttp = withTracing(inject(HttpClient));
    private count = 0;
  }
  `,
  // should pass when a NewExpression containing inject() is the first member
  `
  @Component({})
  class MyComponent {
    private readonly apiClient = new ApiClient(inject(HttpClient));
    private count = 0;
  }
  `,
  // should pass when an ArrayExpression containing inject() is the first member
  `
  @Component({})
  class MyComponent {
    private readonly handlers = [inject(HandlerA), inject(HandlerB)];
    private count = 0;
  }
  `,
  // should pass when an ObjectExpression containing inject() is the first member
  `
  @Component({})
  class MyComponent {
    private readonly deps = { users: inject(UserService) };
    private count = 0;
  }
  `,
  // should pass when a SequenceExpression containing inject() is the first member
  `
  @Component({})
  class MyComponent {
    private readonly userService = (audit(), inject(UserService));
    private count = 0;
  }
  `,
  // should pass when a TemplateLiteral containing inject() is the first member
  `
  @Component({})
  class MyComponent {
    private readonly currentUserId = \`\${inject(UserService).id}\`;
    private count = 0;
  }
  `,
  // should pass when an IIFE containing inject() is the first member
  `
  @Component({})
  class MyComponent {
    private readonly client = (() => inject(ApiClient))();
    private count = 0;
  }
  `,
  // should ignore inject() wrapped behind a lazy arrow even when nested in another shape
  `
  @Component({})
  class MyComponent {
    private count = 0;
    private readonly strategyFactory = () => (cond ? inject(PrimaryStrategy) : inject(FallbackStrategy));
  }
  `,
  // should ignore inject() inside an arrow that is passed as a CallExpression argument (not callee)
  `
  @Component({})
  class MyComponent {
    private count = 0;
    private readonly userServiceFactory = withFactory(() => inject(UserService));
  }
  `,
  // should ignore inject() inside a function expression that is passed as a NewExpression argument
  `
  @Component({})
  class MyComponent {
    private count = 0;
    private readonly apiClient = new ApiClient(function () { return inject(HttpClient); });
  }
  `,
  // should ignore inject() inside an arrow body that itself contains nested wrappers
  `
  @Component({})
  class MyComponent {
    private count = 0;
    private readonly handlersFactory = () => collectHandlers([inject(HandlerA), inject(HandlerB)]);
  }
  `,
  // should ignore a custom inject function which is not listed in additionalInjectFunctions
  `
  @Component({})
  class MyComponent {
    private count = 0;
    private readonly t = injectTranslations();
  }
  `,
  // should pass when a listed custom inject function is at the top
  {
    code: `
    @Component({})
    class MyComponent {
      private readonly t = injectTranslations();
      private count = 0;
    }
    `,
    options: [{ additionalInjectFunctions: ['injectTranslations'] }],
  },
  // should pass when custom inject functions matched by a regex are grouped at the top
  {
    code: `
    @Injectable()
    class MyService {
      private readonly http = inject(HttpClient);
      private readonly t = injectTranslations();
      private readonly flags = injectFeatureFlags();

      doThing() {}
    }
    `,
    options: [{ additionalInjectFunctions: ['inject[A-Z].*'] }],
  },
  // should not treat a function whose name merely starts with a listed name as an inject function
  {
    code: `
    @Component({})
    class MyComponent {
      private count = 0;
      private readonly t = injectTranslationsLater();
    }
    `,
    options: [{ additionalInjectFunctions: ['injectTranslations'] }],
  },
  // should ignore a listed custom inject function inside a factory
  {
    code: `
    @Component({})
    class MyComponent {
      private count = 0;
      private readonly translationsFactory = () => injectTranslations();
    }
    `,
    options: [{ additionalInjectFunctions: ['injectTranslations'] }],
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when inject() is declared below a getter that reads the injected service',
    annotatedSource: `
      @Component({})
      class MyComponent {
        protected readonly pageTitle = \`Dashboard \${this.fullName}\`;

        private get fullName() {
          return \`\${this.userService.firstName} \${this.userService.lastName}\`.trim();
        }

        private readonly userService = inject(UserService);
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when inject() is declared below a regular property',
    annotatedSource: `
      @Injectable()
      class MyService {
        private count = 0;
        private readonly http = inject(HttpClient);
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when inject() is declared below a method',
    annotatedSource: `
      @Directive({})
      class MyDirective {
        doThing() {}

        private readonly myService = inject(MyService);
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when inject() is declared below the constructor',
    annotatedSource: `
      @Component({})
      class MyComponent {
        constructor() {}

        private readonly myService = inject(MyService);
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a second inject() is separated from the first by another property',
    annotatedSource: `
      @Injectable()
      class MyService {
        private readonly http = inject(HttpClient);
        private count = 0;
        private readonly router = inject(Router);
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should report every inject() that appears below another class member',
    annotatedSource: `
      @Component({})
      class MyComponent {
        protected readonly pageTitle = \`Dashboard \${this.fullName}\`;

        private get fullName() {
          return \`\${this.userService.firstName} \${this.userService.lastName}\`.trim();
        }

        private readonly userService = inject(UserService);
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        private readonly router = inject(Router);
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      }
    `,
    messages: [
      { char: '~', messageId, data: { functionName: 'inject' } },
      { char: '^', messageId, data: { functionName: 'inject' } },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when inject() is hidden inside a ConditionalExpression',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly strategy = cond ? inject(PrimaryStrategy) : inject(FallbackStrategy);
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when inject() is hidden inside a LogicalExpression',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly logger = inject(LoggerService, { optional: true }) ?? noopLogger;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when inject() is hidden inside a TSNonNullExpression',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly config = inject(AppConfig, { optional: true })!;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when inject() is hidden inside a TSAsExpression',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly featureFlags = inject(FlagsService) as FeatureFlags;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when inject() is hidden inside a wrapping CallExpression',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly tracedHttp = withTracing(inject(HttpClient));
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when inject() is hidden inside a NewExpression',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly apiClient = new ApiClient(inject(HttpClient));
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when inject() is hidden inside an ArrayExpression',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly handlers = [inject(HandlerA), inject(HandlerB)];
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when inject() is hidden inside an ObjectExpression',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly deps = { users: inject(UserService) };
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when inject() is hidden inside a SequenceExpression',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly userService = (audit(), inject(UserService));
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when inject() is hidden inside a TemplateLiteral',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly currentUserId = \`\${inject(UserService).id}\`;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when inject() is hidden inside an immediately-invoked function expression',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly client = (() => inject(ApiClient))();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when inject() is nested across multiple wrapping shapes',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly services = collectServices([inject(UserService), { router: inject(Router) }]);
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when an IIFE uses a function expression that contains inject()',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly legacyClient = (function () { return inject(ApiClient); })();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when an IIFE wraps inject() inside another expression',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly tracedClient = (() => withTracing(inject(ApiClient)))();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when inject() is declared below a member in an @Service class',
    annotatedSource: `
      @Service()
      class UserService {
        private get baseUrl() {
          return this.http.baseUrl;
        }

        private readonly http = inject(HttpClient);
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    data: { functionName: 'inject' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a listed custom inject function is declared below another member',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly t = injectTranslations();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    options: [{ additionalInjectFunctions: ['injectTranslations'] }],
    data: { functionName: 'injectTranslations' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a custom inject function matched by a regex is declared below another member',
    annotatedSource: `
      @Injectable()
      class MyService {
        private readonly http = inject(HttpClient);
        private count = 0;
        private readonly flags = injectFeatureFlags();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    options: [{ additionalInjectFunctions: ['inject[A-Z].*'] }],
    data: { functionName: 'injectFeatureFlags' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a listed custom inject function is wrapped in another expression',
    annotatedSource: `
      @Component({})
      class MyComponent {
        private count = 0;
        private readonly t = withScope(injectTranslations());
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    options: [{ additionalInjectFunctions: ['injectTranslations'] }],
    data: { functionName: 'injectTranslations' },
  }),
];
