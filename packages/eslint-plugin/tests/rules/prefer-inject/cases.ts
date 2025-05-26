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
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'basic constructor injection',
    annotatedSource: `
      @Injectable()
      class UserService {
        constructor(private http: HttpClient) {}
                    ~~~~~~~~~~~~~~~~~~~~~~~~~
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
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          private http: HttpClient
          ^^^^^^^^^^^^^^^^^^^^^
        ) {}
      }
    `,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'with injection decorators',
    annotatedSource: `
      @Injectable()
      class ConfigService {
        constructor(
          @Inject(CONFIG_TOKEN) private config: AppConfig,
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          @Optional() private logger?: LoggerService
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        ) {}
      }
    `,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
    ],
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
                    ~~~~~~~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
  }),
];
