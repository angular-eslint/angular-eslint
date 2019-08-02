import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/no-conflicting-lifecycle';
import { RuleTester } from '../test-helper';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const interfaceMessageId: MessageIds = 'noConflictingLifecycleInterface';
const methodMessageId = 'noConflictingLifecycleMethod';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // should pass if implements DoCheck, but not OnChanges
    `
      class Test implements DoCheck {}
    `,
    // should pass if contains ngDoCheck method, but not ngOnChanges
    `
      class Test {
        ngDoCheck() {}
      }
    `,
    // should pass if implements DoCheck and contains ngDoCheck method, but does not implement OnChanges and does not contain ngOnChanges method
    `
      class Test implements DoCheck {
        ngDoCheck() {}
      }
    `,
    // should pass if implements OnChanges, but not DoCheck
    `
      class Test implements OnChanges {}
    `,
    // should pass if contains ngOnChanges method, but not ngDoCheck
    `
      class Test {
        ngOnChanges() {}
      }
    `,
    // should pass if implements OnChanges and contains ngOnChanges method, but does not implement DoCheck and does not contain ngDoCheck method
    `
      class Test implements OnChanges {
        ngOnChanges() {}
      }
    `,
  ],
  invalid: [
    {
      // should fail if implement DoCheck and OnChanges
      code: `
      class Test implements DoCheck, OnChanges, run {
        test() {}
        test1() {}
      }
    `,
      errors: [
        {
          messageId: interfaceMessageId,
          line: 2,
          column: 29,
          endColumn: 36,
        },
        {
          messageId: interfaceMessageId,
          line: 2,
          column: 38,
          endColumn: 47,
        },
      ],
    },

    {
      // should fail if implement DoCheck and OnChanges and contain the ngDoCheck and ngOnChanges methods
      code: `
      class Test implements DoCheck, OnChanges {
        ngDoCheck() {}
        ngOnChanges() {}
      }
    `,
      errors: [
        {
          messageId: interfaceMessageId,
          line: 2,
          column: 29,
          endColumn: 36,
        },
        {
          messageId: interfaceMessageId,
          line: 2,
          column: 38,
          endColumn: 47,
        },
        {
          messageId: methodMessageId,
          line: 3,
          column: 9,
        },
        {
          messageId: methodMessageId,
          line: 4,
          column: 9,
        },
      ],
    },

    {
      // should fail if the ngDoCheck and ngOnChanges methods exist
      code: `
      class Test {
        ngDoCheck() {}
        ngOnChanges() {}
      }
    `,
      errors: [
        {
          messageId: methodMessageId,
          line: 3,
          column: 9,
        },
        {
          messageId: methodMessageId,
          line: 4,
          column: 9,
        },
      ],
    },
  ],
});
