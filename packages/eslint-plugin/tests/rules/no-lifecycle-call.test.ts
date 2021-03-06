import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, { MessageIds, RULE_NAME } from '../../src/rules/no-lifecycle-call';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'noLifecycleCall';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Component()
    class Test {
      ngAfterContentChecked(): void { 
        super.ngAfterContentChecked(); 
      }
    }

    @Directive()
    class Test {
      test(): void {
        this.ngAfterContentChecked1();
        this.angAfterContentInit();
        this.ngAfterViewChecked2();
        this.ngAfterViewInit3();
        this.ngOnChange$();
        this.ngOnDestroyx();
        this.ngOnInitialize();
        this.ngDoChecking();
        ngOnInit();
      }
    }

    @MyDecorator()
    class Test {
      test(): void {
        ngDoCheck();
      }
    }

    ngOnDestroy();
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngAfterContentChecked() method is called',
      annotatedSource: `
        @Component()
        class Test {
          test(): void {
            this.ngAfterContentChecked();
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngAfterContentInit() method is called',
      annotatedSource: `
        @Directive()
        class Test {
          test(): void {
            this.ngAfterContentInit();
            ~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngAfterViewChecked() method is called',
      annotatedSource: `
        @Injectable()
        class Test {
          test(): void {
            this.ngAfterViewChecked();
            ~~~~~~~~~~~~~~~~~~~~~~~~~
          }
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngAfterViewInit() method is called',
      annotatedSource: `
        @NgModule()
        class Test {
          test(): void {
            this.ngAfterViewInit();
            ~~~~~~~~~~~~~~~~~~~~~~
          }
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngDoBootstrap() method is called',
      annotatedSource: `
        @Pipe()
        class Test {
          test(): void {
            this.ngDoBootstrap();
            ~~~~~~~~~~~~~~~~~~~~
          }
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngDoCheck() method is called',
      annotatedSource: `
        @Component()
        class Test {
          test(): void {
            this.ngDoCheck();
            ~~~~~~~~~~~~~~~~
          }
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngOnChanges() method is called',
      annotatedSource: `
        @Directive()
        class Test {
          test(): void {
            this.ngOnChanges();
            ~~~~~~~~~~~~~~~~~~
          }
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngOnDestroy() method is called',
      annotatedSource: `
        @Injectable()
        class Test {
          test(): void {
            this.ngOnDestroy();
            ~~~~~~~~~~~~~~~~~~
          }
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description: 'should fail if ngOnInit() method is called',
      annotatedSource: `
        @NgModule()
        class Test {
          test(): void {
            this.ngOnInit();
            ~~~~~~~~~~~~~~~
          }
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'should fail if super.<lifecycle method>() is called in a incorrect context',
      annotatedSource: `
        @Component({ template: '' })
        class Test extends ParentComponent {
          test(): void {
            super.ngOnChanges();
            ~~~~~~~~~~~~~~~~~~~
          }
        }
      `,
      messageId,
    }),
  ],
});
