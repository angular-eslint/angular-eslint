import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/sort-keys-in-type-decorator';

export const valid: readonly ValidTestCase<Options>[] = [
  {
    code: `
    @Type({
      a: 'a',
      b: 'b',
      c: 'c'
    })
    class Test {}
    `,
  },
  {
    code: `
    @Type({})
    class Test {}
    `,
  },
  {
    code: `
    @Type({
      a: 'a'
    })
    class Test {}
    `,
  },
  {
    code: `
      @Component({
        selector: 'app-root',
        imports: [CommonModule],
        standalone: true,
        templateUrl: './app.component.html',
        styleUrl: './app.component.css',
        encapsulation: ViewEncapsulation.None,
        changeDetection: ChangeDetectionStrategy.OnPush
      })
      class Test {}
    `,
    options: [
      {
        Component: [
          'selector',
          'imports',
          'standalone',
          'templateUrl',
          'styleUrl',
          'encapsulation',
          'changeDetection',
        ],
      },
    ],
  },
  {
    code: `
      @Directive({
        selector: '[app-test]',
        standalone: true
      })
      class Test {}
    `,
    options: [
      {
        Directive: ['selector', 'standalone'],
      },
    ],
  },
  {
    code: `
      @NgModule({
        declarations: [AppComponent],
        imports: [CommonModule]
      })
      class Test {}
    `,
    options: [
      {
        NgModule: ['declarations', 'imports'],
      },
    ],
  },
  {
    code: `
      @Pipe({
        name: 'myPipe',
        standalone: true
      })
      class Test {}
    `,
    options: [
      {
        Pipe: ['name', 'standalone'],
      },
    ],
  },
  {
    code: `
      @Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrl: './app.component.css'
      })
      class Test {}
    `,
    options: [
      {
        Component: [
          'selector',
          'imports',
          'standalone',
          'templateUrl',
          'styleUrl',
          'encapsulation',
          'changeDetection',
        ],
      },
    ],
  },
  {
    code: `
      @NgModule({
        declarations: [AppComponent],
        exports: [AppComponent]
      })
      class Test {}
    `,
    options: [
      {
        NgModule: [
          'declarations',
          'imports',
          'exports',
          'providers',
          'bootstrap',
        ],
      },
    ],
  },
  {
    code: `
      @Component({
        // Comment above selector
        selector: 'app-root', // Inline comment for selector
        /* Multi-line comment 
           above imports */
        imports: [
          CommonModule,
          FormsModule
        ], // Inline comment after imports
        standalone: true,
        templateUrl: './app.component.html',
        styleUrl: './app.component.css',
        // Comment above encapsulation
        encapsulation: ViewEncapsulation.None,
        changeDetection: ChangeDetectionStrategy.OnPush
      })
      class Test {}
    `,
    options: [
      {
        Component: [
          'selector',
          'imports',
          'standalone',
          'templateUrl',
          'styleUrl',
          'encapsulation',
          'changeDetection',
        ],
      },
    ],
  },
  {
    code: `
      @NgModule({
        // Leading comment for declarations
        declarations: [
          /* Component list comment */
          AppComponent,
          HeaderComponent
        ],
        imports: [
          CommonModule, // Common module comment
          RouterModule /* Router module comment */
        ],
        /* Multi-line export comment
           with multiple lines
           before the property */
        exports: [AppComponent]
      })
      class Test {}
    `,
    options: [
      {
        NgModule: [
          'declarations',
          'imports',
          'exports',
          'providers',
          'bootstrap',
        ],
      },
    ],
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when Component decorator keys are not sorted according to specified order',
    annotatedSource: `
      @Component({
        changeDetection: ChangeDetectionStrategy.OnPush,
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        selector: 'app-root',
        imports: [CommonModule],
        standalone: true,
        templateUrl: './app.component.html',
        styleUrl: './app.component.css',
        encapsulation: ViewEncapsulation.None
      })
      class Test {
      }
    `,
    messageId: 'incorrectOrder',
    data: {
      decorator: 'Component',
      expectedOrder:
        'selector, imports, standalone, templateUrl, styleUrl, encapsulation, changeDetection',
    },
    options: [
      {
        Component: [
          'selector',
          'imports',
          'standalone',
          'templateUrl',
          'styleUrl',
          'encapsulation',
          'changeDetection',
        ],
      },
    ],
    annotatedOutput: `
      @Component({
        selector: 'app-root',
        imports: [CommonModule],
        standalone: true,
        templateUrl: './app.component.html',
        styleUrl: './app.component.css',
        encapsulation: ViewEncapsulation.None,
        changeDetection: ChangeDetectionStrategy.OnPush
      })
      class Test {
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when Directive decorator keys are not sorted according to specified order',
    annotatedSource: `
      @Directive({
        standalone: true,
        ~~~~~~~~~~~~~~~~
        selector: '[app-test]'
      })
      class Test {
      }
    `,
    messageId: 'incorrectOrder',
    data: {
      decorator: 'Directive',
      expectedOrder: 'selector, standalone',
    },
    options: [
      {
        Directive: ['selector', 'standalone'],
      },
    ],
    annotatedOutput: `
      @Directive({
        selector: '[app-test]',
        standalone: true
      })
      class Test {
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when NgModule decorator keys are not sorted according to specified order',
    annotatedSource: `
      @NgModule({
        imports: [CommonModule],
        ~~~~~~~~~~~~~~~~~~~~~~~
        declarations: [AppComponent]
      })
      class Test {
      }
    `,
    messageId: 'incorrectOrder',
    data: {
      decorator: 'NgModule',
      expectedOrder: 'declarations, imports',
    },
    options: [
      {
        NgModule: ['declarations', 'imports'],
      },
    ],
    annotatedOutput: `
      @NgModule({
        declarations: [AppComponent],
        imports: [CommonModule]
      })
      class Test {
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when Pipe decorator keys are not sorted according to specified order',
    annotatedSource: `
      @Pipe({
        standalone: true,
        ~~~~~~~~~~~~~~~~
        name: 'myPipe'
      })
      class Test {
      }
    `,
    messageId: 'incorrectOrder',
    data: {
      decorator: 'Pipe',
      expectedOrder: 'name, standalone',
    },
    options: [
      {
        Pipe: ['name', 'standalone'],
      },
    ],
    annotatedOutput: `
      @Pipe({
        name: 'myPipe',
        standalone: true
      })
      class Test {
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when partial properties are not in correct order',
    annotatedSource: `
      @Component({
        styleUrl: './app.component.css',
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        selector: 'app-root',
        templateUrl: './app.component.html'
      })
      class Test {
      }
    `,
    messageId: 'incorrectOrder',
    data: {
      decorator: 'Component',
      expectedOrder: 'selector, templateUrl, styleUrl',
    },
    options: [
      {
        Component: [
          'selector',
          'imports',
          'standalone',
          'templateUrl',
          'styleUrl',
          'encapsulation',
          'changeDetection',
        ],
      },
    ],
    annotatedOutput: `
      @Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrl: './app.component.css'
      })
      class Test {
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when partial NgModule properties are not in correct order',
    annotatedSource: `
      @NgModule({
        exports: [AppComponent],
        ~~~~~~~~~~~~~~~~~~~~~~~
        declarations: [AppComponent]
      })
      class Test {
      }
    `,
    messageId: 'incorrectOrder',
    data: {
      decorator: 'NgModule',
      expectedOrder: 'declarations, exports',
    },
    options: [
      {
        NgModule: [
          'declarations',
          'imports',
          'exports',
          'providers',
          'bootstrap',
        ],
      },
    ],
    annotatedOutput: `
      @NgModule({
        declarations: [AppComponent],
        exports: [AppComponent]
      })
      class Test {
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should handle basic inline comments when sorting properties',
    annotatedSource: `
      @Component({
        styleUrl: './app.component.css', // Inline comment for styleUrl
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        selector: 'app-root' // Inline comment for selector
      })
      class Test {}
    `,
    messageId: 'incorrectOrder',
    data: {
      decorator: 'Component',
      expectedOrder: 'selector, styleUrl',
    },
    options: [
      {
        Component: ['selector', 'styleUrl'],
      },
    ],
    annotatedOutput: `
      @Component({
        selector: 'app-root', // Inline comment for selector
        styleUrl: './app.component.css' // Inline comment for styleUrl
      })
      class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should preserve leading comments when sorting properties',
    annotatedSource: `
      @Component({
        // Comment above styleUrl
        styleUrl: './app.component.css',
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Comment above selector
        selector: 'app-root'
      })
      class Test {}
    `,
    messageId: 'incorrectOrder',
    data: {
      decorator: 'Component',
      expectedOrder: 'selector, styleUrl',
    },
    options: [
      {
        Component: ['selector', 'styleUrl'],
      },
    ],
    annotatedOutput: `
      @Component({
        // Comment above selector
        selector: 'app-root',
        // Comment above styleUrl
        styleUrl: './app.component.css'
      })
      class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should preserve multi-line comments when sorting properties',
    annotatedSource: `
      @Component({
        /* This is a multi-line comment
           above styleUrl property */
        styleUrl: './app.component.css',
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        /* This is a multi-line comment
           above selector property */
        selector: 'app-root'
      })
      class Test {}
    `,
    messageId: 'incorrectOrder',
    data: {
      decorator: 'Component',
      expectedOrder: 'selector, styleUrl',
    },
    options: [
      {
        Component: ['selector', 'styleUrl'],
      },
    ],
    annotatedOutput: `
      @Component({
        /* This is a multi-line comment
           above selector property */
        selector: 'app-root',
        /* This is a multi-line comment
           above styleUrl property */
        styleUrl: './app.component.css'
      })
      class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should properly handle comments when sorting properties',
    annotatedSource: `
      @Component({
        // Comment above changeDetection
        changeDetection: ChangeDetectionStrategy.OnPush, // Inline comment for changeDetection
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        /* Multi-line comment
           above selector */
        selector: 'app-root', /* Inline multi-line comment after selector */
        // Comment above imports
        imports: [
          // Comment inside imports array
          CommonModule, // Comment after CommonModule
          FormsModule /* Comment after FormsModule */
        ],
        /* Comment above standalone */
        standalone: true, // Comment after standalone
        // Comment above templateUrl
        templateUrl: './app.component.html',
        /* Multi-line comment
           above styleUrl */
        styleUrl: './app.component.css',
        // Comment above encapsulation
        encapsulation: ViewEncapsulation.None /* Inline comment for encapsulation */
      })
      class Test {}
    `,
    messageId: 'incorrectOrder',
    data: {
      decorator: 'Component',
      expectedOrder:
        'selector, imports, standalone, templateUrl, styleUrl, encapsulation, changeDetection',
    },
    options: [
      {
        Component: [
          'selector',
          'imports',
          'standalone',
          'templateUrl',
          'styleUrl',
          'encapsulation',
          'changeDetection',
        ],
      },
    ],
    annotatedOutput: `
      @Component({
        /* Multi-line comment
           above selector */
        selector: 'app-root', /* Inline multi-line comment after selector */
        // Comment above imports
        imports: [
          // Comment inside imports array
          CommonModule, // Comment after CommonModule
          FormsModule /* Comment after FormsModule */
        ],
        /* Comment above standalone */
        standalone: true, // Comment after standalone
        // Comment above templateUrl
        templateUrl: './app.component.html',
        /* Multi-line comment
           above styleUrl */
        styleUrl: './app.component.css',
        // Comment above encapsulation
        encapsulation: ViewEncapsulation.None, /* Inline comment for encapsulation */
        // Comment above changeDetection
        changeDetection: ChangeDetectionStrategy.OnPush // Inline comment for changeDetection
      })
      class Test {}
    `,
  }),
];
