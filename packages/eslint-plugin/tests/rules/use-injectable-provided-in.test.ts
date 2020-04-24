import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/use-injectable-provided-in';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'useInjectableProvidedIn';

ruleTester.run(RULE_NAME, rule, {
  valid: [
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
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if providedIn property is not set',
      annotatedSource: `
        @Injectable()
        ~~~~~~~~~~~~~
        class Test {}
      `,
      messageId,
    }),
  ],
});
