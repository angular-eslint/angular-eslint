import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/no-pipe-impure';

const messageId: MessageIds = 'noPipeImpure';
const suggestRemovePipeImpure: MessageIds = 'suggestRemovePipeImpure';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `class Test {}`,
  `
    @Pipe()
    class Test {}
  `,
  `
    @Pipe({})
    class Test {}
  `,
  `
    const options = {};
    @Pipe(options)
    class Test {}
  `,
  `
    @Pipe({
      name: 'test',
    })
    class Test {}
  `,
  `
    @Pipe({
      pure: true
    })
    class Test {}
  `,
  `
    @Pipe({
      'pure': !0,
    })
    class Test {}
  `,
  `
    @Pipe({
      ['pure']: !!isPure(),
    })
    class Test {}
  `,
  `
    const pure = 'pure';
    @Pipe({
      [pure]: false
    })
    class Test {}
  `,
  `
    const pure = false;
    @Pipe({
      pure,
    })
    class Test {}
  `,
  `
    function isPure() {
      return false;
    }

    @Pipe({
      [\`pure\`]: isPure(),
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

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `pure` property is set to `false`',
    annotatedSource: `
      @Pipe({
        pure: false
        ~~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemovePipeImpure,
        output: `
      @Pipe({
        
        
      })
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `pure` metadata property's key is `Literal` and its value is set to `false`",
    annotatedSource: `
      @Pipe({
        name: 'test',
        'pure': false,
        ~~~~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemovePipeImpure,
        output: `
      @Pipe({
        name: 'test',
        
        
      })
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `pure` metadata property's key is computed `TemplateLiteral` and its value is set to `!true`",
    annotatedSource: `
      @Pipe({
        name: 'test',
        ['pure']: !true
        ~~~~~~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemovePipeImpure,
        output: `
      @Pipe({
        name: 'test',
        
        
      })
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `pure` metadata property's key is computed `TemplateLiteral` and its value is set to `false`",
    annotatedSource: `
      @Pipe({
        name: 'test',
        [\`pure\`]: false
        ~~~~~~~~~~~~~~~
      })
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemovePipeImpure,
        output: `
      @Pipe({
        name: 'test',
        
        
      })
      class Test {}
    `,
      },
    ],
  }),
];
