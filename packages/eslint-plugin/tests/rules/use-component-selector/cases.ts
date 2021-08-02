import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/use-component-selector';

const messageId: MessageIds = 'useComponentSelector';

export const valid = [
  `
    @Component({
      selector: 'sg-bar-foo'
    })
    class Test {}
`,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail when selector is not given in @Component',
    annotatedSource: `
        @Component()
        ~~~~~~~~~~~~
        class Test {}
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail when selector is not given in @Component',
    annotatedSource: `
        @Component()
        ~~~~~~~~~~~~
        class Test {}
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail when selector is empty in @Component',
    annotatedSource: `
        @Component({
        ~~~~~~~~~~~~
          selector: ''
        })
        ~~
        class Test {}
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail when selector equals 0 in @Component',
    annotatedSource: `
        @Component({
        ~~~~~~~~~~~~
          selector: 0
        })
        ~~
        class Test {}
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail when selector equals null in @Component',
    annotatedSource: `
        @Component({
        ~~~~~~~~~~~~
          selector: null
        })
        ~~
        class Test {}
      `,
    messageId,
  }),
];
