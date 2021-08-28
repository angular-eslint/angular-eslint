import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/use-injectable-provided-in';

const messageId: MessageIds = 'useInjectableProvidedIn';

export const valid = [
  `
    @Injectable({
      providedIn: 'root'
    })
    class Test {}
`,
  `
    @Injectable({
      providedIn: SomeModule
    })
    class Test {}
`,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'it should fail if providedIn property is not set',
    annotatedSource: `
        @Injectable()
        ~~~~~~~~~~~~~
        class Test {}
      `,
    messageId,
  }),
];
