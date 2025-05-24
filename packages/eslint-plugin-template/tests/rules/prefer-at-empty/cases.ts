import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/prefer-at-empty';

const messageId: MessageIds = 'preferAtEmpty';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `@for (item of items; track $index) {}`,
  `@for (item of items; track $index) {} @empty {}`,
  `
    @if (alpha.length > 0) {
      @for (item of beta; track $index) {}
    } @else {
      No items
    }
  `,
  `
    @if (items.length > 0) {
      Items:
      @for (item of items; track $index) {}
    } @else {
      No items
    }
  `,
  `
    @if (items.length === 0) {
      No items
    } @else {
      Items:
      @for (item of items; track $index) {}
    }
  `,
  `
    @if (items.length > 0) {
      @for (item of items; track $index) {}
      Total: {{ $count }}
    } @else {
      No items
    }
  `,
  `
    @if (items.length === 0) {
      No items
    } @else {
      @for (item of items; track $index) {}
      Total: {{ $count }}
    }
  `,
  `
    @if (items.length > 0) {
      @for (item of items; track $index) {}
    }
    @if (items.length > 0) {
      Not empty
    }
  `,
  `
    @if (items.length > 0) {
      @for (item of items; track $index) {}
    }
    ---
    @if (items.length === 0) {
      Not empty
    }
  `,
  `
    @for (item of items; track $index) {}
    ---
    @if (items.length === 0) {
      Not empty
    }
  `,
  `
    @for (item of items; track $index) {}
    @if (items.length > 0) {
      Not empty
    }
  `,
  `
    @if (items.length > 0) {
      Not empty
    }
    @for (item of items; track $index) {}
  `,
  `
    @if (beta.length > 0) {
      @for (item of alpha; track $index) {}
      @for (item of beta; track $index) {}
    } @else {
      Empty
    }
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  ...[
    'items.length === 0',
    'items.length == 0',
    '0 === items.length',
    '0 == items.length',
    '!items.length',
  ].map(
    (condition): InvalidTestCase<MessageIds, Options> =>
      convertAnnotatedSourceToFailureCase({
        description: `fails when '@for' block is followed by '@if (${condition})'`,
        annotatedSource: `
          @for (item of items; track $index) {}
          @if (${condition}) {
          ~~~~
            No items
          }
        `,
        messageId,
        annotatedOutput: `
          @for (item of items; track $index) {}
          @empty {
          
            No items
          }
        `,
      }),
  ),
  ...[
    'items.length === 0',
    'items.length == 0',
    '0 === items.length',
    '0 == items.length',
    '!items.length',
  ].map(
    (condition): InvalidTestCase<MessageIds, Options> =>
      convertAnnotatedSourceToFailureCase({
        description: `fails when '@for' block is followed by '@if (${condition})'`,
        annotatedSource: `
          @if (${condition}) {
          ~~~~
            No items
          }
          @for (item of items; track $index) {}
        `,
        messageId,
        annotatedOutput: `
          
          @for (item of items; track $index) {} @empty {
          
            No items
          }
        `,
      }),
  ),
  ...[
    'items.length > 0',
    'items.length !== 0',
    'items.length != 0',
    '0 < items.length',
    '0 !== items.length',
    '0 != items.length',
    'items.length',
  ].map(
    (condition): InvalidTestCase<MessageIds, Options> =>
      convertAnnotatedSourceToFailureCase({
        description: `fails when '@for' block is in '@if (${condition})' block`,
        annotatedSource: `
          @if (${condition}) {
          ~~~~
            @for (item of items; track $index) {}
          } @else {
            No items
          }
        `,
        messageId,
        annotatedOutput: `
          
          
            @for (item of items; track $index) {}
          @empty {
            No items
          }
        `,
      }),
  ),
  ...[
    'items.length === 0',
    'items.length == 0',
    '0 === items.length',
    '0 == items.length',
    '!items.length',
  ].map(
    (condition): InvalidTestCase<MessageIds, Options> =>
      convertAnnotatedSourceToFailureCase({
        description: `fails when '@for' block is in '@else' block of '@if (${condition})'`,
        annotatedSource: `
          @if (${condition}) {
          ~~~~
            No items
          } @else {
            @for (item of items; track $index) {}
          }
        `,
        messageId,
        annotatedOutput: `
          
            @for (item of items; track $index) {} @empty {
          
            No items
          
          }
        `,
      }),
  ),
  convertAnnotatedSourceToFailureCase({
    description: `fails when '@for' block is in '@if (items.length > 0)' and is followed by '@if (items.length === 0)'`,
    annotatedSource: `
      @if (items.length > 0) {
      ~~~~
        @for (item of items; track $index) {}
      }
      @if (items.length === 0) {
        No items
      }
    `,
    messageId,
    annotatedOutput: `
      
      
        @for (item of items; track $index) {} @empty {
        No items
      }
      
      
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `fails when '@if (items.length === 0)' is followed by '@if (items.length > 0)' block that contains the '@for' block`,
    annotatedSource: `
      @if (items.length === 0) {
        No items
      }
      @if (items.length > 0) {
      ~~~~
        @for (item of items; track $index) {}
      }
    `,
    messageId,
    annotatedOutput: `
      
      
      
        @for (item of items; track $index) {} @empty {
        No items
      
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `fails when '@for' block inside '@if' block with '@else if' branch`,
    annotatedSource: `
      @if (items.length > 0) {
      ~~~~
        @for (item of items; track $index) {}
      } @else if (condition) {
       Condition is true
      } @else {
       Condition is false
      }
    `,
    messageId,
    annotatedOutput: `
      
      
        @for (item of items; track $index) {}
      @empty { @if (condition) {
       Condition is true
      } @else {
       Condition is false
      }}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `fails when comment separates '@for' block and '@if' block`,
    annotatedSource: `
      @for (item of items; track $index) {}
      <!-- comment -->
      @if (items.length === 0) {
      ~~~~
        No items
      }
    `,
    messageId,
    annotatedOutput: `
      @for (item of items; track $index) {}
      <!-- comment -->
      @empty {
      
        No items
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `fails when '@for' block is separated from '@if' block by &nbsp;`,
    annotatedSource: `
      <!-- The Angular compiler will ignore the space between the two blocks. -->
      @for (item of items; track $index) {}
      &nbsp;
      @if (items.length === 0) {
      ~~~~
        Not empty
      }
    `,
    messageId,
    annotatedOutput: `
      <!-- The Angular compiler will ignore the space between the two blocks. -->
      @for (item of items; track $index) {}
      &nbsp;
      @empty {
      
        Not empty
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `'@empty' block already exists and '@if' block is before it`,
    annotatedSource: `
      @if (items.length === 0) {
      ~~~~
        Not empty
      }
      @for (item of items; track $index) {}
      @empty {
        Existing
      }
    `,
    messageId,
    annotatedOutput: `
      
      @for (item of items; track $index) {}
      @empty {
      ~~~~
        Not empty
      
        Existing
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `'@empty' block already exists and '@if' block is after it`,
    annotatedSource: `
      @for (item of items; track $index) {}
      @empty {
        Existing
      }
      @if (items.length === 0) {
      ~~~~
        Not empty
      }
    `,
    messageId,
    annotatedOutput: `
      @for (item of items; track $index) {}
      @empty {
        Existing
      
      
      
        Not empty
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `replaces '@empty' block when '@for' block is inside '@if' block`,
    annotatedSource: `
      @if (items.length > 0) {
      ~~~~
        @for (item of items; track $index) {}
        @empty {
          Existing
        }
      } @else {
        Empty
      }
    `,
    messageId,
    annotatedOutput: `
      
      
        @for (item of items; track $index) {}
        
      @empty {
        Empty
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `replaces '@empty' block when '@for' block is inside '@else' block`,
    annotatedSource: `
      @if (items.length === 0) {
      ~~~~
        Empty
      } @else {
        @for (item of items; track $index) {}
        @empty {
          Existing
        }
      }
    `,
    messageId,
    annotatedOutput: `
      
        @for (item of items; track $index) {}
        @empty {
      
        Empty
      }
      
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `adds '@empty' block when '@for' block without '@empty' block is inside '@else' block`,
    annotatedSource: `
      @if (items.length === 0) {
      ~~~~
        Empty
      } @else {
        @for (item of items; track $index) {}
      }
    `,
    messageId,
    annotatedOutput: `
      
        @for (item of items; track $index) {} @empty {
      
        Empty
      
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `comments around '@for' block in '@if' block are kept`,
    annotatedSource: `
      @if (items.length > 0) {
      ~~~~
        <!-- before -->
        @for (item of items; track $index) {}
        <!-- after -->
      } @else {
        Empty
      }
    `,
    messageId,
    annotatedOutput: `
      
      
        <!-- before -->
        @for (item of items; track $index) {}
        <!-- after -->
      @empty {
        Empty
      }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `comments around '@for' block in '@else' block are kept`,
    annotatedSource: `
      @if (items.length === 0) {
      ~~~~
        Empty
      } @else {
        <!-- before -->
        @for (item of items; track $index) {}
        <!-- after -->
      }
    `,
    messageId,
    annotatedOutput: `
      
        <!-- before -->
        @for (item of items; track $index) {} @empty {
      
        Empty
      
        <!-- after -->
      }
    `,
  }),
  // TODO(reduckted): currently producing a parse error because of the extra brace in the fixed output
  // convertAnnotatedSourceToFailureCase({
  //   description: `replaces '@empty' block when '@for' block is inside '@else' block`,
  //   annotatedSource: `
  //     @if (items.length === 0) {
  //     ~~~~
  //       Empty
  //     } @else {
  //       @for (item of items; track $index) {}
  //       @empty {
  //         Existing
  //       }
  //     }
  //   `,
  //   messageId,
  //   annotatedOutput: `

  //       @for (item of items; track $index) {}
  //       @empty {

  //       Empty
  //     }
  //     }
  //   `,
  // }),
];
