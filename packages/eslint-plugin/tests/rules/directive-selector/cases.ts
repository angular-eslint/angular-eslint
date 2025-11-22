import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/directive-selector';

const messageIdPrefixFailure: MessageIds = 'prefixFailure';
const messageIdStyleFailure: MessageIds = 'styleFailure';
const messageIdTypeFailure: MessageIds = 'typeFailure';
const messageIdSelectorAfterPrefixFailure: MessageIds =
  'selectorAfterPrefixFailure';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  {
    code: ``,
    options: [{ type: 'element', prefix: 'sg', style: 'kebab-case' }],
  },
  {
    code: `
      @Directive({
        selector: 'app-foo-bar'
      })
      class Test {}
      `,
    options: [{ type: 'element', prefix: 'app', style: 'kebab-case' }],
  },
  {
    code: `
      @Directive({
        selector: '[app-foo-bar]'
      })
      class Test {}
      `,
    options: [
      { type: 'attribute', prefix: ['app', 'ng'], style: 'kebab-case' },
    ],
  },
  {
    code: `
      @Directive({
        selector: 'app-foo-bar[baz].app'
      })
      class Test {}
      `,
    options: [
      { type: 'element', prefix: ['app', 'cd', 'ng'], style: 'kebab-case' },
    ],
  },
  {
    code: `
      @Directive({ selector: 'app-bar' }) class TestOne {}
      @Directive({ selector: 'ngg-bar' }) class TestTwo {}
      `,
    options: [
      { type: 'element', prefix: ['app', 'cd', 'ngg'], style: 'kebab-case' },
    ],
  },
  {
    code: `
      @Directive({
        selector: 'appBarFoo'
      })
      class Test {}
      `,
    options: [{ type: 'element', prefix: 'app', style: 'camelCase' }],
  },
  {
    code: `
      @Directive({
        selector: 'app1-foo-bar'
      })
      class Test {}
      `,
    options: [{ type: 'element', prefix: 'app1', style: 'kebab-case' }],
  },
  {
    code: `
      const selectorName = 'appFooBar';
      @Directive({
        selector: selectorName
      })
      class Test {}
      `,
    options: [{ type: 'element', prefix: 'app', style: 'kebab-case' }],
  },
  {
    code: `
      @Directive({
        selector: \`[app-foo-bar]\`
      })
      class Test {}
      `,
    options: [
      { type: 'attribute', prefix: ['app', 'ng'], style: 'kebab-case' },
    ],
  },
  {
    code: `
      @Directive({
        selector: 'baz-[app-bar-foo][foe].bar'
      })
      class Test {}
      `,
    options: [
      { type: 'attribute', prefix: ['app', 'baz'], style: 'kebab-case' },
    ],
  },
  {
    code: `
      @Directive({
        selector: 'app-bar-foo[baz].bar'
      })
      class Test {}
      `,
    options: [{ type: 'element', prefix: ['app', 'ng'], style: 'kebab-case' }],
  },
  {
    code: `
      @Component({
        selector: 'app-foo-bar'
      })
      class Test {}
      `,
    options: [
      {
        type: ['element'],
        prefix: ['bar'],
        style: 'kebab-case',
      },
    ],
  },
  // No prefix required - empty array
  {
    code: `
      @Directive({
        selector: '[fooBar]'
      })
      class Test {}
      `,
    options: [{ type: 'attribute', style: 'camelCase', prefix: [] }],
  },
  // No prefix required - empty string
  {
    code: `
      @Directive({
        selector: '[fooBar]'
      })
      class Test {}
      `,
    options: [{ type: 'attribute', style: 'camelCase', prefix: '' }],
  },
  {
    code: `
      @Directive({
        selector: \`
          [app-foo-bar]
        \`
      })
      class Test {}
      `,
    options: [
      {
        type: ['attribute'],
        prefix: ['app'],
        style: 'kebab-case',
      },
    ],
  },
  {
    code: `
      @Directive({
        selector: \`
          [app-foo-bar],
          [app-bar-foo]
        \`
      })
      class Test {}
      `,
    options: [
      {
        type: ['attribute'],
        prefix: ['app'],
        style: 'kebab-case',
      },
    ],
  },
  {
    code: `
      @Directive({
        selector: 'button[app-foo-bar]'
      })
      class Test {}
      `,
    options: [
      {
        type: ['attribute'],
        prefix: ['app'],
        style: 'kebab-case',
      },
    ],
  },
  // Single config array - element only
  {
    code: `
      @Directive({
        selector: 'app-foo-bar'
      })
      class Test {}
      `,
    options: [[{ type: 'element', prefix: 'app', style: 'kebab-case' }]],
  },
  // Single config array - attribute only
  {
    code: `
      @Directive({
        selector: '[appFooBar]'
      })
      class Test {}
      `,
    options: [[{ type: 'attribute', prefix: 'app', style: 'camelCase' }]],
  },
  // Multiple configs - element with kebab-case
  {
    code: `
      @Directive({
        selector: 'app-foo-bar'
      })
      class Test {}
      `,
    options: [
      [
        { type: 'element', prefix: 'app', style: 'kebab-case' },
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
    ],
  },
  // Multiple configs - attribute with camelCase
  {
    code: `
      @Directive({
        selector: '[appFooBar]'
      })
      class Test {}
      `,
    options: [
      [
        { type: 'element', prefix: 'app', style: 'kebab-case' },
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
    ],
  },
  // Multiple configs - element with array of prefixes
  {
    code: `
      @Directive({
        selector: 'lib-foo-bar'
      })
      class Test {}
      `,
    options: [
      [
        { type: 'element', prefix: ['app', 'lib'], style: 'kebab-case' },
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
    ],
  },
  // Multiple configs - attribute with array of prefixes
  {
    code: `
      @Directive({
        selector: '[libFooBar]'
      })
      class Test {}
      `,
    options: [
      [
        { type: 'element', prefix: 'app', style: 'kebab-case' },
        { type: 'attribute', prefix: ['app', 'lib'], style: 'camelCase' },
      ],
    ],
  },
  // Multiple configs - config order shouldn't matter
  {
    code: `
      @Directive({
        selector: '[appFooBar]'
      })
      class Test {}
      `,
    options: [
      [
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
    ],
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: `should fail if a selector is not prefixed by a valid option`,
    annotatedSource: `
        @Directive({
          selector: 'app-foo-bar'
                    ~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdPrefixFailure,
    options: [{ type: 'element', prefix: 'bar', style: 'kebab-case' }],
    data: { prefix: '"bar"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail if a selector is not prefixed by any valid option`,
    annotatedSource: `
        @Directive({
          selector: '[app-foo-bar]'
                    ~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdPrefixFailure,
    options: [{ type: 'attribute', prefix: ['cd', 'ng'], style: 'kebab-case' }],
    data: { prefix: '"cd" or "ng"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail if a complex selector is not prefixed by any valid option`,
    annotatedSource: `
        @Directive({
          selector: 'app-foo-bar[baz].app'
                    ~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdPrefixFailure,
    options: [
      { type: 'element', prefix: ['foo', 'cd', 'ng'], style: 'kebab-case' },
    ],
    data: { prefix: '"foo", "cd" or "ng"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail if a selector is not camelCased`,
    annotatedSource: `
        @Directive({
          selector: '[app-bar-foo]'
                    ~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdStyleFailure,
    options: [{ type: 'attribute', prefix: 'app', style: 'camelCase' }],
    data: { style: 'camelCase' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail if a selector is not kebab-cased`,
    annotatedSource: `
        @Directive({
          selector: 'appFooBar'
                    ~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdStyleFailure,
    options: [{ type: 'element', prefix: 'app', style: 'kebab-case' }],
    data: { style: 'kebab-case' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when there is no selector after the prefix in kebab-case`,
    annotatedSource: `
        @Directive({
          selector: 'app'
                    ~~~~~
        })
        class Test {}
      `,
    messageId: messageIdSelectorAfterPrefixFailure,
    options: [{ type: 'element', prefix: 'app', style: 'kebab-case' }],
    data: { prefix: '"app"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail if there is no selector after the prefix`,
    annotatedSource: `
        @Directive({
          selector: 'app'
                    ~~~~~
        })
        class Test {}
      `,
    messageId: messageIdSelectorAfterPrefixFailure,
    options: [{ type: 'element', prefix: 'app', style: 'camelCase' }],
    data: { prefix: '"app"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail if a selector is not used as an attribute`,
    annotatedSource: `
        @Directive({
          selector: \`app-foo-bar\`
                    ~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdTypeFailure,
    options: [
      { type: 'attribute', prefix: ['app', 'ng'], style: 'kebab-case' },
    ],
    data: { type: 'attribute' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail if a selector is not used as an element`,
    annotatedSource: `
        @Directive({
          selector: '[appFooBar]'
                    ~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdTypeFailure,
    options: [{ type: 'element', prefix: ['app', 'ng'], style: 'camelCase' }],
    data: { type: 'element' },
  }),
  // Single config array - element with wrong style
  convertAnnotatedSourceToFailureCase({
    description: `should fail if an element selector doesn't match when using single config array`,
    annotatedSource: `
        @Directive({
          selector: 'appFooBar'
                    ~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdStyleFailure,
    options: [[{ type: 'element', prefix: 'app', style: 'kebab-case' }]],
    data: { style: 'kebab-case' },
  }),
  // Single config array - attribute with wrong style
  convertAnnotatedSourceToFailureCase({
    description: `should fail if an attribute selector doesn't match when using single config array`,
    annotatedSource: `
        @Directive({
          selector: '[app-foo-bar]'
                    ~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdStyleFailure,
    options: [[{ type: 'attribute', prefix: 'app', style: 'camelCase' }]],
    data: { style: 'camelCase' },
  }),
  // Multiple configs - element with wrong style
  convertAnnotatedSourceToFailureCase({
    description: `should fail if an element selector doesn't match kebab-case when using multiple configs`,
    annotatedSource: `
        @Directive({
          selector: 'appFooBar'
                    ~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdStyleFailure,
    options: [
      [
        { type: 'element', prefix: 'app', style: 'kebab-case' },
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
    ],
    data: { style: 'kebab-case' },
  }),
  // Multiple configs - attribute with wrong style
  convertAnnotatedSourceToFailureCase({
    description: `should fail if an attribute selector doesn't match camelCase when using multiple configs`,
    annotatedSource: `
        @Directive({
          selector: '[app-foo-bar]'
                    ~~~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdStyleFailure,
    options: [
      [
        { type: 'element', prefix: 'app', style: 'kebab-case' },
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
    ],
    data: { style: 'camelCase' },
  }),
  // Multiple configs - element with wrong prefix
  convertAnnotatedSourceToFailureCase({
    description: `should fail if an element selector has wrong prefix when using multiple configs`,
    annotatedSource: `
        @Directive({
          selector: 'lib-foo-bar'
                    ~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdPrefixFailure,
    options: [
      [
        { type: 'element', prefix: 'app', style: 'kebab-case' },
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
    ],
    data: { prefix: '"app"' },
  }),
  // Multiple configs - attribute with wrong prefix
  convertAnnotatedSourceToFailureCase({
    description: `should fail if an attribute selector has wrong prefix when using multiple configs`,
    annotatedSource: `
        @Directive({
          selector: '[libFooBar]'
                    ~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdPrefixFailure,
    options: [
      [
        { type: 'element', prefix: 'app', style: 'kebab-case' },
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
    ],
    data: { prefix: '"app"' },
  }),
];
