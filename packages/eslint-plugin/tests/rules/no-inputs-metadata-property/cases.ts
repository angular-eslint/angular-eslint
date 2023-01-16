import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/no-inputs-metadata-property';

const messageId: MessageIds = 'noInputsMetadataProperty';

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
  /**
   * Using inputs when using the directive composition API is not a bad practice
   * https://angular.io/guide/directive-composition-api
   * https://www.youtube.com/watch?v=EJJwyyjsRGs
   */
  `
   @Component({
     selector: 'qx-menuitem',
     hostDirectives: [{
       directive: CdkMenuItem,
       inputs: ['cdkMenuItemDisabled: disabled'],
     }]
   })
   class Test {}
 `,
  `
   @Component({
     selector: 'qx-menuitem',
     'hostDirectives': [{
       directive: CdkMenuItem,
       inputs: ['cdkMenuItemDisabled: disabled'],
     }]
   })
   class Test {}
 `,
  `
   @Component({
     selector: 'qx-menuitem',
     ['hostDirectives']: [{
       directive: CdkMenuItem,
       inputs: ['cdkMenuItemDisabled: disabled'],
     }]
   })
   class Test {}
 `,
];

export const invalid = [
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
    description: 'should fail if `inputs` metadata property has no properties',
    annotatedSource: `
      @Directive({
        inputs: [],
        ~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `inputs` metadata property's key is `Literal` and its value is a variable",
    annotatedSource: `
      const test = [];
      @Component({
        'inputs': test,
        ~~~~~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `inputs` metadata property's key is computed `Literal` and its value is `undefined`",
    annotatedSource: `
      @Directive({
        ['inputs']: undefined,
        ~~~~~~~~~~~~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `inputs` metadata property's key is computed `TemplateLiteral` and its value is a function",
    annotatedSource: `
      function inputs() {
        return [];
      }

      @Component({
        [\`inputs\`]: inputs(),
        ~~~~~~~~~~~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
  }),
];
