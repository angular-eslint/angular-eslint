import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/no-experimental';

const messageId: MessageIds = 'noExperimental';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    /** Not experimental */
    interface Test {
      /** @publicApi */
      a1: string;
      /** @experimental */
      a2: string;
    };
    const test: Test = {};
    test.a1 = 'value';
 `,
  `
    /** Not experimental */
    class Test {
      /** @deprecated */
      a1: string;
      /** @experimental */
      a2: string;
    }
    const test = new Test();
    test.a1 = 'value';
 `,
  `
    /** Not experimental */
    const test = {};
    if (test) return;
 `,
  `
    /** Not experimental */
    function test() {}
    test();
 `,
  `
    /** @experimental */
    declare module "some-module" {}
 `,
  `
  import { regularFunction, experimentalFunction } from './experimental';
  
  regularFunction();
  `,
  `
  import { RegularClass, ExperimentalClass } from './experimental';
  
  const instance = new RegularClass();
  `,
  `
  import { experimentalFunction } from './experimental';
  
  export { experimentalFunction as alias };
  `,
  `export * from './experimental';`,
  `
  /** @experimental */
  declare function test(): void;
  `,
  `
  /** @experimental */
  declare const test: () => void;
  `,
  `
  import { regularConst } from './experimental';
  const myConst = regularConst;
  `,
  `
  import { regularConst } from './experimental';
  const myConst = { prop: regularConst };
  `,
  `
  import { SomeInterface } from './experimental';
  const obj: SomeInterface = {};
  const { regularItem } = obj;
  `,
  `
  import { something } from './non-existing';
  const myVar = something;
  `,
  {
    code: `
      import { userEvent } from 'vitest/browser';

      // Vitest's browser APIs are declared in \`@vitest/browser\` and only
      // re-exported by \`vitest/browser\`, so \`@vitest/browser\` is the package to list
      await userEvent.pointer({ keys: '[MouseLeft]' });
    `,
    options: [{ ignorePackages: ['@vitest/browser'] }],
  },
  {
    code: `
      import { userEvent } from 'vitest/browser';

      // \`userEvent\` is declared in \`@vitest/browser\`, and \`fill\` is not experimental
      await userEvent.fill(document.body, 'not experimental');
    `,
    options: [{ ignorePackages: ['@vitest/browser'] }],
  },
  {
    code: `
      import { experimentalValue } from '@angular/experimental-lib';

      console.log(experimentalValue);
    `,
    options: [{ ignorePackages: ['@angular/experimental-lib'] }],
  },
  {
    code: `
      import { client } from 'allowed';

      // \`blocked\` is installed at node_modules/allowed/node_modules/blocked
      client.experimentalMethod();
    `,
    options: [{ ignorePackages: ['allowed', 'blocked'] }],
  },
  {
    code: `
      import { blockedExperimental } from 'allowed';

      // \`allowed\` re-exports this API from \`blocked\`, so \`blocked\` must be listed
      blockedExperimental();
    `,
    options: [{ ignorePackages: ['allowed', 'blocked'] }],
  },
  {
    code: `
      import { pnpmExperimental } from './node_modules/.pnpm/blocked@1.2.0/node_modules/blocked';

      // pnpm resolves \`blocked\` to node_modules/.pnpm/blocked@1.2.0/node_modules/blocked
      pnpmExperimental();
    `,
    options: [{ ignorePackages: ['blocked'] }],
  },
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental interface is used',
    annotatedSource: `
        /** @experimental */
        interface Test {};
        const test: Test = {};
                    ~~~~
`,
    messageId,
    data: {
      name: 'Test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental interface is used in generic',
    annotatedSource: `
        /** @experimental */
        interface Test {};
        Partial<Test>;
                ~~~~
`,
    messageId,
    data: {
      name: 'Test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental interface function is called',
    annotatedSource: `
        interface Test {
          good?: () => void;
          /** @experimental */
          bad?: () => void;
        };
        const test: Test = {};
        test.bad();
             ~~~
