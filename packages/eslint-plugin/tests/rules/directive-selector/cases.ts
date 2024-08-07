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
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: `it should fail if a selector is not prefixed by a valid option`,
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
    description: `it should fail if a selector is not prefixed by any valid option`,
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
    description: `it should fail if a complex selector is not prefixed by any valid option`,
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
    description: `it should fail if a selector is not camelCased`,
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
    description: `it should fail if a selector is not kebab-cased`,
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
    description: `it should fail if a selector uses kebab-case style, but no dash`,
    annotatedSource: `
        @Directive({
          selector: 'app'
                    ~~~~~
        })
        class Test {}
      `,
    messageId: messageIdStyleFailure,
    options: [{ type: 'element', prefix: 'app', style: 'kebab-case' }],
    data: { style: 'kebab-case' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `it should fail if a selector is not used as an attribute`,
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
    description: `it should fail if a selector is not used as an element`,
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
];
