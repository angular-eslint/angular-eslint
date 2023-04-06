import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/prefer-standalone-component';

const messageId: MessageIds = 'preferStandaloneComponent';

export const valid = [
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
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a component does not have the standalone property in the decorator',
    annotatedSource: `
        @Component({})
        ~~~~~~~~~~~~~~
        class Test {}
      `,
    messageId,
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
    annotatedOutput: `
        @Component({
        
        standalone: true,selector: 'my-selector',
        
        template: '<div></div>'
        
        })
        
        class Test {}
`,
  }),
];
