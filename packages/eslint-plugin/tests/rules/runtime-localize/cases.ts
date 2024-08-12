import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { MessageIds, Options } from '../../../src/rules/runtime-localize';

const messageId: MessageIds = 'runtimeLocalize';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    function test() { return $localize\`foo\`; }
  `,
  `
    const test = function () { return $localize\`foo\`; }
  `,
  `
    const test = () => $localize\`foo\`;
  `,
  `
    function test(foo = $localize\`foo\`) { return foo; }
  `,
  `
    class Test {
      foo() { $localize\`foo\`; }
    }
  `,
  `
    class Test {
      foo = () => $localize\`foo\`;
    }
  `,
  `
    class Test {
      static foo = () => $localize\`foo\`;
    }
  `,
  `
    class Test {
      readonly foo = $localize\`foo\`;
    }
  `,
  `
    class Test {
      readonly foo = { x: [\`--\${$localize\`foo\`}--\`] };
    }
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail when $localize is assigned at the file-level',
    annotatedSource: `
        const foo = $localize\`foo\`;
                    ~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when $localize is nested within a file-level variable initializer',
    annotatedSource: `
        let foo = {
          x: [{
            y: \`--\${$localize\`foo\`}--\`
                    ~~~~~~~~~
          }]
        };
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when $localize is passed to a function at the file-level',
    annotatedSource: `
        (x => { return x; })($localize\`foo\`);
                             ~~~~~~~~~
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when $localize initializes a static class property',
    annotatedSource: `
        class Test {
          static foo = $localize\`foo\`;
                       ~~~~~~~~~
        }
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when $localize is nested within a static class property initializer',
    annotatedSource: `
        class Test {
          static foo = {
            x: [{
              y: \`--\${$localize\`foo\`}--\`
                      ~~~~~~~~~
            }]
          }
        }
      `,
    messageId,
  }),
];
