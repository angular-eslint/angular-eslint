import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/no-output-rename';

const messageId: MessageIds = 'noOutputRename';
const suggestRemoveAliasName: MessageIds = 'suggestRemoveAliasName';
const suggestReplaceOriginalNameWithAliasName: MessageIds =
  'suggestReplaceOriginalNameWithAliasName';

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
  `
    @Component({
      outputs,
    })
    class Test {}
    `,
  `
    @Directive({
      outputs: [...test],
    })
    class Test {}
    `,
  `
    @Component({
      outputs: func(),
    })
    class Test {}
    `,
  `
    @Directive({
      outputs: [func(), 'a'],
    })
    class Test {}
    `,
  `
    @Component({})
    class Test {
      @Output() get getter() {}
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
      selector: 'foo[bar]'
    })
    class Test {
      @Output() bar: string;
    }
    `,
  `
    @Directive({
      'selector': 'foo',
      'outputs': [\`test: ${'foo'}\`]
    })
    class Test {}
    `,
  `
    @Component({
      'selector': 'foo',
      ['outputs']: [\`test: ${'foo'}\`]
    })
    class Test {}
    `,
  `
    @Directive({
      'selector': 'foo',
      [\`outputs\`]: [\`test: ${'foo'}\`]
    })
    class Test {}
    `,
  `
    @Component({
      selector: '[foo], test',
    })
    class Test {
      @Output('foo') label: string;
    }
    `,
  /**
   * Renaming outputs when using the directive composition API is not a bad practice
   * https://angular.dev/guide/directives/directive-composition-api
   */
  `
    @Component({
      selector: 'foo',
      hostDirectives: [{
        directive: CdkMenuItem,
        outputs: ['cdkMenuItemTriggered: triggered'],
      }]
    })
    class Test {}
  `,
  `
    @Component({
      selector: 'foo',
      'hostDirectives': [{
        directive: CdkMenuItem,
        outputs: ['cdkMenuItemTriggered: triggered'],
      }]
    })
    class Test {}
  `,
  `
    @Component({
      selector: 'foo',
      ['hostDirectives']: [{
        directive: CdkMenuItem,
        outputs: ['cdkMenuItemTriggered: triggered'],
      }]
    })
    class Test {}
  `,
  `
    @Directive({
      selector: 'foo'
    })
    class Test {
      @Output('fooMyColor') myColor: string;
    }
    `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `outputs` metadata property is aliased in `@Component`',
    annotatedSource: `
        @Component({
          outputs: ['a: b']
                    ~~~~~~
        })
        class Test {}
      `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'a'],
        [suggestReplaceOriginalNameWithAliasName, 'b'],
      ] as const
    ).map(([messageId, name]) => ({
      messageId,
      output: `
        @Component({
          outputs: ['${name}']
                    
        })
        class Test {}
      `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `outputs` metadata property is `Literal` and aliased in `@Directive`',
    annotatedSource: `
        @Directive({
          inputs: ['abort'],
          'outputs': [boundary, \`test: copy\`],
                                ~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'test'],
        [suggestReplaceOriginalNameWithAliasName, 'copy'],
      ] as const
    ).map(([messageId, name]) => ({
      messageId,
      output: `
        @Directive({
          inputs: ['abort'],
          'outputs': [boundary, \`${name}\`],
                                
        })
        class Test {}
      `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `outputs` metadata property is computed `Literal` and aliased with the same name in `@Component`',
    annotatedSource: `
        @Component({
          ['outputs']: ['orientation: orientation'],
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId,
    annotatedOutput: `
        @Component({
          ['outputs']: ['orientation'],
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `outputs` metadata property is computed `TemplateLiteral` and aliased with the same name in `@Directive`',
    annotatedSource: `
        @Directive({
          [\`outputs\`]: ['orientation: orientation'],
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId,
    annotatedOutput: `
        @Directive({
          [\`outputs\`]: ['orientation'],
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if output property is aliased with backticks',
    annotatedSource: `
        @Component()
        class Test {
          @Custom() @Output(\`change\`) _change = getOutput();
                            ~~~~~~~~
        }
      `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, '_change'],
        [suggestReplaceOriginalNameWithAliasName, 'change'],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
        @Component()
        class Test {
          @Custom() @Output() ${propertyName} = getOutput();
                            
        }
      `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if output property is aliased',
    annotatedSource: `
        @Directive()
        class Test {
          @Output('change') change = (this.subject$ as Subject<{blur: boolean}>).pipe();
                  ~~~~~~~~
        }
      `,
    messageId,
    annotatedOutput: `
        @Directive()
        class Test {
          @Output() change = (this.subject$ as Subject<{blur: boolean}>).pipe();
                  ~~~~~~~~
        }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if output getter is aliased',
    annotatedSource: `
        @Component()
        class Test {
          @Output(\`${'devicechange'}\`) get getter() {}
                  ~~~~~~~~~~~~~~

          @Output() test: string;
        }
      `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'getter'],
        [suggestReplaceOriginalNameWithAliasName, 'devicechange'],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
        @Component()
        class Test {
          @Output() get ${propertyName}() {}
                  

          @Output() test: string;
        }
      `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail if output alias is prefixed by directive's selector, but the suffix does not match the property name`,
    annotatedSource: `
        @Directive({
          selector: 'foo'
        })
        class Test {
          @Output('fooColor') colors: string;
                  ~~~~~~~~~~
        }
      `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'colors'],
        [suggestReplaceOriginalNameWithAliasName, 'fooColor'],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
        @Directive({
          selector: 'foo'
        })
        class Test {
          @Output() ${propertyName}: string;
                  
        }
      `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if output alias is not strictly equal to the selector plus the property name in `camelCase` form',
    annotatedSource: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          @Output('foocolor') color: string;
                  ~~~~~~~~~~
        }
      `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'color'],
        [suggestReplaceOriginalNameWithAliasName, 'foocolor'],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          @Output() ${propertyName}: string;
                  
        }
      `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if output property is aliased without `@Component` or `@Directive` decorator',
    annotatedSource: `
        @Directive({
          selector: 'kebab-case',
        })
        class Test {}

        @Injectable()
        class Test {
          @Output('kebab-case') blur = this.getOutput();
                  ~~~~~~~~~~~~
        }
      `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'blur'],
        [suggestReplaceOriginalNameWithAliasName, "'kebab-case'"],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
        @Directive({
          selector: 'kebab-case',
        })
        class Test {}

        @Injectable()
        class Test {
          @Output() ${propertyName} = this.getOutput();
                  
        }
      `,
    })),
  }),
];
