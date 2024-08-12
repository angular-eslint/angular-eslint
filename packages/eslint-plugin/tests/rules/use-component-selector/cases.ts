import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/use-component-selector';

const messageId: MessageIds = 'useComponentSelector';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // It should succeed with single quotes
  `
    @Component({
      selector: 'sg-bar-foo'
    })
    class Test {}
`,
  // It should succeed with double quotes
  `
  @Component({
    selector: "sg-bar-foo"
  })
  class Test {}
`,
  // It should succeed with template literals
  `
    @Component({
      selector: \`sg-bar-foo\`
    })
    class Test {}
`,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
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