`,
    messageId,
    data: {
      name: 'bad',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental interface attribute is used',
    annotatedSource: `
        interface Test {
          good?: string;
          /** @experimental */
          bad?: string;
        };
        const test: Test = {};
        if (test.good || test.bad) return;
                              ~~~
`,
    messageId,
    data: {
      name: 'bad',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a deep experimental object attribute is assigned',
    annotatedSource: `
        const test = {
          /** @experimental */
          a: {
            b: {
              c: () => {},
            },
          },
        };
        const value = test.a.b.c();
                           ~
`,
    messageId,
    data: {
      name: 'a',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental class is used',
    annotatedSource: `
        /** @experimental */
        class Test {}
        const test: Test = {};
                    ~~~~
`,
    messageId,
    data: {
      name: 'Test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental class is constructed',
    annotatedSource: `
        /** @experimental */
        class Test {}

        const test = new Test();
                         ~~~~
`,
    messageId,
    data: {
      name: 'Test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental class attribute is assigned',
    annotatedSource: `
        class Test {
          /** @publicApi */
          good?: string;
          /** @experimental */
          bad?: string;
        }

        const test = new Test();
        test.good = 'good';
        test.bad = 'bad';
             ~~~
`,
    messageId,
    data: {
      name: 'bad',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental class function is called',
    annotatedSource: `
        class Test {
          /** @experimental */
          func() {}
        }

        const test = new Test();
        test.func();
             ~~~~
`,
    messageId,
    data: {
      name: 'func',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental class attribute is used',
    annotatedSource: `
        class Test {
          good?: string;
          /** @experimental */
          bad?: string;
        }
        const test = new Test();
        if (test.good || test.bad) return;
                              ~~~
`,
    messageId,
    data: {
      name: 'bad',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental class attribute is destructured',
    annotatedSource: `
        class Test {
          good?: string;
          /** @experimental */
          bad?: string;
        }
        const { good, bad } = new Test();
                      ~~~
`,
    messageId,
    data: {
      name: 'bad',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental class function is used',
    annotatedSource: `
        class Test {
          good() {}
          /** @experimental */
          bad() {}
        }
        const test = new Test();
        test.good();
        test.bad();
             ~~~
`,
    messageId,
    data: {
      name: 'bad',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental class expression is used',
    annotatedSource: `
        /** @experimental */
        const Test = class {};
        new Test();
            ~~~~
`,
    messageId,
    data: {
      name: 'Test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental type is used',
    annotatedSource: `
        /** @experimental */
        type Test = 'a' | 'b';
        const test: Test = 'a';
                    ~~~~
`,
    messageId,
    data: {
      name: 'Test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental function is used',
    annotatedSource: `
        /** @experimental */
        function test() {}
        test();
        ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental arrow function is used',
    annotatedSource: `
        /** @experimental */
        const test = () => {}
        test();
        ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental function with assignment pattern is used',
    annotatedSource: `
        /** @experimental */
        function test(param = '') {}
        test();
        ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental function is called with subsequent calls',
    annotatedSource: `
        /** @experimental */
        function test(param = ''): any {}
        test()?.a()?.b();
        ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental constant is used',
    annotatedSource: `
        /** @experimental @deprecated */
        const test = 'test';
        const myString = test + '-suffix';
                         ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental let is used in a loop',
    annotatedSource: `
        /** @experimental */
        let test = [];
        for (const value of test) {}
                            ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental var is used in a ternary',
    annotatedSource: `
        /** @experimental */
        var test = true;
        const value = test ? 'yes' : 'no';
                      ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental constant is assigned',
    annotatedSource: `
        /** @experimental */
        const test = 'test';
        const another = test;
                        ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental constant is used in a function call',
    annotatedSource: `
        /** @experimental */
        const test = 'test';
        console.log(test);
                    ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental deep object property is used',
    annotatedSource: `
        /** @experimental */
        const test = { a: { b: {} } };
        test.a.b;
        ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental constant is used in object spread',
    annotatedSource: `
        /** @experimental */
        const test = {};
        const result = { ...test };
                            ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental constant is used in array spread',
    annotatedSource: `
        /** @experimental */
        const test = [];
        const result = [ ...test ];
                            ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental function type is used',
    annotatedSource: `
        type A = () => {
          /** @experimental */
          b: string;
        };
        declare const a: A;

        const { b } = a();
                ~
