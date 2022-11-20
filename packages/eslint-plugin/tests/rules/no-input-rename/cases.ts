import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/no-input-rename';

const messageId: MessageIds = 'noInputRename';
const suggestRemoveAliasName: MessageIds = 'suggestRemoveAliasName';
const suggestReplaceOriginalNameWithAliasName: MessageIds =
  'suggestReplaceOriginalNameWithAliasName';

export const valid = [
  `class Test {}`,
  `
    @Page({
      inputs: ['play', popstate, \`online\`, 'obsolete: obsol', 'store: storage'],
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
      @Input() buttonChange = new EventEmitter<'change'>();
    }
  `,
  `
    @Component({
      inputs,
    })
    class Test {}
  `,
  `
    @Directive({
      inputs: [...test],
    })
    class Test {}
  `,
  `
    @Component({
      inputs: func(),
    })
    class Test {}
  `,
  `
    @Directive({
      inputs: [func(), 'a'],
    })
    class Test {}
  `,
  `
    @Component({})
    class Test {
      @Input() set setter(setter: string) {}
    }
  `,
  {
    code: `
      @Component({
        inputs: ['foo: aria-wrong']
      })
      class Test {
        @Input('aria-wrong') set setter(setter: string) {}
      }
      `,
    options: [{ allowedNames: ['aria-wrong'] }],
  },
  `
    const change = 'change';
    @Component()
    class Test {
      @Input(change) touchMove: EventEmitter<{ action: 'click' | 'close' }> = new EventEmitter<{ action: 'click' | 'close' }>();
    }
  `,
  `
    const blur = 'blur';
    const click = 'click';
    @Directive()
    class Test {
      @Input(blur) [click]: EventEmitter<Blur>;
    }
  `,
  `
    @Component({
      selector: 'foo[bar]'
    })
    class Test {
      @Input() bar: string;
    }
  `,
  `
    @Directive({
      'selector': 'foo',
      'inputs': [\`test: ${'foo'}\`]
    })
    class Test {}
  `,
  `
    @Component({
      'selector': 'foo',
      ['inputs']: [\`test: ${'foo'}\`]
    })
    class Test {}
  `,
  `
    @Directive({
      'selector': 'foo',
      [\`inputs\`]: [\`test: ${'foo'}\`]
    })
    class Test {}
  `,
  `
    @Component({
      selector: '[foo], test',
    })
    class Test {
      @Input('foo') label: string;
    }
  `,
  `
    @Directive({
      selector: 'foo'
    })
    class Test {
      @Input('aria-label') ariaLabel: string;
    }
  `,
  {
    code: `
      @Component({
        inputs: ['foo: allowedName']
      })
      class Test {
        @Input() bar: string;
      }
      `,
    options: [{ allowedNames: ['allowedName'] }],
  },
  `
    @Directive({
      selector: 'foo'
    })
    class Test {
      @Input('fooMyColor') myColor: string;
    }
  `,
  `
    @Directive({
      selector: 'img[fooDirective]'
    })
    class Test {
      @Input foo: Foo;
    }
  `,
  `
    @Directive({
      selector: 'img[fooDirective]'
    })
    class Test {
      @Input('fooDirective') foo: Foo;
    }
  `,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `inputs` metadata property is aliased in `@Component`',
    annotatedSource: `
      @Component({
        inputs: ['a: b']
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
        inputs: ['${name}']
                 
      })
      class Test {}
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `inputs` metadata property is literal and aliased in `@Directive`',
    annotatedSource: `
      @Directive({
        outputs: ['abort'],
        'inputs': [boundary, \`test: copy\`, 'check: check'],
                             ~~~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
    options: [{ allowedNames: ['check', 'test'] }],
    suggestions: (
      [
        [suggestRemoveAliasName, 'test'],
        [suggestReplaceOriginalNameWithAliasName, 'copy'],
      ] as const
    ).map(([messageId, name]) => ({
      messageId,
      output: `
      @Directive({
        outputs: ['abort'],
        'inputs': [boundary, \`${name}\`, 'check: check'],
                             
      })
      class Test {}
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `inputs` metadata property is computed `Literal` and aliased with the same name in `@Component`',
    annotatedSource: `
      @Component({
        ['inputs']: ['orientation: orientation'],
                     ~~~~~~~~~~~~~~~~~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
    annotatedOutput: `
      @Component({
        ['inputs']: ['orientation'],
                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      })
      class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `inputs` metadata property is computed `TemplateLiteral` and aliased with the same name in `@Directive`',
    annotatedSource: `
      @Directive({
        [\`inputs\`]: ['orientation: orientation'],
                     ~~~~~~~~~~~~~~~~~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
    annotatedOutput: `
      @Directive({
        [\`inputs\`]: ['orientation'],
                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      })
      class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if input property is aliased with backticks',
    annotatedSource: `
      @Component()
      class Test {
        @Custom() @Input(\`change\`) _change = getInput();
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
        @Custom() @Input() ${propertyName} = getInput();
                         
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if input property is aliased',
    annotatedSource: `
      @Directive()
      class Test {
        @Input('change') change = (this.subject$ as Subject<{blur: boolean}>).pipe();
               ~~~~~~~~
      }
    `,
    messageId,
    annotatedOutput: `
      @Directive()
      class Test {
        @Input() change = (this.subject$ as Subject<{blur: boolean}>).pipe();
               ~~~~~~~~
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if input setter is aliased',
    annotatedSource: `
      @Component()
      class Test {
        @Input(\`${'devicechange'}\`) set setter(setter: string) {}
               ~~~~~~~~~~~~~~

        @Input('allowedName') test: string;
      }
    `,
    messageId,
    options: [{ allowedNames: ['allowedName'] }],
    suggestions: (
      [
        [suggestRemoveAliasName, 'setter'],
        [suggestReplaceOriginalNameWithAliasName, 'devicechange'],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
      @Component()
      class Test {
        @Input() set ${propertyName}(setter: string) {}
               

        @Input('allowedName') test: string;
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail if a input 'aria-*' alias name does not match the property name`,
    annotatedSource: `
      @Directive({
        selector: 'foo'
      })
      class Test {
        @Input('aria-invalid') ariaBusy: string;
               ~~~~~~~~~~~~~~
      }
    `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'ariaBusy'],
        [suggestReplaceOriginalNameWithAliasName, "'aria-invalid'"],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
      @Directive({
        selector: 'foo'
      })
      class Test {
        @Input() ${propertyName}: string;
               
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail if input alias is prefixed by component's selector, but the suffix does not match the property name`,
    annotatedSource: `
      @Component({
        selector: 'foo'
      })
      class Test {
        @Input('fooColor') colors: string;
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
      @Component({
        selector: 'foo'
      })
      class Test {
        @Input() ${propertyName}: string;
               
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input alias is not strictly equal to the selector plus the property name in `camelCase` form',
    annotatedSource: `
      @Directive({
        'selector': 'foo'
      })
      class Test {
        @Input('foocolor') color: string;
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
      @Directive({
        'selector': 'foo'
      })
      class Test {
        @Input() ${propertyName}: string;
               
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input property is aliased without `@Component` or `@Directive` decorator',
    annotatedSource: `
      @Component({
        selector: 'click',
      })
      class Test {}

      @Injectable()
      class Test {
        @Input('click') blur = this.getInput();
               ~~~~~~~
      }
    `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'blur'],
        [suggestReplaceOriginalNameWithAliasName, 'click'],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
      @Component({
        selector: 'click',
      })
      class Test {}

      @Injectable()
      class Test {
        @Input() ${propertyName} = this.getInput();
               
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input property alias does not match the directive name when applied to an element in the selector',
    annotatedSource: `
      @Directive({
        selector: 'img[fooDirective]',
      })
      class Test {
        @Input('notFooDirective') foo: Foo;
               ~~~~~~~~~~~~~~~~~
      }
    `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'foo'],
        [suggestReplaceOriginalNameWithAliasName, 'notFooDirective'],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
      @Directive({
        selector: 'img[fooDirective]',
      })
      class Test {
        @Input() ${propertyName}: Foo;
               
      }
    `,
    })),
  }),
];
