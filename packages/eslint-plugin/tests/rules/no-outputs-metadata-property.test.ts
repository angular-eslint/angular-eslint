import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-outputs-metadata-property';
import rule, { RULE_NAME } from '../../src/rules/no-outputs-metadata-property';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});
const messageId: MessageIds = 'noOutputsMetadataProperty';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Directive()
    class Test {}
    `,
    `
    const options = {};
    @Component(options)
    export class Test {}
    `,
    `
    @Component({
      selector: 'app-test',
      template: 'Hello'
    })
    class Test {}
    `,
    `
    @Directive({
      selector: 'app-test',
      queries: {},
    })
    class Test {}
    `,
    `
    const outputs = 'host';
    @Component({
      [outputs]: [],
    })
    class Test {}
    `,
    `
    @NgModule({
      bootstrap: [Foo]
    })
    export class Test {}
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if "outputs" metadata property is used in `@Component`',
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
        'it should fail if "outputs" metadata property is used in `@Directive`',
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
      description: 'it should fail if "outputs" metadata property is shorthand',
      annotatedSource: `
        @Component({
          outputs,
          ~~~~~~~
        })
        export class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if "outputs" metadata property has no properties',
      annotatedSource: `
        @Component({
          outputs: [],
          ~~~~~~~~~~~
        })
        export class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if "outputs" metadata property\'s value is a variable',
      annotatedSource: `
        const test = [];

        @Component({
          outputs: test,
          ~~~~~~~~~~~~~
        })
        export class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if "outputs" metadata property\'s value is `undefined`',
      annotatedSource: `
        @Component({
          outputs: undefined,
          ~~~~~~~~~~~~~~~~~~
        })
        export class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if "outputs" metadata property\'s value is a function',
      annotatedSource: `
        function outputs() {
          return [];
        }

        @Directive({
          outputs: outputs(),
          ~~~~~~~~~~~~~~~~~~
        })
        export class Test {}
      `,
      messageId,
    }),
  ],
});
