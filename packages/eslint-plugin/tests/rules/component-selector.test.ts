import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/component-selector';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageIdPrefixFailure: MessageIds = 'prefixFailure';
const messageIdStyleFailure: MessageIds = 'styleFailure';
const messageIdTypeFailure: MessageIds = 'typeFailure';

ruleTester.run(RULE_NAME, rule, {
  valid: [
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
      options: [
        { type: 'element', prefix: ['app', 'ng'], style: 'kebab-case' },
      ],
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
  ],
  invalid: [
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
      options: [
        { type: 'attribute', prefix: ['cd', 'ng'], style: 'kebab-case' },
      ],
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
      messageId: messageIdStyleFailure,
      options: [{ type: 'element', prefix: 'app', style: 'kebab-case' }],
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
    }),
    convertAnnotatedSourceToFailureCase({
      description: `it should fail if a selector is not used as an element`,
      annotatedSource: `
      @Component({
        selector: 'appFooBar'
                  ~~~~~~~~~~~
      })
      class Test {}
      `,
      messageId: messageIdTypeFailure,
      options: [
        { type: 'attribute', prefix: ['app', 'ng'], style: 'camelCase' },
      ],
    }),
  ],
});
