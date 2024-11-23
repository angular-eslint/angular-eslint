import { RuleTester } from '@angular-eslint/test-utils';
import { join } from 'node:path';
import rule, { RULE_NAME } from '../../../src/rules/no-experimental';
import { invalid, valid } from './cases';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: join(__dirname, 'project'),
    },
  },
});

ruleTester.run(RULE_NAME, rule, {
  valid,
  invalid,
});
