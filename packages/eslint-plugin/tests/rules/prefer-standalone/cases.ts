import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/prefer-standalone';

const messageId: MessageIds = 'preferStandalone';

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
    annotatedOutput: `
        @Component({  })
                     
        class Test {}
      `,
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
    annotatedOutput: `
        @Component({
          
          
          template: '<div></div>'
        })
        class Test {}
`,
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
    annotatedOutput: `
        @Directive({  })
                     
        class Test {}
      `,
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
    annotatedOutput: `
      @Directive({
        
        
        selector: 'x-selector'
      })
      class Test {}
`,
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
    annotatedOutput: `
        @Pipe({  })
                
        class Test {}
      `,
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
    annotatedOutput: `
        @Pipe({
          
          
          name: 'pipe-name'
        })
        class Test {}
`,
  }),
];
