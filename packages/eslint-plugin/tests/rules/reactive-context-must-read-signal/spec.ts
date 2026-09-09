import { RuleTester } from '@angular-eslint/test-utils';
import path from 'node:path';
import rule, {
  RULE_NAME,
} from '../../../src/rules/reactive-context-must-read-signal';
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
  valid: [
    ...valid,
    // Regression for #3198: inherited Object.prototype names are not primitives.
    `
    const callback = ({
      valueOf,
      toString,
      constructor,
      hasOwnProperty,
    }: {
      valueOf: () => unknown;
      toString: () => unknown;
      constructor: () => unknown;
      hasOwnProperty: () => unknown;
    }) => {
      valueOf();
      toString();
      constructor();
      hasOwnProperty();
    };
  `,
  ],
  invalid,
});