`,
    messageId,
    data: {
      name: 'b',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental let is used',
    annotatedSource: `
        /** @experimental */
        let test: number = 1;
        const result = test++;
                       ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental constant is used in a block statement',
    annotatedSource: `
        /** @experimental */
        let i = 0;
        while(false) {
          i++;
          ~
        }
`,
    messageId,
    data: {
      name: 'i',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental const is used in an assignment pattern',
    annotatedSource: `
      /** @experimental */
      const x = 1;
  
      const { y = x } = {};
                  ~
`,
    messageId,
    data: {
      name: 'x',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental property is used',
    annotatedSource: `
        const test = {
          a: '',
          /** @experimental */
          b: '',
        };
        test.b;
             ~
`,
    messageId,
    data: {
      name: 'b',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental async function is used',
    annotatedSource: `
        /** @experimental */
        async function test() {}
        
        await test();
              ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental constant is used in a template expression',
    annotatedSource: `
        /** @experimental */
        const test = 'test';
        const myString = \`\${test}-suffix\`;
                            ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental enum is used',
    annotatedSource: `
        /** @experimental */
        enum Test {
          member = 1,
        }
        Test.member;
        ~~~~
`,
    messageId,
    data: {
      name: 'Test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental enum member is used',
    annotatedSource: `
        enum Test {
          member1 = 1,
          /** @experimental */
          member2 = 2,
        }
        Test.member1;
        Test.member2;
             ~~~~~~~
`,
    messageId,
    data: {
      name: 'member2',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental tagged template expression is used',
    annotatedSource: `
        /** @experimental */
        function $localize2(value: TemplateStringsArray) {
          return value;
        }
        const result = $localize2\`Hello World!\`;
                       ~~~~~~~~~~
`,
    messageId,
    data: {
      name: '$localize2',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental imported function is called',
    annotatedSource: `
      import { experimentalFunction } from './experimental';
  
      experimentalFunction();
      ~~~~~~~~~~~~~~~~~~~~
`,
    messageId,
    data: {
      name: 'experimentalFunction',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental imported aliased function is called',
    annotatedSource: `
      import { experimentalFunction as alias } from './experimental';
  
      alias();
      ~~~~~
`,
    messageId,
    data: {
      name: 'alias',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental imported class is used',
    annotatedSource: `
      import { ExperimentalClass } from './experimental';
  
      const instance = new ExperimentalClass();
                           ~~~~~~~~~~~~~~~~~
`,
    messageId,
    data: {
      name: 'ExperimentalClass',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if an experimental imported const is used',
    annotatedSource: `
      import { experimentalConst } from './experimental';

      const myConst = experimentalConst;
                      ~~~~~~~~~~~~~~~~~
`,
    messageId,
    data: {
      name: 'experimentalConst',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental imported const is used in an object',
    annotatedSource: `
      import { experimentalConst } from './experimental';

      const myConst = { prop: experimentalConst };
                              ~~~~~~~~~~~~~~~~~
`,
    messageId,
    data: {
      name: 'experimentalConst',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental object property is used in a destructuring',
    annotatedSource: `
      import { SomeInterface } from './experimental';

      const obj: SomeInterface = {};
      const { experimentalItem } = obj;
              ~~~~~~~~~~~~~~~~
`,
    messageId,
    data: {
      name: 'experimentalItem',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental package API and its experimental method are used and no packages are ignored',
    annotatedSource: `
      import { userEvent } from 'vitest/browser';

      await userEvent.pointer({ keys: '[MouseLeft]' });
            ~~~~~~~~~ ^^^^^^^
`,
    messages: [
      { char: '~', messageId, data: { name: 'userEvent' } },
      { char: '^', messageId, data: { name: 'pointer' } },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail only for the experimental package API when its non-experimental method is used',
    annotatedSource: `
      import { userEvent } from 'vitest/browser';

      // \`userEvent\` is experimental, but \`fill\` is not
      await userEvent.fill(document.body, 'not experimental');
            ~~~~~~~~~
`,
    messageId,
    data: {
      name: 'userEvent',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if the package declaring the experimental API is not in ignorePackages',
    annotatedSource: `
      import { userEvent } from 'vitest/browser';

      await userEvent.pointer({ keys: '[MouseLeft]' });
            ~~~~~~~~~ ^^^^^^^
`,
    options: [{ ignorePackages: ['other-package'] }],
    messages: [
      { char: '~', messageId, data: { name: 'userEvent' } },
      { char: '^', messageId, data: { name: 'pointer' } },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if only the package re-exporting the experimental API is in ignorePackages',
    annotatedSource: `
      import { userEvent } from 'vitest/browser';

      // Vitest's browser APIs are declared in \`@vitest/browser\`, so listing
      // \`vitest\` does not ignore them
      await userEvent.pointer({ keys: '[MouseLeft]' });
            ~~~~~~~~~ ^^^^^^^
`,
    options: [{ ignorePackages: ['vitest'] }],
    messages: [
      { char: '~', messageId, data: { name: 'userEvent' } },
      { char: '^', messageId, data: { name: 'pointer' } },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental API from a scoped package is used and no packages are ignored',
    annotatedSource: `
      import { experimentalValue } from '@angular/experimental-lib';

      console.log(experimentalValue);
                  ~~~~~~~~~~~~~~~~~
`,
    messageId,
    data: {
      name: 'experimentalValue',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if only the scope of a scoped package is in ignorePackages',
    annotatedSource: `
      import { experimentalValue } from '@angular/experimental-lib';

      console.log(experimentalValue);
                  ~~~~~~~~~~~~~~~~~
`,
    options: [{ ignorePackages: ['@angular'] }],
    messageId,
    data: {
      name: 'experimentalValue',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail for local experimental APIs in a file that also uses an ignored package',
    annotatedSource: `
      import { experimentalValue } from '@angular/experimental-lib';
      import { experimentalFunction } from './experimental';

      console.log(experimentalValue);
      experimentalFunction();
      ~~~~~~~~~~~~~~~~~~~~
`,
    options: [{ ignorePackages: ['@angular/experimental-lib'] }],
    messageId,
    data: {
      name: 'experimentalFunction',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an experimental API is declared in a package nested inside an ignored package',
    annotatedSource: `
      import { client } from 'allowed';

      // \`blocked\` is installed at node_modules/allowed/node_modules/blocked
      client.experimentalMethod();
             ~~~~~~~~~~~~~~~~~~
`,
    options: [{ ignorePackages: ['allowed'] }],
    messageId,
    data: {
      name: 'experimentalMethod',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if an ignored package re-exports an experimental API declared in another package',
    annotatedSource: `
      import { blockedExperimental } from 'allowed';

      // \`allowed\` re-exports this API from \`blocked\`, which is not ignored
      blockedExperimental();
      ~~~~~~~~~~~~~~~~~~~
`,
    options: [{ ignorePackages: ['allowed'] }],
    messageId,
    data: {
      name: 'blockedExperimental',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a pnpm-installed package declaring the experimental API is not ignored',
    annotatedSource: `
      import { pnpmExperimental } from './node_modules/.pnpm/blocked@1.2.0/node_modules/blocked';

      pnpmExperimental();
      ~~~~~~~~~~~~~~~~
`,
    options: [{ ignorePackages: ['.pnpm', 'blocked@1.2.0'] }],
    messageId,
    data: {
      name: 'pnpmExperimental',
    },
  }),
];
