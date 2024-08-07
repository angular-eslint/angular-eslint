import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-outputs-metadata-property';

const messageId: MessageIds = 'noOutputsMetadataProperty';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `class Test {}`,
  `
    @Component()
    class Test {}
    `,
  `
    @Directive({})
    class Test {}
    `,
  `
    const options = {};
    @Component(options)
    class Test {}
    `,
  `
    @Directive({
      selector: 'app-test',
      template: 'Hello'
    })
    class Test {}
    `,
  `
    @Component({
      selector: 'app-test',
      queries: {},
    })
    class Test {}
    `,
  `
    const outputs = 'providers';
    @Directive({
      [outputs]: [],
    })
    class Test {}
    `,
  `
    @NgModule({
      bootstrap: [Foo]
    })
    class Test {}
    `,
  /**
   * Renaming outputs when using the directive composition API is not a bad practice
   * https://angular.dev/guide/directives/directive-composition-api
   */
  `
    @Component({
      selector: 'foo',
      hostDirectives: [{
        directive: CdkMenuItem,
        outputs: ['cdkMenuItemTriggered: triggered'],
      }]
    })
    class Test {}
  `,
  `
    @Component({
      selector: 'foo',
      'hostDirectives': [{
        directive: CdkMenuItem,
        outputs: ['cdkMenuItemTriggered: triggered'],
      }]
    })
    class Test {}
  `,
  `
    @Component({
      selector: 'foo',
      ['hostDirectives']: [{
        directive: CdkMenuItem,
        outputs: ['cdkMenuItemTriggered: triggered'],
      }]
    })
    class Test {}
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `outputs` metadata property is used in `@Component`',
    annotatedSource: `
        @Component({
          outputs: [
          ~~~~~~~~~~
            'id: foo'
          ],
          ~
          selector: 'app-test'
        })
        class Test {}
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `outputs` metadata property is used in `@Directive`',
    annotatedSource: `
        @Directive({
          outputs: [
          ~~~~~~~~~~
            'id: foo'
          ],
          ~
          selector: 'app-test'
        })
        class Test {}
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `outputs` metadata property is shorthand',
    annotatedSource: `
        @Component({
          outputs,
          ~~~~~~~
        })
        class Test {}
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `outputs` metadata property has no properties',
    annotatedSource: `
        @Directive({
          outputs: [],
          ~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `outputs` metadata property's key is `Literal` and its value is a variable",
    annotatedSource: `
        const test = [];
        @Component({
          'outputs': test,
          ~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `outputs` metadata property's key is computed `Literal` and its value is `undefined`",
    annotatedSource: `
        @Directive({
          ['outputs']: undefined,
          ~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `outputs` metadata property's key is computed `TemplateLiteral` and its value is a function",
    annotatedSource: `
        function outputs() {
          return [];
        }

        @Component({
          [\`outputs\`]: outputs(),
          ~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId,
  }),
];
