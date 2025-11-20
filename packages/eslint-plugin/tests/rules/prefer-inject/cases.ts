import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/prefer-inject';

const messageId: MessageIds = 'preferInject';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // Non Angular class
  `
  class PlainClass {
    constructor(private value: string) {}
  }
  `,
  // Using inject()
  `
  @Injectable()
  class UserService {
    private http = inject(HttpClient);
  }
  `,
  // Empty constructor
  `
  @Component({})
  class MyComponent {
    constructor() {}
  }
  `,
  // Constructor only calling super
  `
  @Component({})
  class MyComponent extends BaseComponent {
    constructor() {
      super();
    }
  }
  `,
  // Primitive parameter without @Inject
  `
  @Injectable()
  class Logger {
    constructor(level: string) {}
  }
  `,
  `
  @Injectable()
  class Logger {
    constructor(public level: string) {}
  }
  `,
  `
  @Injectable()
  class Foo {
    constructor(foo: any, bar: unknown) {}
  }
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'basic constructor injection',
    annotatedSource: `
      @Injectable()
      class UserService {
        constructor(private http: HttpClient) {}
                    ~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'multiple dependencies',
    annotatedSource: `
      @Component({})
      class MyComponent {
        constructor(
          private userService: UserService,
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          private http: HttpClient
          ^^^^^^^^^^^^^^^^^^^^^^^^
        ) {}
      }
    `,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'with @Inject decorator',
    annotatedSource: `
      @Injectable()
      class ConfigService {
        constructor(
          @Inject(CONFIG_TOKEN) private config: AppConfig,
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        ) {}
      }
    `,
    messages: [{ char: '~', messageId }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'with @Optional decorator',
    annotatedSource: `
      @Injectable()
      class ConfigService {
        constructor(
          @Optional() private logger?: LoggerService,
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        ) {}
      }
    `,
    messages: [{ char: '~', messageId }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'with @Self decorator',
    annotatedSource: `
      @Injectable()
      class ConfigService {
        constructor(
          @Self() private control: NgControl,
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        ) {}
      }
    `,
    messages: [{ char: '~', messageId }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'with @SkipSelf decorator',
    annotatedSource: `
      @Injectable()
      class ConfigService {
        constructor(
          @SkipSelf() private skipSelfService: SkipSelfService,
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        ) {}
      }
    `,
    messages: [{ char: '~', messageId }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'with @Host decorator',
    annotatedSource: `
      @Injectable()
      class ConfigService {
        constructor(
          @Host() private hostService: HostService,
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        ) {}
      }
    `,
    messages: [{ char: '~', messageId }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'with multiple injection decorators',
    annotatedSource: `
      @Injectable()
      class ConfigService {
        constructor(
          @Inject(CONFIG_TOKEN) private config: AppConfig,
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          @Optional() @Self() private logger?: LoggerService,
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        ) {}
      }
    `,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'primitive parameter with @Inject decorator',
    annotatedSource: `
      @Injectable()
      class WithPrimitiveToken {
        constructor(@Inject(LEVEL_TOKEN) public level: string) {}
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'mixed with super call',
    annotatedSource: `
      @Component({})
      class MyComponent extends BaseComponent {
        constructor(
          private service: MyService,
          ~~~~~~~~~~~~~~~~~~~~~~~~~~
        ) {
          super();
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'class with non-primitive parameter',
    annotatedSource: `
      @Component({})
      class MyComponent {
        constructor(elementRef: ElementRef) {}
                    ~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
  }),
];
