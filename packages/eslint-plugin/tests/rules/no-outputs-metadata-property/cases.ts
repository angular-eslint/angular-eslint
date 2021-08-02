import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/no-outputs-metadata-property';

const messageId: MessageIds = 'noOutputsMetadataProperty';

export const valid = [
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
];

export const invalid = [
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
