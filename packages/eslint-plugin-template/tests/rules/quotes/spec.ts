import { RuleTester } from '@angular-eslint/utils';
import { RULE_NAME } from '../../../src/rules/quotes';
import { valid, invalid } from './cases';
import rule from '../../../src/rules/quotes';

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

ruleTester.run(RULE_NAME, rule, {
  valid,
  invalid,
});
