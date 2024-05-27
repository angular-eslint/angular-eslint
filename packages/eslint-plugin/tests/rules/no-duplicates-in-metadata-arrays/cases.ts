import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/no-duplicates-in-metadata-arrays';

const messageId: MessageIds = 'noDuplicatesInMetadataArrays';

export const valid = [
  `
    @NgModule({
      providers: [ProviderA, ProviderB, ProviderC],
      declarations: [DeclarationA, DeclarationB, DeclarationC],
      imports: [ImportA, ImportB, ImportC],
      exports: [ExportA, ExportB, ExportC]
    })
    class Test {}
  `,
  `
    @Component({
      imports: [ImportA, ImportB, ImportC]
    })
    class Test {}
  `,
  `
    @Directive({
      providers: [ProviderA, ProviderB, ProviderC],
    })
    class Test {}
  `,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'Fails when there are duplicate providers in NgModule',
    annotatedSource: `
      @NgModule({
        providers: [ProviderA, ProviderB, ProviderA, ProviderB]
                                          ~~~~~~~~~  ^^^^^^^^^
      })
      class Test {}
    `,
    messages: [
      {
        char: '~',
        messageId,
      },
      {
        char: '^',
        messageId,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'Fails when there are duplicate declarations in NgModule',
    annotatedSource: `
      @NgModule({
        declarations: [DeclarationA, DeclarationB, DeclarationA, DeclarationB],
                                                   ~~~~~~~~~~~~  ^^^^^^^^^^^^
      })
      class Test {}
    `,
    messages: [
      {
        char: '~',
        messageId,
      },
      {
        char: '^',
        messageId,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'Fails when there are duplicate imports in NgModule',
    annotatedSource: `
      @NgModule({
        imports: [ImportA, ImportB, ImportA, ImportB]
                                    ~~~~~~~  ^^^^^^^
      })
      class Test {}
    `,
    messages: [
      {
        char: '~',
        messageId,
      },
      {
        char: '^',
        messageId,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'Fails when there are duplicate exports in NgModule',
    annotatedSource: `
      @NgModule({
        exports: [ExportA, ExportB, ExportA, ExportB]
                                    ~~~~~~~  ^^^^^^^
      })
      class Test {}
    `,
    messages: [
      {
        char: '~',
        messageId,
      },
      {
        char: '^',
        messageId,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'Fails when there are duplicate imports in Component',
    annotatedSource: `
      @Component({
        imports: [ImportA, ImportB, ImportA, ImportB]
                                    ~~~~~~~  ^^^^^^^
      })
      class Test {}
    `,
    messages: [
      {
        char: '~',
        messageId,
      },
      {
        char: '^',
        messageId,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'Fails when there are duplicate providers in Directive',
    annotatedSource: `
      @Directive({
        providers: [ProviderA, ProviderB, ProviderA, ProviderB]
                                          ~~~~~~~~~  ^^^^^^^^^
      })
      class Test {}
    `,
    messages: [
      {
        char: '~',
        messageId,
      },
      {
        char: '^',
        messageId,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'Fails when there are duplicate imports (newline) in NgModule',
    annotatedSource: `
      @NgModule({
        imports: [
          ImportA,
          ImportB,
          ImportA,
          ~~~~~~~
          ImportB,
          ^^^^^^^
          ImportA
          #######
        ]
      })
      class Test {}
    `,
    messages: [
      {
        char: '~',
        messageId,
      },
      {
        char: '^',
        messageId,
      },
      {
        char: '#',
        messageId,
      },
    ],
  }),
];
