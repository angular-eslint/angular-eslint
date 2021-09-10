import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/sort-ngmodule-metadata-arrays';

const messageId: MessageIds = 'sortNgmoduleMetadataArrays';
const suggestFix: MessageIds = 'suggestFix';

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
        AppModule1,
        AppModule2,
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
    description: 'should fail and suggest instead of fix when having comments',
    annotatedSource: `
    @NgModule({
      providers: [
        // @ts-ignore
        AProvider,
        // @ts-expect-error
        {
          useClass: MyProvider,
          // eslint-disable-next-line sort-keys
          provide: 'myprovider',
        },
        cProvider,
        bProvider, // TODO: This provider should be removed soon.
        ~~~~~~~~~
        /* CommentAfter */ DProvider,
      ]
    })
    class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestFix,
        output: `
    @NgModule({
      providers: [
        // @ts-ignore
        AProvider,
        // @ts-expect-error
        bProvider,
        cProvider,
        DProvider, // TODO: This provider should be removed soon.
        
        /* CommentAfter */ {
          useClass: MyProvider,
          // eslint-disable-next-line sort-keys
          provide: 'myprovider',
        },
      ]
    })
    class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if computed property metadata arrays is not sorted ASC',
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
        
      ],
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if nested arrays within metadata is not sorted ASC',
    annotatedSource: `
    @NgModule({
      bootstrap,
      declarations: declarations,
      providers: providers(),
      schemas: [],
      imports: [
        Module1,
        [...commonModules, Module4, Module0],
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
      imports: [
        Module1,
        [Module0, Module4, ...commonModules],
                                    
      ],
    })
    class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    // https://github.com/angular-eslint/angular-eslint/issues/675
    description: 'should fail and fix multiple reports at once',
    annotatedSource: `
    @NgModule({
      imports: [
        AppRoutingModule,
        BrowserModule,
        DeprecatedModule as unknown as Type<unknown>,
        FlexLayoutModule,
        HttpClientModule,
        new Array([TestModule]),
        MatListModule,
        ...(shouldLoadModuleB ? [ModuleA, ModuleB] : []),
        MatMenuModule,
        StoreModule.forRoot({}),
        MatSidenavModule,
        MatToolbarModule,
        ...[sharedDeclarations],
        BrowserAnimationsModule,
        ~~~~~~~~~~~~~~~~~~~~~~~
        Test!,
      ],
      declarations: [
        AutoHeightDirective,
        NgxColumnComponent,
        NgxOptionsComponent,
        TableBuilderComponent,
        TableTbodyComponent,
        TableTheadComponent,
        TableCellComponent,
        ^^^^^^^^^^^^^^^^^^
        TemplateBodyTdDirective,
        [B, A, C],
            #
        TemplateHeadThDirective,
        ObserverViewDirective,
        NgxContextMenuComponent,
        NgxContextMenuItemComponent,
        NgxContextMenuDividerComponent,
        NgxMenuContentComponent,
        NgxEmptyComponent,
        NgxHeaderComponent,
        NgxFooterComponent,
        NgxFilterViewerComponent,
        NgxFilterComponent,
        NgxFilterDirective,
        DragIconComponent,
        NgxSourceNullComponent,
        DisableRowPipe,
        TableSelectedItemsPipe,
        MapToTableEntriesPipe,
        VirtualForDirective,
        GetFreeSizePipe,
        GetClientHeightPipe
      ],
      providers: [
        {provide: 'TOKEN', useFactory: useToken},
        WebWorkerThreadService,
      ],
    })
    class TableBuilderModule {
      static forRoot(): ModuleWithProviders<TableBuilderModule> {
        return { ngModule: TableBuilderModule, providers: [] };
      }
    }
    `,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
      { char: '#', messageId },
    ],
    annotatedOutput: `
    @NgModule({
      imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FlexLayoutModule,
        HttpClientModule,
        MatListModule,
        MatMenuModule,
        MatSidenavModule,
        MatToolbarModule,
        DeprecatedModule as unknown as Type<unknown>,
        new Array([TestModule]),
        ...(shouldLoadModuleB ? [ModuleA, ModuleB] : []),
        StoreModule.forRoot({}),
        ...[sharedDeclarations],
                               
        Test!,
      ],
      declarations: [
        AutoHeightDirective,
        DisableRowPipe,
        DragIconComponent,
        GetClientHeightPipe,
        GetFreeSizePipe,
        MapToTableEntriesPipe,
        NgxColumnComponent,
                          
        NgxContextMenuComponent,
        NgxContextMenuDividerComponent,
            
        NgxContextMenuItemComponent,
        NgxEmptyComponent,
        NgxFilterComponent,
        NgxFilterDirective,
        NgxFilterViewerComponent,
        NgxFooterComponent,
        NgxHeaderComponent,
        NgxMenuContentComponent,
        NgxOptionsComponent,
        NgxSourceNullComponent,
        ObserverViewDirective,
        TableBuilderComponent,
        TableCellComponent,
        TableSelectedItemsPipe,
        TableTbodyComponent,
        TableTheadComponent,
        TemplateBodyTdDirective,
        TemplateHeadThDirective,
        VirtualForDirective,
        [B, A, C]
      ],
      providers: [
        {provide: 'TOKEN', useFactory: useToken},
        WebWorkerThreadService,
      ],
    })
    class TableBuilderModule {
      static forRoot(): ModuleWithProviders<TableBuilderModule> {
        return { ngModule: TableBuilderModule, providers: [] };
      }
    }
    `,
  }),
];
