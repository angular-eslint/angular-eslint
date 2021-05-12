import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/prefer-on-push-component-change-detection';
import rule, {
  RULE_NAME,
} from '../../src/rules/prefer-on-push-component-change-detection';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'preferOnPushComponentChangeDetection';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // should succeed if ChangeDetectionStrategy.OnPush is set
    `
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class Test {}
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ChangeDetectionStrategy.Default is set',
      annotatedSource: `
      @Component({
        changeDetection: ChangeDetectionStrategy.Default
                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      })
      class Test {}
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if no ChangeDetectionStrategy is explicitly set',
      annotatedSource: `
      @Component({
      ~~~~~~~~~~~~
        selector: 'foo'
      })
      ~~
      class Test {}
      `,
      messageId,
    }),
  ],
});
