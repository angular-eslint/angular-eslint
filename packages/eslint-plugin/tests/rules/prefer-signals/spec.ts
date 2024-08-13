import { RuleTester } from '@angular-eslint/test-utils';
import path from 'node:path';
import rule, { RULE_NAME } from '../../../src/rules/prefer-signals';
import { invalid, valid } from './cases';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: path.join(__dirname, 'project'),
    },
  },
});

ruleTester.run(RULE_NAME, rule, {
  valid,
  invalid,
});
