import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/sort-ngmodule-metadata-arrays';

const messageId: MessageIds = 'sortNgmoduleMetadataArrays';

export const valid = [
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
];

export const invalid = [
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
    annotatedOutput: `
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
];
