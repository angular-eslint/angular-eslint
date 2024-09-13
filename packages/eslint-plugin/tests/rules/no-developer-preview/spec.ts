import { RuleTester } from '@angular-eslint/test-utils';
import rule, { RULE_NAME } from '../../../src/rules/no-developer-preview';
import { invalid, valid } from './cases';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: { project: true },
  },
});

ruleTester.run(RULE_NAME, rule, {
  valid,
  invalid,
});
