import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-input-prefix';
import rule, { RULE_NAME } from '../../src/rules/no-input-prefix';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
});
const messageId: MessageIds = 'noInputPrefix';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        import { Input } from '@angular/core';
        @Component()
        class TestComponent {
          @Input() label: string;
        }
      `,
      options: [{ prefixes: ['is'] }],
    },
    {
      code: `
        import { Input } from '@angular/core';
        @Component()
        class TestComponent {
          @Input() issueName: string;
        }
      `,
      options: [{ prefixes: ['is'] }],
    },
    {
      code: `
        import { Input } from '@angular/core';
        @Component()
        class TestComponent {
          @Input() isEnabled: boolean;
        }
      `,
      options: [{ prefixes: ['should'] }],
    },
    {
      code: `
        import { Output } from '@angular/core';
        @Component()
        class TestComponent {
          @Output() isEnabled: boolean;
        }
      `,
      options: [{ prefixes: ['is'] }],
    },
    // should succeed when an Input decorator is not imported from '@angular/core'
    {
      code: `
        @Component()
        class TestComponent {
          @Input() isEnabled: boolean;
        }
      `,
      options: [{ prefixes: ['is'] }],
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail when a component input property is named with a disallowed prefix',
      annotatedSource: `
        import { Input } from '@angular/core';
        @Component()
        class TestComponent {
          @Input() isEnabled: string;
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
      options: [{ prefixes: ['is', 'should'] }],
      data: { prefixes: '"is" or "should"' },
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail when a component input property is named with a disallowed prefix',
      annotatedSource: `
        import { Input } from '@angular/core';
        @Component()
        class TestComponent {
          @Input() shouldLoad: string;
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
      options: [{ prefixes: ['is', 'should'] }],
      data: { prefixes: '"is" or "should"' },
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail when a component input property is named with a disallowed prefix',
      annotatedSource: `
        import { Input } from '@angular/core';
        @Component()
        class TestComponent {
          @Input() is: string;
          ~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
      options: [{ prefixes: ['is', 'should'] }],
      data: { prefixes: '"is" or "should"' },
    }),
  ],
});
