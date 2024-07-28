import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/no-output-native';

const messageId: MessageIds = 'noOutputNative';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `class Test {}`,
  `
    @Page({
      outputs: ['play', popstate, \`online\`, 'obsolete: obsol', 'store: storage'],
    })
    class Test {}
    `,
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
  `
    @Component({
      selector: 'foo',
      'outputs': [\`test: ${'foo'}\`]
    })
    class Test {}
    `,
  `
    @Directive({
      selector: 'foo',
      ['outputs']: [\`test: ${'foo'}\`]
    })
    class Test {}
    `,
  `
    @Component({
      'selector': 'foo',
      [\`outputs\`]: [\`test: ${'foo'}\`]
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
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `outputs` metadata property is `Literal` and named "pagehide" in `@Component`',
    annotatedSource: `
        @Component({
          'outputs': ['pagehide']
                      ~~~~~~~~~~
        })
        class Test {}
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `outputs` metadata property is computed `Literal` and aliased as "copy" in `@Directive`',
    annotatedSource: `
        @Directive({
          inputs: ['abort'],
          ['outputs']: [boundary, \`test: copy\`],
                                  ~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `outputs` metadata property is computed `TemplateLiteral` and aliased as "copy" in `@Component`',
    annotatedSource: `
        @Component({
          inputs: ['abort'],
          [\`outputs\`]: [boundary, \`test: copy\`],
                                  ~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `outputs` metadata property is named "orientationchange" in `@Directive`',
    annotatedSource: `
        @Directive({
          outputs: ['orientationchange: orientation'],
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId,
  }),
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
      'should fail if output getter is named "\'cut\'" in `@Component`',
    annotatedSource: `
        @Component()
        class Test {
          @Output('getter') get 'cut'() {}
                                ~~~~~
        }
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if output getter is aliased as "devicechange" in `@Directive`',
    annotatedSource: `
        @Directive()
        class Test {
          @Output(\`${'devicechange'}\`) get getter() {}
                  ~~~~~~~~~~~~~~
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
];
