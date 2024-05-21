import { RuleTester } from '@angular-eslint/utils';
import rule, {
  RULE_NAME,
} from '../../../src/rules/no-duplicates-in-metadata-arrays';
import { invalid, valid } from './cases';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run(RULE_NAME, rule, {
  valid,
  invalid,
});
