import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-output-on-prefix';
import rule, { RULE_NAME } from '../../src/rules/no-output-on-prefix';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});
const messageId: MessageIds = 'noOutputOnPrefix';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Page({
      outputs: ['on', onChange, \`onLine\`, 'on: on2', 'offline: on', ...onCheck, onOutput()],
    })
    class Test {}
    `,
    `
    @Component()
    class Test {
      on = new EventEmitter();
    }
    `,
    `
    @Directive()
    class Test {
      @Output() buttonChange = new EventEmitter<'on'>();
    }
    `,
    `
    @Component()
    class Test {
      @Output() On = new EventEmitter<{ on: onType }>();
    }
    `,
    `
    @Directive()
    class Test {
      @Output(\`one\`) ontype = new EventEmitter<{ bar: string, on: boolean }>();
    }
    `,
    `
    @Component()
    class Test {
      @Output('oneProp') common = new EventEmitter<ComplextOn>();
    }
    `,
    `
    @Directive()
    class Test<On> {
      @Output() ON = new EventEmitter<On>();
    }
    `,
    `
    const on = 'on';
    @Component()
    class Test {
      @Output(on) touchMove: EventEmitter<{ action: 'on' | 'off' }> = new EventEmitter<{ action: 'on' | 'off' }>();
    }
    `,
    `
    const test = 'on';
    const on = 'on';
    @Directive()
    class Test {
      @Output(test) [on]: EventEmitter<OnTest>;
    }
    `,
    `
    @Component({
      selector: 'foo',
      outputs: [\`test: ${'foo'}\`]
    })
    class Test {}
    `,
    `
    @Directive({
      selector: 'foo',
    })
    class Test {
      @Output() get 'getter'() {}
    }
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if output metadata property is named "on" in `@Component`',
      annotatedSource: `
        @Component({
          outputs: ['on']
                    ~~~~
        })
        class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if output metadata property is aliased as "on" in `@Directive`',
      annotatedSource: `
        @Directive({
          inputs: [onCredit],
          outputs: [onLevel, \`test: on\`, onFunction()],
                             ~~~~~~~~~~
        })
        class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if output metadata property is named "onTest" in `@Component`',
      annotatedSource: `
        @Component({
          outputs: ['onTest: test', ...onArray],
                    ~~~~~~~~~~~~~~
        })
        class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if output property is named "on" in `@Directive`',
      annotatedSource: `
        @Directive()
        class Test {
          @Output() on: EventEmitter<any> = new EventEmitter<{}>();
                    ~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if output property is named with "\'on\'" prefix in `@Component`',
      annotatedSource: `
        @Component()
        class Test {
          @Output() @Custom('on') 'onPrefix' = new EventEmitter<void>();
                                  ~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if output property is aliased as "`on`" in `@Directive`',
      annotatedSource: `
        @Directive()
        class Test {
          @Custom() @Output(\`on\`) _on = getOutput();
                            ~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if output property is aliased with "on" prefix in `@Component`',
      annotatedSource: `
        @Component()
        class Test {
          @Output('onPrefix') _on = (this.subject$ as Subject<{on: boolean}>).pipe();
                  ~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if output getter is named with "on" prefix in `@Directive`',
      annotatedSource: `
        @Directive()
        class Test {
          @Output('getter') get 'on-getter'() {}
                                ~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if output getter is aliased with "on" prefix in `@Component`',
      annotatedSource: `
        @Component()
        class Test {
          @Output(\`${'onGetter'}\`) get getter() {}
                  ~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if output property is named with prefix "on" and aliased as "on" without `@Component` or `@Directive`',
      annotatedSource: `
        @Injectable()
        class Test {
          @Output('on') onPrefix = this.getOutput();
                  ~~~~  ^^^^^^^^
        }
      `,
      messages: [
        { char: '~', messageId },
        { char: '^', messageId },
      ],
    }),
  ],
});
