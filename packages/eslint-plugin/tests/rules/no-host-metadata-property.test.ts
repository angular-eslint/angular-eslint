import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-host-metadata-property';
import rule, { RULE_NAME } from '../../src/rules/no-host-metadata-property';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});
const messageId: MessageIds = 'noHostMetadataProperty';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Component({
      selector: 'app-test',
      template: 'Hello'
    })
    class Test {}
    `,
    `
    @Directive({
      selector: 'app-test'
    })
    class Test {}
    `,
    {
      code: `
        @Component({
          host: {
            shorthand,
            [computed]: 'test',
            static: true,
            'class': 'class1'
          },
          selector: 'app-test'
        })
        class Test {}
      `,
      options: [{ allowStatic: true }],
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if "host" metadata property is used in @Component',
      annotatedSource: `
        @Component({
          host: {
          ~~~~~~~
            class: 'my-class',
            [type]: 'test',
            '(click)': 'bar()'
          },
          ~
          selector: 'app-test'
        })
        class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if "host" metadata property is used in @Directive',
      annotatedSource: `
        @Directive({
          host: {
          ~~~~~~~
            class: 'my-class',
            [type]: 'test',
            '(click)': 'bar()'
          },
          ~
          selector: 'app-test'
        })
        class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if non-static properties are used with `allowStatic` option',
      annotatedSource: `
        @Directive({
          host: {
            shorthand,
            [computed]: 'test',
            static: true,
            'class': 'class1',
            '(click)': 'bar()',
            ~~~~~~~~~~~~~~~~~~
            '[attr.role]': role
            ^^^^^^^^^^^^^^^^^^^
          },
          selector: 'app-test'
        })
        class Test {}
      `,
      messages: [
        { char: '~', messageId },
        { char: '^', messageId },
      ],
      options: [{ allowStatic: true }],
    }),
  ],
});
