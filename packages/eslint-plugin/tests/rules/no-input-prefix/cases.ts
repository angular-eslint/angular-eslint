import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/no-input-prefix';

const messageId: MessageIds = 'noInputPrefix';

export const valid = [
  {
    code: `class Test {}`,
    options: [{ prefixes: ['on'] }],
  },
  {
    code: `
      @Page({
        inputs: ['on', onChange, \`onLine\`, 'on: on2', 'offline: on', ...onCheck, onInput()],
      })
      class Test {}
    `,
    options: [{ prefixes: ['on'] }],
  },
  {
    code: `
      @Component()
      class Test {
        on = new EventEmitter();
      }
    `,
    options: [{ prefixes: ['on'] }],
  },
  {
    code: `
      @Directive()
      class Test {
        @Input() buttonChange = new EventEmitter<'on'>();
      }
    `,
    options: [{ prefixes: ['on'] }],
  },
  {
    code: `
      @Component()
      class Test {
        @Input() On = new EventEmitter<{ on: onType }>();
      }
    `,
    options: [{ prefixes: ['on'] }],
  },
  {
    code: `
      @Directive()
      class Test {
        @Input(\`one\`) ontype = new EventEmitter<{ bar: string, on: boolean }>();
      }
    `,
    options: [{ prefixes: ['on'] }],
  },
  // Angular 16+ alias metadata property: https://github.com/angular-eslint/angular-eslint/issues/1355
  {
    code: `
      @Directive()
      class Test {
        @Input({ alias: \`one\` }) ontype = new EventEmitter<{ bar: string, on: boolean }>();
      }
    `,
    options: [{ prefixes: ['on'] }],
  },
  {
    code: `
      @Component()
      class Test {
        @Input('oneProp') common = new EventEmitter<ComplextOn>();
      }
    `,
    options: [{ prefixes: ['on'] }],
  },
  // Angular 16+ alias metadata property: https://github.com/angular-eslint/angular-eslint/issues/1355
  {
    code: `
      @Component()
      class Test {
        @Input({ alias: 'oneProp' }) common = new EventEmitter<ComplextOn>();
      }
    `,
    options: [{ prefixes: ['on'] }],
  },
  {
    code: `
      @Directive()
      class Test<On> {
        @Input() ON = new EventEmitter<On>();
      }
    `,
    options: [{ prefixes: ['on'] }],
  },
  {
    code: `
      const on = 'on';
      @Component()
      class Test {
        @Input(on) touchMove: EventEmitter<{ action: 'on' | 'off' }> = new EventEmitter<{ action: 'on' | 'off' }>();
      }
    `,
    options: [{ prefixes: ['on'] }],
  },
  {
    code: `
      const test = 'on';
      const on = 'on';
      @Directive()
      class Test {
        @Input(test) [on]: EventEmitter<OnTest>;
      }
    `,
    options: [{ prefixes: ['on'] }],
  },
  `
    @Component({
      selector: 'foo',
      'inputs': [\`test: ${'foo'}\`]
    })
    class Test {}
  `,
  `
    @Directive({
      selector: 'foo',
      ['inputs']: [\`test: ${'foo'}\`]
    })
    class Test {}
  `,
  `
    @Component({
      selector: 'foo',
      [\`inputs\`]: [\`test: ${'foo'}\`]
    })
    class Test {}
  `,
  `
    @Directive({
      selector: 'foo',
    })
    class Test {
      @Input() set 'setter'() {}
    }
  `,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `inputs` metadata property is named "on" in `@Component`',
    annotatedSource: `
      @Component({
        inputs: ['on']
                 ~~~~
      })
      class Test {}
    `,
    messageId,
    options: [{ prefixes: ['on'] }],
    data: { prefixes: '"on"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `inputs` metadata property is `Literal` and aliased as "on" in `@Directive`',
    annotatedSource: `
      @Directive({
        outputs: [onCredit],
        'inputs': [onLevel, \`test: on\`, onFunction()],
                            ~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
    options: [{ prefixes: ['on'] }],
    data: { prefixes: '"on"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `inputs` metadata property is computed `Literal` and named "onTest" in `@Component`',
    annotatedSource: `
        @Component({
          ['inputs']: ['onTest: test', ...onArray],
                       ~~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId,
    options: [{ prefixes: ['on'] }],
    data: { prefixes: '"on"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `inputs` metadata property is computed `TemplateLiteral` and named "onTest" in `@Directive`',
    annotatedSource: `
        @Directive({
          [\`inputs\`]: ['onTest: test', ...onArray],
                       ~~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId,
    options: [{ prefixes: ['on'] }],
    data: { prefixes: '"on"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if input property is named "on" in `@Component`',
    annotatedSource: `
        @Component()
        class Test {
          @Input() on: EventEmitter<any> = new EventEmitter<{}>();
                   ~~
        }
      `,
    messageId,
    options: [{ prefixes: ['on'] }],
    data: { prefixes: '"on"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input property is named with "\'on\'" prefix in `@Directive`',
    annotatedSource: `
        @Directive()
        class Test {
          @Input() @Custom('on') 'onPrefix' = new EventEmitter<void>();
                                 ~~~~~~~~~~
        }
      `,
    messageId,
    options: [{ prefixes: ['on'] }],
    data: { prefixes: '"on"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input property is aliased as "`on`" in `@Component`',
    annotatedSource: `
        @Component()
        class Test {
          @Custom() @Input(\`on\`) _on = getInput();
                           ~~~~
        }
      `,
    messageId,
    options: [{ prefixes: ['on'] }],
    data: { prefixes: '"on"' },
  }),
  // Angular 16+ alias metadata property: https://github.com/angular-eslint/angular-eslint/issues/1355
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input property is aliased (using metadata) as "`on`" in `@Component`',
    annotatedSource: `
        @Component()
        class Test {
          @Custom() @Input({ required: true, alias: \`on\` }) _on = getInput();
                                                    ~~~~
        }
      `,
    messageId,
    options: [{ prefixes: ['on'] }],
    data: { prefixes: '"on"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input property is aliased with "on" prefix in `@Directive`',
    annotatedSource: `
        @Directive()
        class Test {
          @Input('onPrefix') _on = (this.subject$ as Subject<{on: boolean}>).pipe();
                 ~~~~~~~~~~
        }
      `,
    messageId,
    options: [{ prefixes: ['on'] }],
    data: { prefixes: '"on"' },
  }),
  // Angular 16+ alias metadata property: https://github.com/angular-eslint/angular-eslint/issues/1355
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input property is aliased (using metadata) with "on" prefix in `@Directive`',
    annotatedSource: `
        @Directive()
        class Test {
          @Input({ alias: 'onPrefix', required: true }) _on = (this.subject$ as Subject<{on: boolean}>).pipe();
                          ~~~~~~~~~~
        }
      `,
    messageId,
    options: [{ prefixes: ['on'] }],
    data: { prefixes: '"on"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input setter is named with "on" prefix in `@Component`',
    annotatedSource: `
        @Component()
        class Test {
          @Input('setter') set 'on-setter'() {}
                               ~~~~~~~~~~~
        }
      `,
    messageId,
    options: [{ prefixes: ['on'] }],
    data: { prefixes: '"on"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input setter is aliased with "on" prefix in `@Directive`',
    annotatedSource: `
        @Directive()
        class Test {
          @Input(\`${'onSetter'}\`) set setter() {}
                 ~~~~~~~~~~
        }
      `,
    messageId,
    options: [{ prefixes: ['on'] }],
    data: { prefixes: '"on"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input property is named with prefix "on" and aliased as "on" without `@Component` or `@Directive`',
    annotatedSource: `
        @Injectable()
        class Test {
          @Input('on') isPrefix = this.getInput();
                 ~~~~  ^^^^^^^^
        }
      `,
    messages: [
      { char: '~', messageId, data: { prefixes: '"on", "is" or "should"' } },
      { char: '^', messageId, data: { prefixes: '"on", "is" or "should"' } },
    ],
    options: [{ prefixes: ['on', 'is', 'should'] }],
  }),
];
