import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/require-switch-default';

const messageId: MessageIds = 'requireSwitchDefault';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // A `@switch` with a plain `@default` block.
  `@switch (value) {
    @case (1) {
      one
    }
    @default {
      other
    }
  }`,
  // A `@switch` with only a `@default` block.
  `@switch (value) {
    @default {
      other
    }
  }`,
  // The compile-time exhaustive `@default never` form.
  `@switch (value) {
    @case (1) {
      one
    }
    @default never;
  }`,
  // The `@default never(...)` form with a parameter.
  `@switch (item.kind) {
    @case ('a') {
      a
    }
    @default never(item);
  }`,
  // Multiple cases sharing a group, plus a `@default`.
  `@switch (value) {
    @case (1) {}
    @case (2) {
      one or two
    }
    @default {
      other
    }
  }`,
  // No `@switch` at all.
  `<div>{{ value }}</div>`,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when a `@switch` has no `@default`',
    annotatedSource: `
      @switch (value) {
      ~~~~~~~~
        @case (1) {
          one
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when a `@switch` has multiple cases but no `@default`',
    annotatedSource: `
      @switch (value) {
      ~~~~~~~~
        @case (1) {
          one
        }
        @case (2) {
          two
        }
      }
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail for a nested `@switch` without a `@default`',
    annotatedSource: `
      @switch (outer) {
        @default {
          @switch (inner) {
          ~~~~~~~~
            @case (1) {
              one
            }
          }
        }
      }
    `,
    messageId,
  }),
];
