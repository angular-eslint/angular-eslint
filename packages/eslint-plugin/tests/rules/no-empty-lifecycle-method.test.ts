import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/no-empty-lifecycle-method';

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
    @Component()
    class Test {
      ngAfterContentInit() { console.log('AfterContentInit'); }
    }
    `,
    `
    @Component()
    class Test {
      ngAfterViewChecked() { console.log('AfterViewChecked'); }
    }
    `,
    `
    @Component()
    class Test {
      ngAfterViewInit() { console.log('AfterViewInit'); }
    }
    `,
    `
    @Component()
    class Test {
      ngDoCheck() { console.log('DoCheck'); }
    }`,
    `
    @Component()
    class Test {
      ngOnChanges() { console.log('OnChanges'); }
    }
    `,
    `
    @Component()
    class Test {
      ngOnDestroy() { console.log('OnDestroy'); }
    }
    `,
    `
    @Component()
    class Test {
      ngOnInit() { console.log('OnInit'); }
    }
    `,
    `
    @Directive()
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
    @Directive()
    class Test {
      ngAfterViewChecked() { console.log('AfterViewChecked'); }
    }
    `,
    `
    @Directive()
    class Test {
      ngAfterViewInit() { console.log('AfterViewInit'); }
    }
    `,
    `
    @Directive()
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
    @Directive()
    class Test {
      ngOnDestroy() { console.log('OnDestroy'); }
    }
    `,
    `
    @Directive()
    class Test {
      ngOnInit() { console.log('OnInit'); }
    }
    `,
    `
    class Test {
      ngOnInit() { }
    }
    `,
    `
    @NgModule()
    class Test {
      ngOnInit() { console.log('ngOnInit') }
    }
    `,
    `
    @Pipe()
    class Test {
      ngDoBootstrap() { console.log('ngDoBootstrap') }
    }
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Component should fail if ngAfterContentChecked() method is empty',
      annotatedSource: `
        @Component()
        class Test {
          ngAfterContentChecked() { }
          ~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Component should fail if ngAfterContentInit() method is empty',
      annotatedSource: `
        @Component()
        class Test {
          ngAfterContentInit() { }
          ~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Component should fail if ngAfterViewChecked() method is empty',
      annotatedSource: `
        @Component()
        class Test {
          ngAfterViewChecked() { }
          ~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Component should fail if ngAfterViewInit() method is empty',
      annotatedSource: `
        @Component()
        class Test {
          ngAfterViewInit() { }
          ~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Component should fail if ngDoBootstrap() method is empty',
      annotatedSource: `
        @Component()
        class Test {
          ngDoBootstrap() { }
          ~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Component should fail if ngDoCheck() method is empty',
      annotatedSource: `
        @Component()
        class Test {
          ngDoCheck() { }
          ~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Component should fail if ngOnChanges() method is empty',
      annotatedSource: `
        @Component()
        class Test {
          ngOnChanges() { }
          ~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Component should fail if ngOnDestroy() method is empty',
      annotatedSource: `
        @Component()
        class Test {
          ngOnDestroy() { }
          ~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Component should fail if ngOnInit() method is empty',
      annotatedSource: `
        @Component()
        class Test {
          ngOnInit() { }
          ~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Directive should fail if ngAfterContentChecked() method is empty',
      annotatedSource: `
        @Directive()
        class Test {
          ngAfterContentChecked() { }
          ~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Directive should fail if ngAfterContentInit() method is empty',
      annotatedSource: `
        @Directive()
        class Test {
          ngAfterContentInit() { }
          ~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Directive should fail if ngAfterViewChecked() method is empty',
      annotatedSource: `
        @Directive()
        class Test {
          ngAfterViewChecked() { }
          ~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Directive should fail if ngAfterViewInit() method is empty',
      annotatedSource: `
        @Directive()
        class Test {
          ngAfterViewInit() { }
          ~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Directive should fail if ngDoBootstrap() method is empty',
      annotatedSource: `
        @Directive()
        class Test {
          ngDoBootstrap() { }
          ~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Directive should fail if ngDoCheck() method is empty',
      annotatedSource: `
        @Directive()
        class Test {
          ngDoCheck() { }
          ~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Directive should fail if ngOnChanges() method is empty',
      annotatedSource: `
        @Directive()
        class Test {
          ngOnChanges() { }
          ~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Directive should fail if ngOnDestroy() method is empty',
      annotatedSource: `
        @Directive()
        class Test {
          ngOnDestroy() { }
          ~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Directive should fail if ngOnInit() method is empty',
      annotatedSource: `
        @Directive()
        class Test {
          ngOnInit() { }
          ~~~~~~~~
        }
      `,
      messageId,
    }),
  ],
});
