import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/use-pipe-transform-interface';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'usePipeTransformInterface';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Pipe({ name: 'test' })
    export class TestPipe implements PipeTransform {
      transform(value: string) {}
    }
 `,
    `
    @OtherDecorator()
    @Pipe({ name: 'test' })
    export class TestPipe implements PipeTransform {
      transform(value: string) {}
    }
`,
    `
    @Pipe({ name: 'test' })
    export class TestPipe implements ng.PipeTransform {
      transform(value: string) {}
    }
`,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if a class is decorated with @Pipe and has no interface implemented',
      annotatedSource: `
        @Pipe({ name: 'test' })
        export class TestPipe {
               ~~~~~
          transform(value: string) {}
        }
        ~
`,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if a class is decorated with @Pipe and does not implement the PipeTransform interface',
      annotatedSource: `
        @Pipe({ name: 'test' })
        export class TestPipe implements AnInterface {
               ~~~~~
          transform(value: string) {}
        }
        ~
`,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if a class is decorated with @Pipe and other decorator and does not implement the PipeTransform interface',
      annotatedSource: `
        @OtherDecorator()
        @Pipe({ name: 'test' })
        export class TestPipe implements AnInterface {
               ~~~~~
          transform(value: string) {}
        }
        ~
`,
      messageId,
    }),
  ],
});
