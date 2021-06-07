import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-output-native';
import rule, { RULE_NAME } from '../../src/rules/no-output-native';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});
const messageId: MessageIds = 'noOutputNative';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Component()
    class Test {
      change = new EventEmitter();
    }
    `,
    `
    @Directive()
    class Test {
      @Output() buttonChange = new EventEmitter<'change'>();
    }
    `,
    // https://github.com/angular-eslint/angular-eslint/issues/523
    `
    @Component()
    class Test {
      @Output() Drag = new EventEmitter<{ click: string }>();
    }
    `,
    // https://github.com/angular-eslint/angular-eslint/issues/523
    `
    @Directive()
    class Test {
      @Output(\`changelower\`) changeText = new EventEmitter<{ bar: string, blur: string }>();
    }
    `,
    `
    @Component()
    class Test {
      @Output('buttonChange') changelower = new EventEmitter<ComplextObject>();
    }
    `,
    `
    @Directive()
    class Test<SVGScroll> {
      @Output() SVgZoom = new EventEmitter<SVGScroll>();
    }
    `,
    `
    const change = 'change';
    @Component()
    class Test {
      @Output(change) touchMove: EventEmitter<{ action: 'click' | 'close' }> = new EventEmitter<{ action: 'click' | 'close' }>();
    }
    `,
    `
    const blur = 'blur';
    const click = 'click';
    @Directive()
    class Test {
      @Output(blur) [click]: EventEmitter<Blur>;
    }
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if output property is named "change" in `@Component`',
      annotatedSource: `
        @Component()
        class Test {
          @Output() change: EventEmitter<any> = new EventEmitter<{}>();
                    ~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if output property is named "\'change\'" in `@Directive`',
      annotatedSource: `
        @Directive()
        class Test {
          @Output() @Custom('change') 'change' = new EventEmitter<void>();
                                      ~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if output property is aliased as "`change`" in `@Component`',
      annotatedSource: `
        @Component()
        class Test {
          @Custom() @Output(\`change\`) _change = getOutput();
                            ~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if output property is aliased as "change" in `@Directive`',
      annotatedSource: `
        @Directive()
        class Test {
          @Output('change') _change = (this.subject$ as Subject<{blur: boolean}>).pipe();
                  ~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if output property is named "blur" and aliased as "click" without `@Component` or `@Directive`',
      annotatedSource: `
        @Injectable()
        class Test {
          @Output('click') blur = this.getOutput();
                  ~~~~~~~  ^^^^
        }
      `,
      messages: [
        { char: '~', messageId },
        { char: '^', messageId },
      ],
    }),
  ],
});
