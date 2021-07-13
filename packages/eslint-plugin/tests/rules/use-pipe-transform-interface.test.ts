import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/use-pipe-transform-interface';
import rule, { RULE_NAME } from '../../src/rules/use-pipe-transform-interface';

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
    @Component({ template: 'test' })
    class Test {}
    `,
    `
    @Pipe({ name: 'test' })
    class Test implements PipeTransform {
      transform(value: string) {}
    }
    `,
    `
    @OtherDecorator() @Pipe({ name: 'test' })
    class Test implements PipeTransform {
      transform(value: string) {}
    }
    `,
    `
    @Pipe({ name: 'test' })
    class Test implements ng.PipeTransform {
      transform(value: string) {}
    }
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if a `Pipe` has no interface implemented',
      annotatedSource: `
        @Pipe({ name: 'test' })
        class Test {
              ~~~~
          transform(value: string) {}
        }
      `,
      messageId,
      annotatedOutput: `import { PipeTransform } from '@angular/core';

        @Pipe({ name: 'test' })
        class Test implements PipeTransform {
              ~~~~
          transform(value: string) {}
        }
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if a `Pipe` implements a interface, but not the `PipeTransform`',
      annotatedSource: `
        import { HttpClient } from '@angular/common/http';
        import type { PipeTransform } from '@angular/core';
        import { Component,
          Pipe,
          Directive } from '@angular/core';

        @Pipe({ name: 'test' })
        class Test implements AnInterface {
              ~~~~
          transform(value: string) {}
        }
      `,
      messageId,
      annotatedOutput: `
        import { HttpClient } from '@angular/common/http';
        import type { PipeTransform } from '@angular/core';
        import { Component,
          Pipe,
          Directive } from '@angular/core';

        @Pipe({ name: 'test' })
        class Test implements AnInterface, PipeTransform {
              ~~~~
          transform(value: string) {}
        }
      `,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if a `Pipe` implements interfaces, but not the `PipeTransform`',
      annotatedSource: `
        import type { OnInit } from '@angular/core';

        @OtherDecorator() @Pipe({ name: 'test' })
        class Test implements AnInterface, AnotherInterface {
              ~~~~
          transform(value: string) {}
        }
      `,
      messageId,
      annotatedOutput: `
        import type { OnInit, PipeTransform } from '@angular/core';

        @OtherDecorator() @Pipe({ name: 'test' })
        class Test implements AnInterface, AnotherInterface, PipeTransform {
              ~~~~
          transform(value: string) {}
        }
      `,
    }),
  ],
});
