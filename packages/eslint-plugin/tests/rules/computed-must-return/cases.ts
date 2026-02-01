import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/computed-must-return';

const messageId: MessageIds = 'computedMissingReturn';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `const computed = 2;`,
  `class computed {}`,
  `const x = computed;`,
  {
    name: 'should not flag computed with no body, because Typescript will flag it',
    code: 'computed()',
  },
  `class Test {
    computed = 2;
  }`,
  `class Test {
    computed() {};
  }`,
  `class Test {
    x = computed(() => y());
  }`,
  `function computedFactory() {
    return computed(() => {
      return 2;
    });
  }`,
  `computed(() => {
    return 2;
  });`,
  `computed(function() {
    return 2;
  });`,
  `computed(() => {
    return () => {};
  });`,
  `computed(() => {
    return undefined;
  });`,
  `Test.computed(() => {});`,
  `instance.computed(() => {});`,
  {
    name: 'should not flag computed arrow function that has at least one return statement with value',
    code: `computed(() => {
      if (condition()) {
        return;
      }
      
      return 2;
    })`,
  },
  {
    name: 'should not flag computed function that has at least one return statement with value',
    code: `computed(() => {
      if (condition()) {
        return;
      }
      
      return 2;
    })`,
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: `should fail when computed body is empty`,
    annotatedSource: `
      computed(() => {});
      ~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when computed arrow does not return anything`,
    annotatedSource: `
      computed(() => {
      ~~~~~~~~~~~~~~~~
        y();
        ~~~~
      });
      ~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when computed function does not return anything`,
    annotatedSource: `
      computed(function() {
      ~~~~~~~~~~~~~~~~~~~~~
        y();
        ~~~
      });
      ~~
    `,
    messageId,
  }),

  convertAnnotatedSourceToFailureCase({
    description: `should fail when computed arrow only has an empty return`,
    annotatedSource: `
      computed(() => {
      ~~~~~~~~~~~~~~~~
        return;
        ~~~~~~~
      });
      ~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when computed function only has an empty return`,
    annotatedSource: `
      computed(function() {
      ~~~~~~~~~~~~~~~~~~~~~
        return;
        ~~~~~~~
      });
      ~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when computed does not return anything (part of the class)`,
    annotatedSource: `
      computed(() => {
      ~~~~~~~~~~~~~~~~
        y();
        ~~~
      });
      ~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should work correctly for a computed function with options argument`,
    annotatedSource: `
      computed(() => {}, { equal: (a, b) => {} });
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should not be distracted by nested returns`,
    annotatedSource: `
      computed(() => {
      ~~~~~~~~~~~~~~~~
        const nested = () => {
        ~~~~~~~~~~~~~~~~~~~~~~
          return 2;
          ~~~~~~~~~
        }
        ~
      });
      ~~
    `,
    messageId,
  }),
];
