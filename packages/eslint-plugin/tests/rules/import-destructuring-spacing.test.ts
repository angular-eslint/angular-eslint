import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/import-destructuring-spacing';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'importDestructuringSpacing';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        import { Foo } from './foo';
      `,
    },
    {
      code: `
        import {} from 'foo';
      `,
    },
    {
      code: `
        import foo = require('./foo');
      `,
    },
    {
      code: `
        import 'rxjs/add/operator/map';
      `,
    },
    {
      code: `
        import * as Foo from './foo';
      `,
    },
    {
      code: `
        import { default as _rollupMoment, Moment } from 'moment';
      `,
    },
    {
      code: `
        import {
          Bar,
          BarFoo,
          Foo
        } from './foo';
      `,
    },
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail when a single import has no spaces',
      annotatedSource: `
        import {Foo} from './foo';
        ~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail when multiple imports have no spaces',
      annotatedSource: `
        import {Foo,Bar} from './foo';
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail when there are no trailing spaces',
      annotatedSource: `
        import { Foo} from './foo';
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      messageId,
      description: 'should fail when there are no leading spaces',
      annotatedSource: `
        import {Foo } from './foo';
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    }),
  ],
});
