import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/prefer-contextual-for-variables';

const preferContextualVariable: MessageIds = 'preferContextualVariable';
const preferCount: MessageIds = 'preferCount';
const preferFirst: MessageIds = 'preferFirst';
const preferLast: MessageIds = 'preferLast';
const preferEven: MessageIds = 'preferEven';
const preferOdd: MessageIds = 'preferOdd';

const VARIABLE_NAMES: readonly string[] = [
  '$index',
  '$count',
  '$first',
  '$last',
  '$even',
  '$odd',
];

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `@for (item of items; track item.id) {}`,
  `@for (item of items; track $index) {}`,
  ...VARIABLE_NAMES.map(
    (variable): ValidTestCase<Options> => ({
      options: [{ allowedAliases: { [variable]: ['alpha', 'beta', 'gamma'] } }],
      code: `@for (item of items; track item.id; let beta = ${variable}) {}`,
    }),
  ),
  ...VARIABLE_NAMES.map(
    (variable) => `
    @for (a of outer; track a.id; let outerVar = ${variable}) {
      @for (b of inner; track b.id) {}
    }`,
  ),
  ...VARIABLE_NAMES.map(
    (variable) => `
    @for (a of outer; track a.id) {
      @for (b of inner; track b.id; let innerVar = ${variable}) {}
    }`,
  ),
  ...VARIABLE_NAMES.map(
    (variable) => `
    @for (a of outer; track a.id; let outerVar = ${variable}) {
      @for (b of inner; track b.id; let innerVar = ${variable}) {}
    }`,
  ),
  `
  @for (item of items; track item.id) {}
  {{ items.length }}`,
  `
  @for (a of outer; track a.id) {
    @for (b of inner; track b.id) {
      {{ outer.length }}
    }
  }`,
  `
  @for (a of outer(); track a.id) {
    @for (b of inner(); track b.id) {
      {{ outer().length }}
    }
  }`,
  `
  @for (item of items; track item.id) {
    {{ this.$index === 0 }}
  }`,
  `
  @for (item of items; track item.id) {
    {{ $index === this.$count - 1 }}
  }`,
  `
  @for (item of items; track item.id) {}
  {{ $index % 2 === 0 }}
  `,
  `
  @for (item of items; track item.id) {}
  {{ $index % 2 !== 0 }}
  `,
  `
  @for (item of items; track item.id) {}
  {{ !$even }}
  `,
  `
  @for (item of items; track item.id) {}
  {{ !$odd }}
  `,
  `
  @for (item of items; track item.id) {
    @if (this.$index % 2 === 0) {}
  }`,
  `
  @for (item of items; track item.id) {
    @if (this.$index % 2 !== 0) {}
  }`,
  `
  @for (item of items; track item.id) {
    {{ !this.$even }}
  }`,
  `
  @for (item of items; track item.id) {
    {{ !this.$odd }}
  }`,
  `
  @for (item of items; track item.id) {
    {{ $index % 2 }}
  }`,
  `
  @for (item of items; track item.id) {
    {{ $index % 2 === foo }}
  }`,
  `
  @for (item of items; track item.id) {
    {{ $index % 2 !== foo }}
  }`,
  `
  @for (item of items; track item.id) {
    {{ $index % 2 >= foo }}
  }`,
  `
  @for (item of items; track item.id) {
    {{ $index % 2 > foo }}
  }`,
  `
  @for (item of items; track item.id) {
    {{ $index % 2 <= foo }}
  }`,
  `
  @for (item of items; track item.id) {
    {{ $index % 2 < foo }}
  }`,
  `
  @for (item of items; track item.id) {
    {{ $index % 2 + foo }}
  }`,
  `
  @for (item of items; track item.id) {
    {{ $index % 2 - foo }}
  }`,
  `
  @for (item of items; track item.id) {
    {{ $index % 2 * foo }}
  }`,
  `
  @for (item of items; track item.id) {
    {{ $index % 2 / foo }}
  }`,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  ...VARIABLE_NAMES.flatMap((name) => [
    [name, name.slice(1)],
    [name, 'foo'],
  ]).map(([variable, alias]) =>
    convertAnnotatedSourceToFailureCase<MessageIds, Options>({
      description: `should fail when '${variable}' is aliased as '${alias}' and no aliases are allowed`,
      annotatedSource: `
        @for (item of items; track item.id; let ${alias} = ${variable}) {}
                                                ${'~'.repeat(alias.length + 3 + variable.length)}
        `,
      messageId: preferContextualVariable,
      data: { name: variable },
      annotatedOutput: `
        @for (item of items; track item.id) {}
                                                
        `,
    }),
  ),
  ...VARIABLE_NAMES.map((variable) =>
    convertAnnotatedSourceToFailureCase<MessageIds, Options>({
      description: `should fail when '${variable}' can be aliased as 'foo' but is aliased as 'bar'`,
      options: [{ allowedAliases: { [variable]: ['foo'] } }],
      annotatedSource: `
        @for (item of items; track item.id; let bar = ${variable}) {}
                                                ~~~~~~${'~'.repeat(variable.length)}
        `,
      messageId: preferContextualVariable,
      data: { name: variable },
      annotatedOutput: `
        @for (item of items; track item.id) {}
                                                
        `,
    }),
  ),
  convertAnnotatedSourceToFailureCase({
    description: `can remove only the first variable when fixing`,
    options: [{ allowedAliases: { $index: ['a'], $count: ['b'] } }],
    annotatedSource: `
      @for (item of items; track item.id; let x = $even, a = $index, b = $count) {,}
                                              ~~~~~~~~~
      `,
    messageId: preferContextualVariable,
    data: { name: '$even' },
    annotatedOutput: `
      @for (item of items; track item.id; let a = $index, b = $count) {,}
                                              ~~~~~~~~~
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `can remove only a middle variable when fixing`,
    options: [{ allowedAliases: { $index: ['a'], $count: ['b'] } }],
    annotatedSource: `
      @for (item of items; track item.id; let a = $index, x = $even, b = $count) {,}
                                                          ~~~~~~~~~
      `,
    messageId: preferContextualVariable,
    data: { name: '$even' },
    annotatedOutput: `
      @for (item of items; track item.id; let a = $index, b = $count) {,}
                                                          
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `can remove only the last variable when fixing`,
    options: [{ allowedAliases: { $index: ['a'], $count: ['b'] } }],
    annotatedSource: `
      @for (item of items; track item.id; let a = $index, b = $count, x = $even) {,}
                                                                      ~~~~~~~~~
      `,
    messageId: preferContextualVariable,
    data: { name: '$even' },
    annotatedOutput: `
      @for (item of items; track item.id; let a = $index, b = $count) {,}
                                                                      
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `can remove multiple non-consecutive variables when fixing`,
    options: [{ allowedAliases: { $count: ['b'] } }],
    annotatedSource: `
      @for (item of items; track item.id; let a = $index, b = $count, x = $even) {,}
                                              ~~~~~~~~~~              ^^^^^^^^^
      `,
    messages: [
      {
        char: '~',
        messageId: preferContextualVariable,
        data: { name: '$index' },
      },
      {
        char: '^',
        messageId: preferContextualVariable,
        data: { name: '$even' },
      },
    ],
    annotatedOutput: `
      @for (item of items; track item.id; let b = $count) {,}
                                                                      
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `can remove multiple consecutive variables when fixing`,
    options: [{ allowedAliases: { $count: ['b'] } }],
    annotatedSource: `
      @for (item of items; track item.id; let a = $index, x = $even, b = $count) {,}
                                              ~~~~~~~~~~  ^^^^^^^^^
      `,
    messages: [
      {
        char: '~',
        messageId: preferContextualVariable,
        data: { name: '$index' },
      },
      {
        char: '^',
        messageId: preferContextualVariable,
        data: { name: '$even' },
      },
    ],
    annotatedOutputs: [
      `
      @for (item of items; track item.id; let x = $even, b = $count) {,}
                                                          
      `,
      `
      @for (item of items; track item.id; let b = $count) {,}
                                                          
      `,
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: `can remove all variables when fixing`,
    annotatedSource: `
      @for (item of items; track item.id; let a = $index, b = $even, c = $count) {,}
                                              ~~~~~~~~~~  ^^^^^^^^^  ##########
      `,
    messages: [
      {
        char: '~',
        messageId: preferContextualVariable,
        data: { name: '$index' },
      },
      {
        char: '^',
        messageId: preferContextualVariable,
        data: { name: '$even' },
      },
      {
        char: '#',
        messageId: preferContextualVariable,
        data: { name: '$count' },
      },
    ],
    annotatedOutputs: [
      `
      @for (item of items; track item.id; let b = $even) {,}
                                                                     
      `,
      `
      @for (item of items; track item.id) {,}
                                                                     
      `,
    ],
  }),
  ...VARIABLE_NAMES.map((variable) =>
    convertAnnotatedSourceToFailureCase<MessageIds, Options>({
      description: `should rename references to alias of '${variable}' when fixing`,
      annotatedSource: `
        @for (item of items; track item.id; let foo = ${variable}) {
                                                ~~~~~~${'~'.repeat(variable.length)}
          {{ foo }}
          {{ foo + 1 }}
          <my-component [value]="foo"/>
          <div [attr.title]="foo"></div>
          @if (foo) {}
          @switch (foo) {}
          @let bar = foo + 1;
        }
        `,
      messageId: preferContextualVariable,
      data: { name: variable },
      annotatedOutput: `
        @for (item of items; track item.id) {
                                                
          {{ ${variable} }}
          {{ ${variable} + 1 }}
          <my-component [value]="${variable}"/>
          <div [attr.title]="${variable}"></div>
          @if (${variable}) {}
          @switch (${variable}) {}
          @let bar = ${variable} + 1;
        }
        `,
    }),
  ),
  ...['items', 'items()'].map((source) =>
    convertAnnotatedSourceToFailureCase<MessageIds, Options>({
      description: `should replace '${source}.length' with '$count'`,
      annotatedSource: `
        @for (item of ${source}; track item.id) {
          {{ $index + 1 }} of {{ ${source}.length }}
                                 ${'~'.repeat(source.length + 7)}
        }
        `,
      messageId: preferCount,
      data: { expression: `${source}.length` },
      annotatedOutput: `
        @for (item of ${source}; track item.id) {
          {{ $index + 1 }} of {{ $count }}
                                 
        }
        `,
    }),
  ),
  ...['$index === 0', '$index == 0', '0 === $index', '0 == $index'].map(
    (expression) =>
      convertAnnotatedSourceToFailureCase<MessageIds, Options>({
        description: `should replace '${expression}' with '$first'`,
        annotatedSource: `
          @for (item of items; track item.id) {
            @if (${expression}) {
                 ${`~`.repeat(expression.length)}
              first item
            }
          }
          `,
        messageId: preferFirst,
        data: { expression },
        annotatedOutput: `
          @for (item of items; track item.id) {
            @if ($first) {
                 
              first item
            }
          }
          `,
      }),
  ),
  ...[
    '$index > 0',
    '$index !== 0',
    '$index != 0',
    '0 < $index',
    '0 !== $index',
    '0 != $index',
  ].map((expression) =>
    convertAnnotatedSourceToFailureCase<MessageIds, Options>({
      description: `should replace '${expression}' with '!$first'`,
      annotatedSource: `
        @for (item of items; track item.id) {
          @if (${expression}) {
               ${`~`.repeat(expression.length)}
            not first item
          }
        }
        `,
      messageId: preferFirst,
      data: { expression },
      annotatedOutput: `
        @for (item of items; track item.id) {
          @if (!$first) {
               
            not first item
          }
        }
        `,
    }),
  ),
  ...[
    '$index + 1 === $count',
    '$index + 1 == $count',
    '$index === $count - 1',
    '$index == $count - 1',
    '$count === $index + 1',
    '$count == $index + 1',
    '$count - 1 === $index',
    '$count - 1 == $index',
  ].map((expression) =>
    convertAnnotatedSourceToFailureCase<MessageIds, Options>({
      description: `should replace '${expression}' with '$last'`,
      annotatedSource: `
        @for (item of items; track item.id) {
          @if (${expression}) {
               ${`~`.repeat(expression.length)}
            last item
          }
        }
        `,
      messageId: preferLast,
      data: { expression },
      annotatedOutput: `
        @for (item of items; track item.id) {
          @if ($last) {
               
            last item
          }
        }
        `,
    }),
  ),
  ...[
    '$index + 1 < $count',
    '$index + 1 !== $count',
    '$index < $count - 1',
    '$index !== $count - 1',
    '$count > $index + 1',
    '$count !== $index + 1',
    '$count - 1 > $index',
    '$count - 1 !== $index',
  ].map((expression) =>
    convertAnnotatedSourceToFailureCase<MessageIds, Options>({
      description: `should replace '${expression}' with '!$last'`,
      annotatedSource: `
        @for (item of items; track item.id) {
          @if (${expression}) {
               ${`~`.repeat(expression.length)}
            not last item
          }
        }
        `,
      messageId: preferLast,
      data: { expression },
      annotatedOutput: `
        @for (item of items; track item.id) {
          @if (!$last) {
               
            not last item
          }
        }
        `,
    }),
  ),
  ...[
    '!($index % 2)',
    '$index % 2 === 0',
    '$index % 2 == 0',
    '$index % 2 !== 1',
    '$index % 2 != 1',
    '$index % 2 < 1',
    '0 === $index % 2',
    '0 == $index % 2',
    '1 !== $index % 2',
    '1 !== $index % 2',
    '1 > $index % 2',
    '!$odd',
  ].map((expression) =>
    convertAnnotatedSourceToFailureCase<MessageIds, Options>({
      description: `should replace '${expression}' with '$even'`,
      annotatedSource: `
        @for (item of items; track item.id) {
          @if (${expression}) {
               ${`~`.repeat(expression.length)}
            is even
          }
        }
        `,
      messageId: preferEven,
      data: { expression },
      annotatedOutput: `
        @for (item of items; track item.id) {
          @if ($even) {
               
            is even
          }
        }
        `,
    }),
  ),
  ...[
    '$index % 2 === 1',
    '$index % 2 == 1',
    '$index % 2 !== 0',
    '$index % 2 != 0',
    '$index % 2 > 0',
    '1 === $index % 2',
    '1 == $index % 2',
    '0 !== $index % 2',
    '0 != $index % 2',
    '0 < $index % 2',
    '!$even',
  ].map((expression) =>
    convertAnnotatedSourceToFailureCase<MessageIds, Options>({
      description: `should replace '${expression}' with '$odd'`,
      annotatedSource: `
        @for (item of items; track item.id) {
          @if (${expression}) {
               ${`~`.repeat(expression.length)}
            is odd
          }
        }
        `,
      messageId: preferOdd,
      data: { expression },
      annotatedOutput: `
        @for (item of items; track item.id) {
          @if ($odd) {
               
            is odd
          }
        }
        `,
    }),
  ),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: `should replace '!!($index % 2)' with '$odd'`,
    annotatedSource: `
      @for (item of items; track item.id) {
        @if (!!($index % 2)) {
              ~~~~~~~~~~~~~
          is odd
        }
      }
      `,
    // Detecting a double `PrefixNot` is difficult because we would report
    // a simplification for the outer `PrefixNot`, but when we see the inner
    // `PrefixNot`, we don't know that it's the expression in a parent `PrefixNot`,
    // so we would also report a simplification for it. So instead of reporting
    // on the outer `PrefixNot`, we only report on the inner one and rely on
    // the fact that once it has been fixed, we can then simplify it further.
    messages: [
      {
        char: '~',
        messageId: preferEven,
        data: { expression: '!($index % 2)' },
      },
    ],
    annotatedOutputs: [
      // First, we simplify the inner `PrefixNot` to `$even`.
      `
      @for (item of items; track item.id) {
        @if (!$even) {
              
          is odd
        }
      }
      `,
      // Then we simplify what was the outer `PrefixNot` to `$odd`.
      `
      @for (item of items; track item.id) {
        @if ($odd) {
              
          is odd
        }
      }
      `,
    ],
  }),
  ...[
    { pre: '{{ foo && ', expression: '$index % 2', post: ' }}' },
    { pre: '{{ ', expression: '$index % 2', post: ' && foo }}' },
    { pre: '{{ ', expression: '$index % 2', post: ' ? 1 : 2 }}' },
    { pre: '@if (', expression: '$index % 2', post: ') {}' },
  ].map(({ pre, expression, post }) =>
    convertAnnotatedSourceToFailureCase<MessageIds, Options>({
      description: `should replace '${pre}${expression}${post}' with '${pre}$odd${post}'`,
      annotatedSource: `
        @for (item of items; track item.id) {
          ${pre}${expression}${post}
          ${' '.repeat(pre.length)}${`~`.repeat(expression.length)}
        }
        `,
      messageId: preferOdd,
      data: { expression },
      annotatedOutput: `
        @for (item of items; track item.id) {
          ${pre}$odd${post}
          ${' '.repeat(pre.length)}
        }
        `,
    }),
  ),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: `should simplify contextual variable usage in nested for loops`,
    annotatedSource: `
      @for (a of outer; track a.id) {
        @if ($index === 0) {
             ~~~~~~~~~~~~
          first outer
        }
        @for (b of inner; track b.id) {
          @if ($index === 0) {
               ^^^^^^^^^^^^
            first inner
          }
        }
      }
      `,
    messages: [
      {
        char: '~',
        messageId: preferFirst,
        data: { expression: '$index === 0' },
      },
      {
        char: '^',
        messageId: preferFirst,
        data: { expression: '$index === 0' },
      },
    ],
    annotatedOutput: `
      @for (a of outer; track a.id) {
        @if ($first) {
                         
          first outer
        }
        @for (b of inner; track b.id) {
          @if ($first) {
               
            first inner
          }
        }
      }
      `,
  }),
];
