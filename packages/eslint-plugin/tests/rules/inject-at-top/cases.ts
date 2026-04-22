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
      { char: '~', messageId },
      { char: '^', messageId },
    ],
  }),
];
