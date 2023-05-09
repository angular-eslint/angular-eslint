import { RuleTester } from '@angular-eslint/utils';
import rule, { RULE_NAME } from '../../../src/rules/alt-text';
import { invalid, valid } from './cases';

const ruleTester = new RuleTester({
  parser: '@angular-eslint/template-parser',
});

ruleTester.run(RULE_NAME, rule, {
  valid,
  invalid,
});
