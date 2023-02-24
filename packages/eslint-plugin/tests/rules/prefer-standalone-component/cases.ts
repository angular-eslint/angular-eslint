import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/prefer-standalone-component';

const messageId: MessageIds = 'preferStandaloneComponent';
const suggestAddStandalone: MessageIds = 'suggestAddStandalone';

export const valid = [
  `
    @Component({
      standalone: true,
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
    suggestions: [
      {
        messageId: suggestAddStandalone,
        output: `
        @Component({standalone: true})
        
        class Test {}
      `,
      },
    ],
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
    suggestions: [
      {
        messageId: suggestAddStandalone,
        output: `
        @Component({ standalone: true })
        
        class Test {}
      `,
      },
    ],
  }),
];
