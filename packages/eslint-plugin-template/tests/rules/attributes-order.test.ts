import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/attributes-order';
import rule, { RULE_NAME } from '../../src/rules/attributes-order';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

const messageId: MessageIds = 'attributesOrder';

ruleTester.run(RULE_NAME, rule, {
  valid: [],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail if structural directive is not first',
      annotatedSource: `
       <app-keks [class]></app-keks>
                 ~~~~~~~~~~~
      `,
    }),
  ],
});
