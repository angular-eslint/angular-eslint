import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/sort-imports-metadata';

const messageId: MessageIds = 'sortImportsMetadata';

export const valid = [
  `
  @Component({
    standalone: true,
    selector: 'test-component',
    imports: [aModule, bModule, cModule, dModule],
  })
  export class TestComponent { }
  `,
  `
  @Directive({
    standalone: true,
    selector: 'test-directive',
    imports: [aModule, bModule, cModule, dModule],
  })
  export class TestDirective { }
  `,
  `
  @Pipe({
    standalone: true,
    selector: 'test-pipe',
    imports: [aModule, bModule, cModule, dModule],
  })
  export class TestPipe { }
  `,
  `
  @Component({
    standalone: true,
    selector: 'test-component',
    imports: [
      aModule,
      bModule,
      cModule,
      dModule
    ],
  })
  export class TestComponent { }
  `,
  // The following test cases are copied from sort-ngmodule-metadata-arrays
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
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `imports` for a standalone component is not sorted ASC',
    annotatedSource: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports: [aModule, bModule, dModule, cModule],
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    export class TestComponent { }
    `,
    messageId,
    annotatedOutput: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports: [
        aModule,
        bModule,
        cModule,
        dModule,
      ],
                
    })
    export class TestComponent { }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `imports`, listed by line, for a standalone component is not sorted ASC',
    annotatedSource: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports: [
        aModule,
        ~~~~~~~
        bModule,
        ~~~~~~~
        dModule,
        ~~~~~~~
        cModule
        ~~~~~~~
      ],
    })
    export class TestComponent { }
    `,
    messageId,
    annotatedOutput: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports: [
        aModule,
        bModule,
        cModule,
        dModule,
      ],
    })
    export class TestComponent { }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `imports`, listed by line with comments, for a standalone component is not sorted ASC',
    annotatedSource: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports: [
        // Line comment above aModule
        // Another line comment above aModule
        aModule, // Line comment next to aModule
        ~~~~~~~
        bModule,
        /* Block comment above dModule */
        ~~~~~~~
        dModule, /* Block comment next to dModule */
        ~~~~~~~
        /**
         * Block comment above cModule
         **/
        // Line comment above cModule
        /* Another block comment above cModule */
        cModule
        ~~~~~~~
        /**
         * Block comment below cModule
         **/
        // Another line comment below cModule
      ],
    })
    export class TestComponent { }
    `,
    messageId,
    annotatedOutput: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports: [
        // Line comment above aModule
        // Another line comment above aModule
        aModule, // Line comment next to aModule
        bModule,
        /**
         * Block comment above cModule
         **/
        // Line comment above cModule
        /* Another block comment above cModule */
        cModule,
        /**
         * Block comment below cModule
         **/
        // Another line comment below cModule
        /* Block comment above dModule */
        dModule, /* Block comment next to dModule */
      ],
    })
    export class TestComponent { }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `imports`, listed by line with comments before and after the list, for a standalone component is not sorted ASC',
    annotatedSource: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports:
      // Line comment above list
      /* Block comment above list */
      [
        aModule,
        ~~~~~~~
        bModule,
        ~~~~~~~
        dModule,
        ~~~~~~~
        cModule
        ~~~~~~~
      ],
      // Line comment below list
      /* Block comment below list */
    })
    export class TestComponent { }
    `,
    messageId,
    annotatedOutput: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports:
      // Line comment above list
      /* Block comment above list */
      [
        aModule,
        bModule,
        cModule,
        dModule,
      ],
      // Line comment below list
      /* Block comment below list */
    })
    export class TestComponent { }
    `,
  }),
  // The following test cases are copied from sort-ngmodule-metadata-arrays
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `imports` metadata arrays is not sorted ASC',
    annotatedSource: `
    @NgModule({
      imports: [aModule, bModule, DModule, cModule]
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    messageId,
    annotatedOutput: `
    @NgModule({
      imports: [
        aModule,
        bModule,
        cModule,
        DModule,
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
        ~~~~~~~
        bModule,
        ~~~~~~~
        DModule,
        ~~~~~~~
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
      'should fail if order does not correspond to specified locale order',
    annotatedSource: `
    @NgModule({
      imports: [chModule, dModule]
                ~~~~~~~~~~~~~~~~~
    })
    class Test {}
    `,
    annotatedOutput: `
    @NgModule({
      imports: [
        dModule,
        chModule,
      ]
                
    })
    class Test {}
    `,
    messageId,
    options: [{ locale: 'cs-CZ' }],
    data: { locale: 'cs-CZ' },
  }),
];
