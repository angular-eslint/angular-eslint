import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/no-empty-lifecycle-method';
import rule, { RULE_NAME } from '../../src/rules/no-empty-lifecycle-method';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});
const messageId: MessageIds = 'noEmptyLifecycleMethod';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Component()
    class Test {
      ngAfterContentChecked() { console.log('AfterContentChecked'); }
    }
    `,
    `
    @Directive()
    class Test {
      ngAfterContentInit() { console.log('AfterContentInit'); }
    }
    `,
    `
    @Injectable()
    class Test {
      ngAfterViewChecked() { console.log('AfterViewChecked'); }
    }
    `,
    `
    @NgModule()
    class Test {
      ngAfterViewInit() { console.log('AfterViewInit'); }
    }
    `,
    `
    @Pipe()
    class Test {
      ngDoBootstrap() { console.log('DoBootstrap'); }
    }
    `,
    `
    @Component()
    class Test {
      ngDoCheck() { console.log('DoCheck'); }
    }
    `,
    `
    @Directive()
    class Test {
      ngOnChanges() { console.log('OnChanges'); }
    }
    `,
    `
    @Injectable()
    class Test {
      ngOnDestroy() { console.log('OnDestroy'); }
    }
    `,
    `
    @NgModule()
    class Test {
      ngOnInit() { console.log('OnInit'); }
    }
    `,
    `
    class Test {
      ngOnInit() {}
    }
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngAfterContentChecked() method is empty',
      annotatedSource: `
        @Component()
        class Test {
          ngAfterContentChecked() {}
          ~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngAfterContentInit() method is empty',
      annotatedSource: `
        @Directive()
        class Test {
          ngAfterContentInit() {}
          ~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngAfterViewChecked() method is empty',
      annotatedSource: `
        @Injectable()
        class Test {
          ngAfterViewChecked() {}
          ~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngAfterViewInit() method is empty',
      annotatedSource: `
        @NgModule()
        class Test {
          ngAfterViewInit() {}
          ~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngDoBootstrap() method is empty',
      annotatedSource: `
        @Pipe()
        class Test {
          ngDoBootstrap() {}
          ~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngDoCheck() method is empty',
      annotatedSource: `
        @Component()
        class Test {
          ngDoCheck() {}
          ~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngOnChanges() method is empty',
      annotatedSource: `
        @Directive()
        class Test {
          ngOnChanges() {}
          ~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngOnDestroy() method is empty',
      annotatedSource: `
        @Injectable()
        class Test {
          ngOnDestroy() {}
          ~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngOnInit() method is empty',
      annotatedSource: `
        @NgModule()
        class Test {
          ngOnInit() {}
          ~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
  ],
});
