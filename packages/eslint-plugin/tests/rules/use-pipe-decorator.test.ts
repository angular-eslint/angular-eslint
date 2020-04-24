import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/use-pipe-decorator';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'usePipeDecorator';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
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
    `
    export class TestPipe {
      transform(value: string) {}
    }
`,
    `
    export class TestPipe implements NgTransform, OnInit {
      transform(value: string) {}
    }
`,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if a class implements PipeTransform interface without using @Pipe decorator',
      annotatedSource: `
        @Test()
        export class Test implements PipeTransform {}
               ~~~~~                                ~
`,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if a class implements PipeTransform interface (using namespace) without using @Pipe decorator',
      annotatedSource: `
        @Test()
        export class Test implements ng.PipeTransform {}
               ~~~~~                                   ~
`,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if a class implements PipeTransform interface without using @Pipe or any decorator',
      annotatedSource: `
        export class TestPipe implements PipeTransform {
               ~~~~~
          transform(value: string) {}
        }
        ~
`,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if a class implements PipeTransform interface without using @Pipe decorator, but multiple others',
      annotatedSource: `
        @Test()
        @Test2()
        export class Test implements PipeTransform {
               ~~~~~
        }
        ~
`,
      messageId,
    }),
  ],
});
