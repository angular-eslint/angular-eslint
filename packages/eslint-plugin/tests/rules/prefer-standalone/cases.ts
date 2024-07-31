import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/prefer-standalone';

const messageId: MessageIds = 'preferStandalone';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    @Component({
      standalone: true,
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
      standalone: true,
      template: '<div></div>',
      styleUrls: ['./test.css']
    })
    class Test {}
  `,
  `
    @Directive({
      standalone: true,
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
      standalone: true,
      providers: []
    })
    class Test {}
  `,
  `
    @Pipe({
      standalone: true,
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
      standalone: true,
      pure: true
    })
    class Test {}
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a component does not have the standalone property in the decorator',
    annotatedSource: `
        @Component({})
        ~~~~~~~~~~~~~~
        class Test {}
      `,
    messageId,
    data: { type: 'component' },
    annotatedOutput: `
        @Component({standalone: true})
        
        class Test {}
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a component has the standalone property set to false in the decorator',
    annotatedSource: `
        @Component({ standalone: false })
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        class Test {}
      `,
    messageId,
    data: { type: 'component' },
    annotatedOutput: `
        @Component({ standalone: true })
        
        class Test {}
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a component has the standalone property set to false in a decorator with multiple properties',
    annotatedSource: `
        @Component({
        ~~~~~~~~~~~~
        standalone: false,
        ~~~~~~~~~~~~~~~~~~
        template: '<div></div>'
        ~~~~~~~~~~~~~~~~~~~~~~~
        })
        ~~
        class Test {}
`,
    messageId,
    data: { type: 'component' },
    annotatedOutput: `
        @Component({
        
        standalone: true,
        
        template: '<div></div>'
        
        })
        
        class Test {}
`,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a component has no standalone property in a decorator with one property',
    annotatedSource: `
        @Component({
        ~~~~~~~~~~~~
        template: '<div></div>'
        ~~~~~~~~~~~~~~~~~~~~~~~
        })
        ~~
        class Test {}
`,
    messageId,
    data: { type: 'component' },
    annotatedOutput: `
        @Component({
        
        standalone: true,template: '<div></div>'
        
        })
        
        class Test {}
`,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a component has no standalone property in a decorator with multiple properties',
    annotatedSource: `
        @Component({
        ~~~~~~~~~~~~
        selector: 'my-selector',
        ~~~~~~~~~~~~~~~~~~~~~~~
        template: '<div></div>'
        ~~~~~~~~~~~~~~~~~~~~~~~
        })
        ~~
        class Test {}
`,
    messageId,
    data: { type: 'component' },
    annotatedOutput: `
        @Component({
        
        standalone: true,selector: 'my-selector',
        
        template: '<div></div>'
        
        })
        
        class Test {}
`,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a directive does not have the standalone property in the decorator',
    annotatedSource: `
        @Directive({})
        ~~~~~~~~~~~~~~
        class Test {}
      `,
    messageId,
    data: { type: 'directive' },
    annotatedOutput: `
        @Directive({standalone: true})
        
        class Test {}
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a directive has the standalone property set to false in the decorator',
    annotatedSource: `
        @Directive({ standalone: false })
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        class Test {}
      `,
    messageId,
    data: { type: 'directive' },
    annotatedOutput: `
        @Directive({ standalone: true })
        
        class Test {}
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a directive has the standalone property set to false in a decorator with multiple properties',
    annotatedSource: `
      @Directive({
      ~~~~~~~~~~~~
        standalone: false,
        ~~~~~~~~~~~~~~~~~~
        selector: 'x-selector'
        ~~~~~~~~~~~~~~~~~~~~~~
      })
      ~~
      class Test {}
`,
    messageId,
    data: { type: 'directive' },
    annotatedOutput: `
      @Directive({
      
        standalone: true,
        
        selector: 'x-selector'
        
      })
      
      class Test {}
`,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a directive has no standalone property in a decorator with one property',
    annotatedSource: `
      @Directive({
      ~~~~~~~~~~~~
        selector: 'test-selector'
        ~~~~~~~~~~~~~~~~~~~~~~~~~
      })
      ~~
      class Test {}
`,
    messageId,
    data: { type: 'directive' },
    annotatedOutput: `
      @Directive({
      
        standalone: true,selector: 'test-selector'
        
      })
      
      class Test {}
`,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a directive has no standalone property in a decorator with multiple properties',
    annotatedSource: `
      @Directive({
      ~~~~~~~~~~~~
        selector: 'my-selector',
        ~~~~~~~~~~~~~~~~~~~~~~~~
        providers: []
        ~~~~~~~~~~~~~
      })
      ~~
      class Test {}
`,
    messageId,
    data: { type: 'directive' },
    annotatedOutput: `
      @Directive({
      
        standalone: true,selector: 'my-selector',
        
        providers: []
        
      })
      
      class Test {}
`,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a pipe does not have the standalone property in the decorator',
    annotatedSource: `
        @Pipe({})
        ~~~~~~~~~
        class Test {}
      `,
    messageId,
    data: { type: 'pipe' },
    annotatedOutput: `
        @Pipe({standalone: true})
        
        class Test {}
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a pipe has the standalone property set to false in the decorator',
    annotatedSource: `
        @Pipe({ standalone: false })
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        class Test {}
      `,
    messageId,
    data: { type: 'pipe' },
    annotatedOutput: `
        @Pipe({ standalone: true })
        
        class Test {}
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a pipe has the standalone property set to false in a decorator with multiple properties',
    annotatedSource: `
        @Pipe({
        ~~~~~~~
          standalone: false,
          ~~~~~~~~~~~~~~~~~~
          name: 'pipe-name'
          ~~~~~~~~~~~~~~~~~
        })
        ~~
        class Test {}
`,
    messageId,
    data: { type: 'pipe' },
    annotatedOutput: `
        @Pipe({
        
          standalone: true,
          
          name: 'pipe-name'
          
        })
        
        class Test {}
`,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a pipe has no standalone property in a decorator with one property',
    annotatedSource: `
        @Pipe({
        ~~~~~~~
          name: 'test-name'
          ~~~~~~~~~~~~~~~~~
        })
        ~~
        class Test {}
`,
    messageId,
    data: { type: 'pipe' },
    annotatedOutput: `
        @Pipe({
        
          standalone: true,name: 'test-name'
          
        })
        
        class Test {}
`,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a pipe has no standalone property in a decorator with multiple properties',
    annotatedSource: `
        @Pipe({
        ~~~~~~~
          selector: 'my-selector',
          ~~~~~~~~~~~~~~~~~~~~~~~~
          name: 'test-name'
          ~~~~~~~~~~~~~~~~~
        })
        ~~
        class Test {}
`,
    messageId,
    data: { type: 'pipe' },
    annotatedOutput: `
        @Pipe({
        
          standalone: true,selector: 'my-selector',
          
          name: 'test-name'
          
        })
        
        class Test {}
`,
  }),
];
