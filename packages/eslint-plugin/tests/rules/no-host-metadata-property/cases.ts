import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/no-host-metadata-property';

const messageId: MessageIds = 'noHostMetadataProperty';

export const valid = [
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
        const shorthand = 'testing';

        @Component({
          host: {
            shorthand,
            static: true,
            'class': 'class1',
            '[@routerTransition]': ''
          },
          selector: 'app-test'
        })
        class Test {}
      `,
    options: [{ allowStatic: true }],
  },
];

export const invalid = [
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
        const computed = '[class]';

        @Directive({
          host: {
            [computed]: 'test',
            ~~~~~~~~~~~~~~~~~~
            static: true,
            'class': 'class1',
            '(click)': 'bar()',
            ^^^^^^^^^^^^^^^^^^
            '[attr.role]': role,
            ###################
            '[@routerTransition]': 'test'
            %%%%%%%%%%%%%%%%%%%%%%%%%%%%%
          },
          selector: 'app-test'
        })
        class Test {}
      `,
    messages: [
      { char: '~', messageId },
      { char: '^', messageId },
      { char: '#', messageId },
      { char: '%', messageId },
    ],
    options: [{ allowStatic: true }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail if "host" metadata property is shorthand',
    annotatedSource: `
        @Component({
          host,
          ~~~~
          selector: 'app-test'
        })
        class Test {}
      `,
    messageId,
    options: [{ allowStatic: true }],
  }),
];
