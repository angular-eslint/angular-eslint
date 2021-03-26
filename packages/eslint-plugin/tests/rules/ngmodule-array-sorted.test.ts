import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/ngmodule-array-sorted';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageIdSortFailure: MessageIds = 'sortedFailure';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
      @NgModule({
        imports: [
            _foo,
            AModule,
            bModule,
            cModule,
            DModule,
        ],
        bootstrap: [
            AppModule1,
            AppModule2,
            AppModule3,
        ],
        declarations: [
            AComponent,
            bDirective,
            cPipe,
            DComponent
        ],
        providers: [
            AProvider,
            {
              provide : 'myprovider',
              useClass : MyProvider,
            },
            bProvider,
            cProvider,
            DProvider,
        ],
      })
      class Test {}
      `,
      options: [],
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if imports array is not sorted ASC',
      annotatedSource: `
      @NgModule({
        imports: [
            aModule,
            bModule,
            DModule,
            ~~~~~~~
            cModule,
        ]
      })
      class Test {}
      `,
      messageId: messageIdSortFailure,
      options: [],
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if declarations array is not sorted ASC',
      annotatedSource: `
      @NgModule({
        declarations: [
            AComponent,
            cPipe,
            ~~~~~
            bDirective,
            DComponent
        ],
      })
      class Test {}
      `,
      messageId: messageIdSortFailure,
      options: [],
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if exports array is not sorted ASC',
      annotatedSource: `
      @NgModule({
        exports: [
            AComponent,
            cPipe,
            ~~~~~
            bDirective,
            DComponent
        ],
      })
      class Test {}
      `,
      messageId: messageIdSortFailure,
      options: [],
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if bootstrap array is not sorted ASC',
      annotatedSource: `
      @NgModule({
        bootstrap: [
            AppModule2,
            ~~~~~~~~~~
            AppModule1,
            AppModule3,
        ]
      })
      class Test {}
      `,
      messageId: messageIdSortFailure,
      options: [],
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if providers array is not sorted ASC, but ignore objects',
      annotatedSource: `
      @NgModule({
        imports: [
            AProvider,
            {
              provide : 'myprovider',
              useClass : MyProvider,
            },
            cProvider,
            ~~~~~~~~~
            bProvider,
            DProvider,
        ]
      })
      class Test {}
      `,
      messageId: messageIdSortFailure,
      options: [],
    }),
  ],
});
