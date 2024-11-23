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
    description: 'should fail if a experimental imported function is called',
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
      'should fail if a experimental imported aliased function is called',
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
];
