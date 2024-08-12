import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/component-selector';

const messageIdPrefixFailure: MessageIds = 'prefixFailure';
const messageIdStyleFailure: MessageIds = 'styleFailure';
const messageIdStyleAndPrefixFailure: MessageIds = 'styleAndPrefixFailure';
const messageIdTypeFailure: MessageIds = 'typeFailure';
const messageIdShadowDomEncapsulatedStyleFailure: MessageIds =
  'shadowDomEncapsulatedStyleFailure';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  {
    code: ``,
    options: [{ type: 'element', prefix: 'sg', style: 'kebab-case' }],
  },
  {
    code: `
      @Component({
        selector: 'sg-foo-bar'
      })
      class Test {}
      `,
    options: [{ type: 'element', prefix: 'sg', style: 'kebab-case' }],
  },
  {
    code: `
      @Component({
        selector: '[ng-foo-bar]'
      })
      class Test {}
      `,
    options: [
      { type: 'attribute', prefix: ['app', 'ng'], style: 'kebab-case' },
    ],
  },
  {
    code: `
      @Component({
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
      @Component({ selector: 'app-bar' }) class TestOne {}
      @Component({ selector: 'ngg-bar' }) class TestTwo {}
      `,
    options: [
      { type: 'element', prefix: ['app', 'cd', 'ngg'], style: 'kebab-case' },
    ],
  },
  {
    code: `
      @Component({
        selector: 'appBarFoo'
      })
      class Test {}
      `,
    options: [{ type: 'element', prefix: 'app', style: 'camelCase' }],
  },
  {
    code: `
      @Component({
        selector: 'app1-foo-bar'
      })
      class Test {}
      `,
    options: [{ type: 'element', prefix: 'app1', style: 'kebab-case' }],
  },
  {
    code: `
      const selectorName = 'appFooBar';
      @Component({
        selector: selectorName
      })
      class Test {}
      `,
    options: [{ type: 'element', prefix: 'app', style: 'kebab-case' }],
  },
  {
    code: `
      @Component({
        selector: 'app-foo-bar'
      })
      class Test {}
      `,
    options: [{ type: 'element', prefix: 'app', style: 'kebab-case' }],
  },
  {
    code: `
      @Component({
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
      @Component({
        selector: 'app-bar-foo[baz].bar'
      })
      class Test {}
      `,
    options: [{ type: 'element', prefix: ['app', 'ng'], style: 'kebab-case' }],
  },
  {
    code: `
      @Component({
        selector: \`[appFooBar]\`
      })
      class Test {}
      `,
    options: [
      {
        type: ['attribute', 'element'],
        prefix: ['app', 'ng'],
        style: 'camelCase',
      },
    ],
  },
  {
    code: `
      @Component({
        selector: \`
          [appFooBar]
        \`
      })
      class Test {}
      `,
    options: [
      {
        type: ['attribute', 'element'],
        prefix: ['app', 'ng'],
        style: 'camelCase',
      },
    ],
  },
  {
    code: `
      @Component({
        selector: \`
          [appFooBar],
          [appBarFoo]
        \`
      })
      class Test {}
      `,
    options: [
      {
        type: ['attribute', 'element'],
        prefix: ['app', 'ng'],
        style: 'camelCase',
      },
    ],
  },
  {
    code: `
      @Component({
        selector: \`button[appFooBar]\`
      })
      class Test {}
      `,
    options: [
      {
        type: ['attribute', 'element'],
        prefix: ['app', 'ng'],
        style: 'camelCase',
      },
    ],
  },
  {
    // https://github.com/angular-eslint/angular-eslint/issues/534
    code: `
      @Component({
        selector: \`app-foo-bar\`,
        encapsulation: ViewEncapsulation.ShadowDom
      })
      class Test {}
      `,
    options: [
      {
        type: ['element'],
        prefix: ['app'],
        style: 'camelCase',
      },
    ],
  },
  {
    // https://github.com/angular-eslint/angular-eslint/issues/534
    code: `
      @Component({
        selector: \`app-foo-bar\`,
        encapsulation: ViewEncapsulation.ShadowDom
      })
      class Test {}
      `,
    options: [
      {
        type: ['element'],
        prefix: ['app'],
        style: 'kebab-case',
      },
    ],
  },
  {
    code: `
      @Directive({
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
      @Component({
        selector: 'singleword'
      })
      class Test {}
      `,
    options: [{ type: 'element', style: 'kebab-case', prefix: '' }],
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: `it should fail when component used without prefix`,
    annotatedSource: `
        @Component({
          selector: 'foo-bar'
                    ~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdPrefixFailure,
    options: [{ type: 'element', prefix: 'sg', style: 'kebab-case' }],
    data: { prefix: '"sg"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `it should fail if a selector is not prefixed by a valid option`,
    annotatedSource: `
        @Component({
          selector: 'app-foo-bar'
                    ~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdPrefixFailure,
    options: [{ type: 'element', prefix: 'sg', style: 'kebab-case' }],
    data: { prefix: '"sg"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `it should fail if a selector is not prefixed by any valid option`,
    annotatedSource: `
        @Component({
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
        @Component({
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
        @Component({
          selector: '[ng-bar-foo]'
                    ~~~~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdStyleFailure,
    options: [{ type: 'attribute', prefix: 'ng', style: 'camelCase' }],
    data: { style: 'camelCase' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `it should fail if a selector is not kebab-cased`,
    annotatedSource: `
        @Component({
          selector: 'appFooBar'
                    ~~~~~~~~~~~
        })
        class Test {}
      `,
    messageId: messageIdStyleAndPrefixFailure,
    options: [{ type: 'element', prefix: 'app', style: 'kebab-case' }],
    data: { style: 'kebab-case', prefix: '"app"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `it should fail if a selector uses kebab-case style, but no dash`,
    annotatedSource: `
      @Component({
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
    description: `it should fail if a selector is not used as an element`,
    annotatedSource: `
      @Component({
        selector: '[appFooBar]'
                  ~~~~~~~~~~~~~
      })
      class Test {}
      `,
    messageId: messageIdTypeFailure,
    options: [{ type: 'element', prefix: ['app', 'ng'], style: 'camelCase' }],
    data: { type: 'element' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `it should fail if a selector is not used as an attribute`,
    annotatedSource: `
      @Component({
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
    description: `it should fail if a selector is not used as an attribute`,
    annotatedSource: `
      @Component({
        selector: 'appFooBar'
                  ~~~~~~~~~~~
      })
      class Test {}
      `,
    messageId: messageIdTypeFailure,
    options: [{ type: 'attribute', prefix: ['app', 'ng'], style: 'camelCase' }],
    data: { type: 'attribute' },
  }),
  convertAnnotatedSourceToFailureCase({
    // https://github.com/angular-eslint/angular-eslint/issues/534
    description: `it should fail if a ShadowDom-encapsulated component's selector is not kebab-cased`,
    annotatedSource: `
      @Component({
        encapsulation: ViewEncapsulation.ShadowDom,
        selector: 'appFooBar'
                  ~~~~~~~~~~~
      })
      class Test {}
      `,
    messageId: messageIdShadowDomEncapsulatedStyleFailure,
    options: [{ type: 'element', prefix: ['app'], style: 'camelCase' }],
  }),
  convertAnnotatedSourceToFailureCase({
    // https://github.com/angular-eslint/angular-eslint/issues/534
    description: `it should fail if a ShadowDom-encapsulated component's selector doesn't contain hyphen`,
    annotatedSource: `
      @Component({
        encapsulation: ViewEncapsulation.ShadowDom,
        selector: 'app'
                  ~~~~~
      })
      class Test {}
      `,
    messageId: messageIdShadowDomEncapsulatedStyleFailure,
    options: [{ type: 'element', prefix: ['app'], style: 'camelCase' }],
  }),
  convertAnnotatedSourceToFailureCase({
    description: `it should fail if a selector is not prefixed by a valid option with the correct case`,
    annotatedSource: `
      @Component({
        selector: 'root'
                  ~~~~~~
      })
      class Test {}
      `,
    messageId: messageIdStyleAndPrefixFailure,
    options: [{ type: 'element', prefix: ['app', 'toh'], style: 'kebab-case' }],
    data: { style: 'kebab-case', prefix: '"app" or "toh"' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `it should fail if a selector uses kebab-case with an invalid prefix style`,
    annotatedSource: `
      @Component({
        selector: 'sgggg-bar'
                  ~~~~~~~~~~~
      })
      class Test {}
      `,
    messageId: messageIdPrefixFailure,
    options: [{ type: 'element', prefix: 'sg', style: 'kebab-case' }],
    data: { prefix: '"sg"' },
  }),
];
