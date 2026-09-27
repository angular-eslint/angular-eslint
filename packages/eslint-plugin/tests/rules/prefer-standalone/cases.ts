import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/prefer-standalone';

const messageId: MessageIds = 'preferStandalone';
const redundantStandalone: MessageIds = 'redundantStandalone';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    @Component({})
    class Test {}
  `,
  `
    @Component({
      standalone: true,
    })
    class Test {}
  `,
  {
    code: `
    @Component({
      standalone: true,
    })
    class Test {}
  `,
    options: [{ allowExplicitStandalone: true }],
  },
  {
    code: `
    @Component({
      selector: 'test-selector',
    })
    class Test {}
  `,
    options: [{ allowExplicitStandalone: false }],
  },
  `
    @Component({
      selector: 'test-selector'
    })
    class Test {}
  `,
  `
    @Component({
      standalone: true,
      selector: 'test-selector'
    })
    class Test {}
  `,
  `
    @Component({
      selector: 'test-selector',
      template: '<div></div>',
      styleUrls: ['./test.css']
    })
    class Test {}
  `,
  `
    @Component({
      selector: 'test-selector',
      standalone: true,
      template: '<div></div>',
      styleUrls: ['./test.css']
    })
    class Test {}
  `,
  `
    @Directive({})
    class Test {}
  `,
  `
    @Directive({
      standalone: true,
    })
    class Test {}
  `,
  {
    code: `
    @Directive({
      selector: 'test-selector',
    })
    class Test {}
  `,
    options: [{ allowExplicitStandalone: false }],
  },
  `
    @Directive({
      selector: 'test-selector'
    })
    class Test {}
  `,
  `
    @Directive({
      standalone: true,
      selector: 'test-selector'
    })
    class Test {}
  `,
  `
    @Directive({
      selector: 'test-selector',
      providers: []
    })
    class Test {}
  `,
  `
    @Directive({
      selector: 'test-selector',
      standalone: true,
      providers: []
    })
    class Test {}
  `,
  `
    @Directive()
    abstract class Test {}
  `,
  `
    @Pipe({})
    class Test {}
  `,
  `
    @Pipe({
      standalone: true,
    })
    class Test {}
  `,
  {
    code: `
    @Pipe({
      name: 'test-pipe',
    })
    class Test {}
  `,
    options: [{ allowExplicitStandalone: false }],
  },
  `
    @Pipe({
      name: 'test-pipe'
    })
    class Test {}
  `,
  `
    @Pipe({
      standalone: true,
      name: 'test-pipe'
    })
    class Test {}
  `,
  `
    @Pipe({
      name: 'my-pipe',
      pure: true
    })
    class Test {}
  `,
  `
    @Pipe({
      name: 'my-pipe',
      standalone: true,
      pure: true
    })
    class Test {}
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a component has the standalone property set to false in the decorator',
    annotatedSource: `
        @Component({ standalone: false })
                     ~~~~~~~~~~~~~~~~~
        class Test {}
      `,
    messageId,
    data: { type: 'component' },
    suggestions: [
      {
        messageId: 'removeStandaloneFalse',
        output: `
        @Component({  })
                     
        class Test {}
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a component has the standalone property set to false in a decorator with multiple properties',
    annotatedSource: `
        @Component({
          standalone: false,
          ~~~~~~~~~~~~~~~~~
          template: '<div></div>'
        })
        class Test {}
`,
    messageId,
    data: { type: 'component' },
    suggestions: [
      {
        messageId: 'removeStandaloneFalse',
        output: `
        @Component({
          
          
          template: '<div></div>'
        })
        class Test {}
`,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a directive has the standalone property set to false in the decorator',
    annotatedSource: `
        @Directive({ standalone: false })
                     ~~~~~~~~~~~~~~~~~
        class Test {}
      `,
    messageId,
    data: { type: 'directive' },
    suggestions: [
      {
        messageId: 'removeStandaloneFalse',
        output: `
        @Directive({  })
                     
        class Test {}
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a directive has the standalone property set to false in a decorator with multiple properties',
    annotatedSource: `
      @Directive({
        standalone: false,
        ~~~~~~~~~~~~~~~~~
        selector: 'x-selector'
      })
      class Test {}
`,
    messageId,
    data: { type: 'directive' },
    suggestions: [
      {
        messageId: 'removeStandaloneFalse',
        output: `
      @Directive({
        
        
        selector: 'x-selector'
      })
      class Test {}
`,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a pipe has the standalone property set to false in the decorator',
    annotatedSource: `
        @Pipe({ standalone: false })
                ~~~~~~~~~~~~~~~~~
        class Test {}
      `,
    messageId,
    data: { type: 'pipe' },
    suggestions: [
      {
        messageId: 'removeStandaloneFalse',
        output: `
        @Pipe({  })
                
        class Test {}
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a pipe has the standalone property set to false in a decorator with multiple properties',
    annotatedSource: `
        @Pipe({
          standalone: false,
          ~~~~~~~~~~~~~~~~~
          name: 'pipe-name'
        })
        class Test {}
`,
    messageId,
    data: { type: 'pipe' },
    suggestions: [
      {
        messageId: 'removeStandaloneFalse',
        output: `
        @Pipe({
          
          
          name: 'pipe-name'
        })
        class Test {}
`,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should still report `standalone: false` when `allowExplicitStandalone` is set to `false`',
    annotatedSource: `
        @Component({ standalone: false })
                     ~~~~~~~~~~~~~~~~~
        class Test {}
      `,
    messageId,
    options: [{ allowExplicitStandalone: false }],
    data: { type: 'component' },
    suggestions: [
      {
        messageId: 'removeStandaloneFalse',
        output: `
        @Component({  })
                     
        class Test {}
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and autofix redundant `standalone: true` on a component when `allowExplicitStandalone` is `false`',
    annotatedSource: `
        @Component({ standalone: true })
                     ~~~~~~~~~~~~~~~~
        class Test {}
      `,
    messageId: redundantStandalone,
    options: [{ allowExplicitStandalone: false }],
    annotatedOutput: `
        @Component({  })
                     
        class Test {}
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and autofix redundant `standalone: true` followed by another property',
    annotatedSource: `
        @Component({ standalone: true, selector: 'app-test' })
                     ~~~~~~~~~~~~~~~~
        class Test {}
      `,
    messageId: redundantStandalone,
    options: [{ allowExplicitStandalone: false }],
    annotatedOutput: `
        @Component({ selector: 'app-test' })
                     
        class Test {}
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and autofix redundant `standalone: true` preceded by another property',
    annotatedSource: `
        @Component({ selector: 'app-test', standalone: true })
                                           ~~~~~~~~~~~~~~~~
        class Test {}
      `,
    messageId: redundantStandalone,
    options: [{ allowExplicitStandalone: false }],
    annotatedOutput: `
        @Component({ selector: 'app-test', })
                                           
        class Test {}
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not delete an adjacent comment when autofixing redundant `standalone: true`',
    annotatedSource: `
        @Component({
          standalone: true,
          ~~~~~~~~~~~~~~~~
          // keep this comment
          selector: 'app-test',
        })
        class Test {}
      `,
    messageId: redundantStandalone,
    options: [{ allowExplicitStandalone: false }],
    annotatedOutput: `
        @Component({
          // keep this comment
          selector: 'app-test',
        })
        class Test {}
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and autofix redundant `standalone: true` on a directive when `allowExplicitStandalone` is `false`',
    annotatedSource: `
        @Directive({ standalone: true, selector: '[appTest]' })
                     ~~~~~~~~~~~~~~~~
        class Test {}
      `,
    messageId: redundantStandalone,
    options: [{ allowExplicitStandalone: false }],
    annotatedOutput: `
        @Directive({ selector: '[appTest]' })
                     
        class Test {}
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and autofix redundant `standalone: true` on a pipe when `allowExplicitStandalone` is `false`',
    annotatedSource: `
        @Pipe({ standalone: true, name: 'testPipe' })
                ~~~~~~~~~~~~~~~~
        class Test {}
      `,
    messageId: redundantStandalone,
    options: [{ allowExplicitStandalone: false }],
    annotatedOutput: `
        @Pipe({ name: 'testPipe' })
                
        class Test {}
      `,
  }),
];
