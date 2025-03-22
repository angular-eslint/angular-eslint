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
];
