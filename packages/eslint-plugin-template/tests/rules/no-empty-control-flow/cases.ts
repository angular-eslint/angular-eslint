import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-empty-control-flow';

const messageId: MessageIds = 'noEmptyControlFlow';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // @if, @else.
  `@if (a) {
    1
  } @else if (b) {
    2
  } @else {
    3
  }`,
  `@if (a) {
    <!-- a -->
  } @else if (b) {
    <!-- b -->
  } @else {
    <!-- c -->
  }`,
  `@if (a) {
     &nbsp;
  } @else if (b) {
     &nbsp;
  } @else {
     &nbsp;
  }`,

  // @for, @empty.
  `@for (item of items; track item.id) {
    1
  } @empty {
    2
  }`,
  `@for (item of items; track item.id) {
    <!-- a -->
  } @empty {
    <!-- b -->
  }`,
  `@for (item of items; track item.id) {
    &nbsp;
  } @empty {
    &nbsp;
  }`,

  // @switch, @case.
  `@switch (condition) {
    @case (a) {
      1
    }
    @default {
      2
    }
  }`,
  `@switch (condition) {
    @case (a) {
      <!-- a -->
    }
    @default {
      <!-- b -->
    }
  }`,
  `@switch (condition) {
    @case (a) {
      &nbsp;
    }
    @default {
      &nbsp;
    }
  }`,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  // @if, @else.
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @if is empty',
    annotatedSource: `
      @if (a) {} @else if (b) {
      ~~~~
        2
      } @else {
        3
      }`,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @if only contains whitespace',
    annotatedSource: `
      @if (a) {
      ~~~~
      } @else if (b) {
        2
      } @else {
        3
      }`,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @else if is empty',
    annotatedSource: `
      @if (a) {
        1
      } @else if (b) {} @else {
        ~~~~~~~~~
        3
      }`,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @else if only contains whitespace',
    annotatedSource: `
      @if (a) {
        1
      } @else if (b) {
        ~~~~~~~~~
      } @else {
        3
      }`,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @else is empty',
    annotatedSource: `
      @if (a) {
        1
      } @else if (b) {
        2
      } @else {}
        ~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @else only contains whitespace',
    annotatedSource: `
      @if (a) {
        1
      } @else if (b) {
        2
      } @else {
        ~~~~~~
      }
      `,
    messageId,
  }),

  // @for, @empty.
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @for is empty',
    annotatedSource: `
      @for (item of items; track item.id) {} @empty {
      ~~~~~
        2
      }`,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @for only contains whitespace',
    annotatedSource: `
      @for (item of items; track item.id) {
      ~~~~~
      } @empty {
        2
      }`,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @empty is empty',
    annotatedSource: `
      @for (item of items; track item.id) {
        1
      } @empty {}
        ~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @empty only contains whitespace',
    annotatedSource: `
      @for (item of items; track item.id) {
        1
      } @empty {
        ~~~~~~~
      }`,
    messageId,
  }),

  // @switch, @case.
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @switch is empty',
    annotatedSource: `
      @switch (condition) {}
      ~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @switch only contains whitespace',
    annotatedSource: `
      @switch (condition) {
      ~~~~~~~~
      }`,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @case is empty',
    annotatedSource: `
      @switch (condition) {
        @case (a) {}
        ~~~~~~
        @default {
          2
        }
      }`,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @case only contains whitespace',
    annotatedSource: `
      @switch (condition) {
        @case (a) {
        ~~~~~~
        }
        @default {
          2
        }
      }`,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @default is empty',
    annotatedSource: `
      @switch (condition) {
        @case (a) {
          1
        }
        @default {}
        ~~~~~~~~~
      }`,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when @default only contains whitespace',
    annotatedSource: `
      @switch (condition) {
        @case (a) {
          1
        }
        @default {
        ~~~~~~~~~
        }
      }`,
    messageId,
  }),
];
