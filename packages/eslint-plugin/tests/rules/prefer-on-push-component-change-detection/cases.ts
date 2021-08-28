import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/prefer-on-push-component-change-detection';

const messageId: MessageIds = 'preferOnPushComponentChangeDetection';

export const valid = [
  // should succeed if ChangeDetectionStrategy.OnPush is set
  `
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class Test {}
    `,
];

export const invalid = [
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
    description: 'should fail if no ChangeDetectionStrategy is explicitly set',
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
];
