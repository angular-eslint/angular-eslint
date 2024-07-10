import { RuleTester } from '@angular-eslint/test-utils';
import path from 'node:path';
import rule, { RULE_NAME } from '../../../src/rules/prefer-signal';
import { invalid, valid } from './cases';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.spec.json',
    tsconfigRootDir: path.join(__dirname, 'project'),
  },
});

ruleTester.run(RULE_NAME, rule, {
  valid,
  invalid,
});
