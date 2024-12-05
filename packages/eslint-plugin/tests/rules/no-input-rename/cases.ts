import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/no-input-rename';

const messageId: MessageIds = 'noInputRename';
const suggestRemoveAliasName: MessageIds = 'suggestRemoveAliasName';
const suggestReplaceOriginalNameWithAliasName: MessageIds =
  'suggestReplaceOriginalNameWithAliasName';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
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
    @Directive()
    class Test {
      buttonChange = input(1);
    }
  `,
  `
    @Directive()
    class Test {
      buttonChange = input.required<number>();
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
  /**
   * Renaming inputs when using the directive composition API is not a bad practice
   * https://angular.dev/guide/directives/directive-composition-api
   * https://www.youtube.com/watch?v=EJJwyyjsRGs
   */
  `
    @Component({
      selector: 'qx-menuitem',
      hostDirectives: [{
        directive: CdkMenuItem,
        inputs: ['cdkMenuItemDisabled: disabled'],
      }]
    })
    class Test {}
  `,
  `
    @Component({
      selector: 'qx-menuitem',
      'hostDirectives': [{
        directive: CdkMenuItem,
        inputs: ['cdkMenuItemDisabled: disabled'],
      }]
    })
    class Test {}
  `,
  `
    @Component({
      selector: 'qx-menuitem',
      ['hostDirectives']: [{
        directive: CdkMenuItem,
        inputs: ['cdkMenuItemDisabled: disabled'],
      }]
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
        func = input(1, { alias: 'aria-wrong' });
        required = input.required<number>({ alias: 'aria-wrong' });
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
    const change = 'change';
    @Component()
    class Test {
      touchMove = input(1, { alias: change });
    }
  `,
  `
    const change = 'change';
    @Component()
    class Test {
      touchMove = input.required<number>({ alias: change });
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
    const blur = 'blur';
    const click = 'click';
    @Directive()
    class Test {
      [click] = input(1, { alias: blur });
    }
  `,
  `
    const blur = 'blur';
    const click = 'click';
    @Directive()
    class Test {
      [click] = input.required<number>({ alias: blur });
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
    @Component({
      selector: 'foo[bar]'
    })
    class Test {
      bar = input(1);
    }
  `,
  `
    @Component({
      selector: 'foo[bar]'
    })
    class Test {
      bar = input.required<number>();
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
    @Component({
      selector: '[foo], test',
    })
    class Test {
      label = input(1, { alias: 'foo' });
    }
  `,
  `
    @Component({
      selector: '[foo], test',
    })
    class Test {
      label = input.required<number>(1, { alias: 'foo' });
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
  `
    @Directive({
      selector: 'foo'
    })
    class Test {
      ariaLabel = input(1, { alias: 'aria-label' });
    }
  `,
  `
    @Directive({
      selector: 'foo'
    })
    class Test {
      ariaLabel = input.required<number>('aria-label');
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
      selector: 'foo'
    })
    class Test {
      myColor = input(1, { alias: 'fooMyColor' });
    }
  `,
  `
    @Directive({
      selector: 'foo'
    })
    class Test {
      myColor = input.required<number>('fooMyColor');
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
      foo = input(1);
    }
  `,
  `
    @Directive({
      selector: 'img[fooDirective]'
    })
    class Test {
      foo = input.required<number>();
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
  `
    @Directive({
      selector: 'img[fooDirective]'
    })
    class Test {
      foo = input(1, { alias: 'fooDirective' });
    }
  `,
  `
    @Directive({
      selector: 'img[fooDirective]'
    })
    class Test {
      foo = input.required<number>({ alias: 'fooDirective' });
    }
  `,
  // Angular 16+ required inputs should not create false positives: https://github.com/angular-eslint/angular-eslint/issues/1355
  `
    @Component({
      selector: 'foo'
    })
    class Test {
      @Input({ required: true }) name: string;
    }
  `,
  `
    @Component({
      selector: 'foo'
    })
    class Test {
      @Input({ transform: (val) => val ?? '', required: true }) foo!: string;
    }
  `,
  `
    @Component({
      selector: 'foo'
    })
    class Test {
      foo = input.required<string>({ transform: (val) => val ?? '' });
    }
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
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
    description:
      'should fail if input decorator property is aliased with backticks',
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
    description:
      'should fail if input function property is aliased with backticks',
    annotatedSource: `
      @Component()
      class Test {
        _change = input(1, { alias: \`change\` });
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
        ${propertyName} = input(1);
                                    
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if required input function property is aliased with backticks',
    annotatedSource: `
      @Component()
      class Test {
        _change = input.required<number>({ alias: \`change\` });
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
        ${propertyName} = input.required<number>();
                                                  
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if input decorator property is aliased',
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
               
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if input function property is aliased',
    annotatedSource: `
      @Directive()
      class Test {
        change = input(1, { alias: 'change' });
                                   ~~~~~~~~
      }
    `,
    messageId,
    annotatedOutput: `
      @Directive()
      class Test {
        change = input(1);
                                   
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if required input function property is aliased',
    annotatedSource: `
      @Directive()
      class Test {
        change = input.required<number>({ alias: 'change' });
                                                 ~~~~~~~~
      }
    `,
    messageId,
    annotatedOutput: `
      @Directive()
      class Test {
        change = input.required<number>();
                                                 
      }
    `,
  }),
  // Angular 16+ alias metadata property: https://github.com/angular-eslint/angular-eslint/issues/1355
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input decorator property is aliased (using metadata)',
    annotatedSource: `
      @Directive()
      class Test {
        @Input({ alias: 'change' }) change = (this.subject$ as Subject<{blur: boolean}>).pipe();
                        ~~~~~~~~
      }
    `,
    messageId,
    annotatedOutput: `
      @Directive()
      class Test {
        @Input() change = (this.subject$ as Subject<{blur: boolean}>).pipe();
                        
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if input decorator setter is aliased',
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
    description: `should fail if an input decorator 'aria-*' alias name does not match the property name`,
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
    description: `should fail if an input function 'aria-*' alias name does not match the property name`,
    annotatedSource: `
      @Directive({
        selector: 'foo'
      })
      class Test {
        ariaBusy = input(1, { alias: 'aria-invalid' });
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
        ${propertyName} = input(1);
                                     
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail if a required input function 'aria-*' alias name does not match the property name`,
    annotatedSource: `
      @Directive({
        selector: 'foo'
      })
      class Test {
        ariaBusy = input.required<number>({ alias: 'aria-invalid' });
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
        ${propertyName} = input.required<number>();
                                                   
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail if input decorator alias is prefixed by component's selector, but the suffix does not match the property name`,
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
    description: `should fail if input function alias is prefixed by component's selector, but the suffix does not match the property name`,
    annotatedSource: `
      @Component({
        selector: 'foo'
      })
      class Test {
        colors = input(1, { alias: 'fooColor' });
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
        ${propertyName} = input(1);
                                   
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail if required input function alias is prefixed by component's selector, but the suffix does not match the property name`,
    annotatedSource: `
      @Component({
        selector: 'foo'
      })
      class Test {
        colors = input.required<number>({ alias: 'fooColor' });
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
        ${propertyName} = input.required<number>();
                                                 
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input decorator alias is not strictly equal to the selector plus the property name in `camelCase` form',
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
      'should fail if input function alias is not strictly equal to the selector plus the property name in `camelCase` form',
    annotatedSource: `
      @Directive({
        'selector': 'foo'
      })
      class Test {
        color = input(1, { alias: 'foocolor' });
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
        ${propertyName} = input(1);
                                  
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if required input function alias is not strictly equal to the selector plus the property name in `camelCase` form',
    annotatedSource: `
      @Directive({
        'selector': 'foo'
      })
      class Test {
        color = input.required<number>({ alias: 'foocolor' });
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
        ${propertyName} = input.required<number>();
                                                
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input decorator property is aliased without `@Component` or `@Directive` decorator',
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
      'should fail if input function property is aliased without `@Component` or `@Directive` decorator',
    annotatedSource: `
      @Component({
        selector: 'click',
      })
      class Test {}

      @Injectable()
      class Test {
        blur = input(1, { alias: 'click' });
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
        ${propertyName} = input(1);
                                 
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if required input function property is aliased without `@Component` or `@Directive` decorator',
    annotatedSource: `
      @Component({
        selector: 'click',
      })
      class Test {}

      @Injectable()
      class Test {
        blur = input.required<number>({ alias: 'click' });
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
        ${propertyName} = input.required<number>();
                                               
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input decorator property alias does not match the directive name when applied to an element in the selector',
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
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input function property alias does not match the directive name when applied to an element in the selector',
    annotatedSource: `
      @Directive({
        selector: 'img[fooDirective]',
      })
      class Test {
        foo = input({ alias: 'notFooDirective' });
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
        ${propertyName} = input();
                             
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if required input function property alias does not match the directive name when applied to an element in the selector',
    annotatedSource: `
      @Directive({
        selector: 'img[fooDirective]',
      })
      class Test {
        foo = input.required<number>({ alias: 'notFooDirective' });
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
        ${propertyName} = input.required<number>();
                                              
      }
    `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input function property is aliased and alias has properties after it',
    annotatedSource: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          color = input(1, { alias: 'test', after: 'it' });
                                    ~~~~~~
        }
      `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'color'],
        [suggestReplaceOriginalNameWithAliasName, 'test'],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          ${propertyName} = input(1, { after: 'it' });
                                    
        }
      `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if required input function property is aliased and alias has properties after it',
    annotatedSource: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          color = input.required<number>({ alias: 'test', after: 'it' });
                                                  ~~~~~~
        }
      `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'color'],
        [suggestReplaceOriginalNameWithAliasName, 'test'],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          ${propertyName} = input.required<number>({ after: 'it' });
                                                  
        }
      `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input function property is aliased and alias has properties before it with trailing comma',
    annotatedSource: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          color = input(1, { before: 'it', alias: 'test', });
                                                  ~~~~~~
        }
      `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'color'],
        [suggestReplaceOriginalNameWithAliasName, 'test'],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          ${propertyName} = input(1, { before: 'it', });
                                                  
        }
      `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if required input function property is aliased and alias has properties before it with trailing comma',
    annotatedSource: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          color = input.required<number>({ before: 'it', alias: 'test', });
                                                                ~~~~~~
        }
      `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'color'],
        [suggestReplaceOriginalNameWithAliasName, 'test'],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          ${propertyName} = input.required<number>({ before: 'it', });
                                                                
        }
      `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input function property is aliased and alias has properties before it without trailing comma',
    annotatedSource: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          color = input(1, { before: 'it', alias: 'test' });
                                                  ~~~~~~
        }
      `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'color'],
        [suggestReplaceOriginalNameWithAliasName, 'test'],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          ${propertyName} = input(1, { before: 'it' });
                                                  
        }
      `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if required input function property is aliased and alias has properties before it without trailing comma',
    annotatedSource: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          color = input.required<number>({ before: 'it', alias: 'test' });
                                                                ~~~~~~
        }
      `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'color'],
        [suggestReplaceOriginalNameWithAliasName, 'test'],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          ${propertyName} = input.required<number>({ before: 'it' });
                                                                
        }
      `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if input function property is aliased and alias has properties before and after it',
    annotatedSource: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          color = input(1, { before: 'it', alias: 'test', after: 'it' });
                                                  ~~~~~~
        }
      `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'color'],
        [suggestReplaceOriginalNameWithAliasName, 'test'],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          ${propertyName} = input(1, { before: 'it', after: 'it' });
                                                  
        }
      `,
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if required input function property is aliased and alias has properties before and after it',
    annotatedSource: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          color = input.required<number>({ before: 'it', alias: 'test', after: 'it' });
                                                                ~~~~~~
        }
      `,
    messageId,
    suggestions: (
      [
        [suggestRemoveAliasName, 'color'],
        [suggestReplaceOriginalNameWithAliasName, 'test'],
      ] as const
    ).map(([messageId, propertyName]) => ({
      messageId,
      output: `
        @Component({
          'selector': 'foo'
        })
        class Test {
          ${propertyName} = input.required<number>({ before: 'it', after: 'it' });
                                                                
        }
      `,
    })),
  }),
];
