import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/sort-ngmodule-metadata-arrays';

const messageId: MessageIds = 'sortNgmoduleMetadataArrays';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `class Test {}`,
  `
  @NgModule()
  class Test {}
  `,
  `
  @NgModule({})
  class Test {}
  `,
  `
  const options = {};
  @NgModule(options)
  class Test {}
  `,
  `
  @NgModule({
    bootstrap: [
      AppModule1,
      AppModule2,
      AppModule3,
    ],
    'declarations': [
      AComponent,
      bDirective,
      cPipe,
      DComponent,
      VariableComponent,
    ],
    ['imports']: [
      _foo,
      AModule,
      bModule,
      cModule,
      DModule,
    ],
    [\`providers\`]: [
      AProvider,
      {
        provide: 'myprovider',
        useClass: MyProvider,
      },
      bProvider,
      cProvider,
      DProvider,
    ],
  })
  class Test {}
  `,
  `
  @Component({
    providers: [
      DeclarationD,
      DeclarationA,
    ]
  })
  class Test {}
  `,
  `
  @NgModule({
    providers: [
      {
        provide: 'myprovider',
        useFactory: myProviderFactory,
        deps: [TOKEN_Z, ClassX, ClassA, TOKEN_A],
      },
    ],
  })
  class Test {}
  `,
  {
    code: `
      @Component({
        providers: [
          DatepickerProvider,
          ChipsProvider,
        ]
      })
      class Test {}
    `,
    options: [{ locale: 'cs-CZ' }],
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `imports` metadata arrays is not sorted ASC',
    annotatedSource: `
    @NgModule({
      imports: [aModule, bModule, DModule, cModule]
                                           ~~~~~~~
    })
    class Test {}
    `,
    messageId,
    annotatedOutput: `
    @NgModule({
      imports: [aModule, bModule, cModule, DModule]
                                           ~~~~~~~
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `declarations` metadata arrays is not sorted ASC',
    annotatedSource: `
    @NgModule({
      'declarations': [
        AComponent,
        cPipe,
        bDirective,
        ~~~~~~~~~~
        DComponent,
      ],
    })
    class Test {}
    `,
    messageId,
    annotatedOutput: `
    @NgModule({
      'declarations': [
        AComponent,
        bDirective,
        cPipe,
        ~~~~~~~~~~
        DComponent,
      ],
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `exports` metadata arrays is not sorted ASC',
    annotatedSource: `
    @NgModule({
      ['exports']: [
        AComponent,
        cPipe,
        bDirective,
        ~~~~~~~~~~
        DComponent,
      ],
    })
    class Test {}
    `,
    messageId,
    annotatedOutput: `
    @NgModule({
      ['exports']: [
        AComponent,
        bDirective,
        cPipe,
        ~~~~~~~~~~
        DComponent,
      ],
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `bootstrap` metadata arrays is not sorted ASC',
    annotatedSource: `
    @NgModule({
      [\`bootstrap\`]: [
        AppModule2,
        AppModule3,
        AppModule1,
        ~~~~~~~~~~
      ]
    })
    class Test {}
    `,
    messageId,
    // These are the result of each pass of the auto-fixer, with the final entry being the ultimate result the user sees
    annotatedOutputs: [
      `
    @NgModule({
      [\`bootstrap\`]: [
        AppModule2,
        AppModule1,
        AppModule3,
        ~~~~~~~~~~
      ]
    })
    class Test {}
    `,
      `
    @NgModule({
      [\`bootstrap\`]: [
        AppModule1,
        AppModule2,
        AppModule3,
        
      ]
    })
    class Test {}
    `,
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `schemas` metadata arrays is not sorted ASC',
    annotatedSource: `
    @NgModule({
      schemas: [
        A_SCHEMA,
        C_SCHEMA,
        B_SCHEMA,
        ~~~~~~~~
      ]
    })
    class Test {}
    `,
    messageId,
    annotatedOutput: `
    @NgModule({
      schemas: [
        A_SCHEMA,
        B_SCHEMA,
        C_SCHEMA,
        ~~~~~~~~
      ]
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `providers` metadata arrays is not sorted ASC, ignoring objects',
    annotatedSource: `
    @NgModule({
      providers: [
        AProvider,
        {
          provide: 'myprovider',
          useClass: MyProvider,
        },
        cProvider,
        bProvider,
        ~~~~~~~~~
        DProvider,
      ]
    })
    class Test {}
    `,
    messageId,
    annotatedOutput: `
    @NgModule({
      providers: [
        AProvider,
        {
          provide: 'myprovider',
          useClass: MyProvider,
        },
        bProvider,
        cProvider,
        ~~~~~~~~~
        DProvider,
      ]
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a computed property has unordered metadata array',
    annotatedSource: `
    @NgModule({
      bootstrap,
      declarations: declarations,
      providers: providers(),
      schemas: [],
      [imports]: [
        aModule,
        bModule,
        DModule,
        cModule,
        ~~~~~~~
      ],
    })
    class Test {}
    `,
    messageId,
    annotatedOutput: `
    @NgModule({
      bootstrap,
      declarations: declarations,
      providers: providers(),
      schemas: [],
      [imports]: [
        aModule,
        bModule,
        cModule,
        DModule,
        ~~~~~~~~~
      ],
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if order does not correspond to specificied locale order',
    annotatedSource: `
    @NgModule({
      imports: [chModule, dModule]
                          ~~~~~~~
    })
    class Test {}
    `,
    annotatedOutput: `
    @NgModule({
      imports: [dModule, chModule]
                          ~~~~~~~
    })
    class Test {}
    `,
    messageId,
    options: [{ locale: 'cs-CZ' }],
    data: { locale: 'cs-CZ' },
  }),
];
