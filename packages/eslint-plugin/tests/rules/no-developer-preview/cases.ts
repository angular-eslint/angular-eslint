import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/no-developer-preview';

const messageId: MessageIds = 'noDeveloperPreview';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    /** Not developerPreview */
    interface Test {
      /** @publicApi */
      a1: string;
      /** @developerPreview */
      a2: string;
    };
    const test: Test = {};
    test.a1 = 'value';
 `,
  `
    /** Not developerPreview */
    class Test {
      /** @deprecated */
      a1: string;
      /** @developerPreview */
      a2: string;
    }
    const test = new Test();
    test.a1 = 'value';
 `,
  `
    /** Not developerPreview */
    const test = {};
    if (test) return;
 `,
  `
    /** Not developerPreview */
    function test() {}
    test();
 `,
  `
    /** @developerPreview */
    declare module "some-module" {}
 `,
  `
  import { regularFunction, developerPreviewFunction } from './dev-preview';
  
  regularFunction();
  `,
  `
  import { RegularClass, DeveloperPreviewClass } from './dev-preview';
  
  const instance = new RegularClass();
  `,
  `
  import { developerPreviewFunction } from './dev-preview';
  
  export { developerPreviewFunction as alias };
  `,
  `export * from './dev-preview';`,
  `
  /** @developerPreview */
  declare function test(): void;
  `,
  `
  /** @developerPreview */
  declare const test: () => void;
  `,
  `
  import { regularConst } from './dev-preview';
  const myConst = regularConst;
  `,
  `
  import { regularConst } from './dev-preview';
  const myConst = { prop: regularConst };
  `,
  `
  import { SomeInterface } from './dev-preview';
  const obj: SomeInterface = {};
  const { regularItem } = obj;
  `,
  `
  import { something } from './non-existing';
  const myVar = something;
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if a developer preview interface is used',
    annotatedSource: `
        /** @developerPreview */
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
    description:
      'should fail if a developer preview interface is used in generic',
    annotatedSource: `
        /** @developerPreview */
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
    description:
      'should fail if a developer preview interface function is called',
    annotatedSource: `
        interface Test {
          good?: () => void;
          /** @developerPreview */
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
    description:
      'should fail if a developer preview interface attribute is used',
    annotatedSource: `
        interface Test {
          good?: string;
          /** @developerPreview */
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
      'should fail if a developer preview class attribute is destructured',
    annotatedSource: `
        class Test {
          good?: string;
          /** @developerPreview */
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
    description:
      'should fail if a deep developer preview interface attribute is used',
    annotatedSource: `
        interface Test {
          a: {
            /** @developerPreview */
            b: {
              c: string;
            };
          };
        };
        const test: Test = { a: { b: { c: '' } } };
        test.a.b.c = 'value';
               ~
`,
    messageId,
    data: {
      name: 'b',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if a developer preview class is used',
    annotatedSource: `
        /** @developerPreview */
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
    description: 'should fail if a developer preview class is constructed',
    annotatedSource: `
        /** @developerPreview */
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
    description:
      'should fail if a developer preview class attribute is assigned',
    annotatedSource: `
        class Test {
          good?: string;
          /** @developerPreview */
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
    description: 'should fail if a developer preview class function is called',
    annotatedSource: `
        class Test {
          /** @developerPreview */
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
    description: 'should fail if a developer preview class attribute is used',
    annotatedSource: `
        class Test {
          good?: string;
          /** @developerPreview */
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
    description: 'should fail if a developer preview class function is used',
    annotatedSource: `
        class Test {
          good() {}
          /** @developerPreview */
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
    description: 'should fail if a developer preview class expression is used',
    annotatedSource: `
        /** @developerPreview */
        const Test = class {};
        const test = new Test();
                         ~~~~
`,
    messageId,
    data: {
      name: 'Test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if a developer preview type is used',
    annotatedSource: `
        /** @developerPreview */
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
    description: 'should fail if a developer preview function is used',
    annotatedSource: `
        /** @developerPreview */
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
    description: 'should fail if a developer preview arrow function is used',
    annotatedSource: `
        /** @developerPreview */
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
      'should fail if a developer preview function with assignment pattern is used',
    annotatedSource: `
        /** @developerPreview */
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
    description: 'should fail if a developer preview let is used',
    annotatedSource: `
        /** @developerPreview */
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
    description: 'should fail if a developer preview constant is used',
    annotatedSource: `
        /** @developerPreview */
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
    description:
      'should fail if a developer preview constant is used in a loop',
    annotatedSource: `
        /** @developerPreview */
        const test = [];
        for (const value of test) {}
                            ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a developer preview constant is used in a ternary',
    annotatedSource: `
        /** @developerPreview */
        const test = true;
        const value = test ? 'yes' : 'no';
                      ~~~~
`,
    messageId,
    data: {
      name: 'test',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if a developer preview constant is assigned',
    annotatedSource: `
        /** @developerPreview */
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
      'should fail if a developer preview constant is used in a function call',
    annotatedSource: `
        /** @developerPreview */
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
    description:
      'should fail if a developer preview deep object property is used',
    annotatedSource: `
        /** @developerPreview */
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
      'should fail if a developer preview constant is used in object spread',
    annotatedSource: `
        /** @developerPreview */
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
      'should fail if a developer preview constant is used in array spread',
    annotatedSource: `
        /** @developerPreview */
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
    description: 'should fail if a developer preview function type is used',
    annotatedSource: `
        type A = () => {
          /** @developerPreview */
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
    description:
      'should fail if a developer preview const is used in an assignment pattern',
    annotatedSource: `
      /** @developerPreview */
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
    description: 'should fail if a developer preview property is used',
    annotatedSource: `
        const test = {
          a: '',
          /** @developerPreview */
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
    description:
      'should fail if a developer preview constant is used in a template expression',
    annotatedSource: `
        /** @developerPreview */
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
    description: 'should fail if a developer preview enum is used',
    annotatedSource: `
        /** @developerPreview */
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
    description: 'should fail if a developer preview enum member is used',
    annotatedSource: `
        enum Test {
          member1 = 1,
          /** @developerPreview */
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
      'should fail if a developer preview tagged template expression is used',
    annotatedSource: `
        /** @developerPreview */
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
    description:
      'should fail if a developer preview imported function is called',
    annotatedSource: `
      import { developerPreviewFunction } from './dev-preview';
  
      developerPreviewFunction();
      ~~~~~~~~~~~~~~~~~~~~~~~~
`,
    messageId,
    data: {
      name: 'developerPreviewFunction',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a developer preview imported aliased function is called',
    annotatedSource: `
      import { developerPreviewFunction as alias } from './dev-preview';
  
      alias();
      ~~~~~
`,
    messageId,
    data: {
      name: 'alias',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if a developer preview imported class is used',
    annotatedSource: `
      import { DeveloperPreviewClass } from './dev-preview';
  
      const instance = new DeveloperPreviewClass();
                           ~~~~~~~~~~~~~~~~~~~~~
`,
    messageId,
    data: {
      name: 'DeveloperPreviewClass',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if a developer preview imported const is used',
    annotatedSource: `
      import { developerPreviewConst } from './dev-preview';

      const myConst = developerPreviewConst;
                      ~~~~~~~~~~~~~~~~~~~~~
`,
    messageId,
    data: {
      name: 'developerPreviewConst',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a developer preview imported const is used in an object',
    annotatedSource: `
      import { developerPreviewConst } from './dev-preview';

      const myConst = { prop: developerPreviewConst };
                              ~~~~~~~~~~~~~~~~~~~~~
`,
    messageId,
    data: {
      name: 'developerPreviewConst',
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if a developer preview object property is used in a destructuring',
    annotatedSource: `
      import { SomeInterface } from './dev-preview';

      const obj: SomeInterface = {};
      const { developerPreviewItem } = obj;
              ~~~~~~~~~~~~~~~~~~~~
`,
    messageId,
    data: {
      name: 'developerPreviewItem',
    },
  }),
];
