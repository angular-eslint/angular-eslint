import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-inputs-metadata-property';
import rule, { RULE_NAME } from '../../src/rules/no-inputs-metadata-property';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});
const messageId: MessageIds = 'noInputsMetadataProperty';

ruleTester.run(RULE_NAME, rule, {
  valid: [
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
    const inputs = 'providers';
    @Directive({
      [inputs]: [],
    })
    class Test {}
    `,
    `
    @NgModule({
      bootstrap: [Foo]
    })
    class Test {}
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if `inputs` metadata property is used in `@Component`',
      annotatedSource: `
        @Component({
          inputs: [
          ~~~~~~~~~
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
        'should fail if `inputs` metadata property is used in `@Directive`',
      annotatedSource: `
        @Directive({
          inputs: [
          ~~~~~~~~~
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
      description: 'should fail if `inputs` metadata property is shorthand',
      annotatedSource: `
        @Component({
          inputs,
          ~~~~~~
        })
        class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if `inputs` metadata property has no properties',
      annotatedSource: `
        @Component({
          inputs: [],
          ~~~~~~~~~~
        })
        class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        "should fail if `inputs` metadata property's value is a variable",
      annotatedSource: `
        const test = [];
        @Component({
          inputs: test,
          ~~~~~~~~~~~~
        })
        class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        "should fail if `inputs` metadata property's value is `undefined`",
      annotatedSource: `
        @Component({
          inputs: undefined,
          ~~~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        "should fail if `inputs` metadata property's key is `Literal` and its value is a function",
      annotatedSource: `
        function inputs() {
          return [];
        }

        @Directive({
          'inputs': inputs(),
          ~~~~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
      messageId,
    }),
  ],
});
