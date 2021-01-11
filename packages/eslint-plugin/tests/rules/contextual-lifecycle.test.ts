import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/contextual-lifecycle';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'contextuaLifecycle';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Injectable()
    class Test {
      ngOnDestroy() { console.log('OnDestroy'); }
    }
    `,
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
    @Injectable()
    class Test {
      ngOnDestroy() { console.log('OnDestroy'); }
    }
    `,
    `
    @NgModule()
    class Test {
      ngDoBootstrap() {}
    }
    `,
    `
    @Pipe()
    class Test {
      ngOnDestroy() { console.log('OnDestroy'); }
    }
    `,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Component should fail if ngDoBootstrap() method is present',
      annotatedSource: `
        @Component()
        class Test {
          ngDoBootstrap() {}
          ~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Directive should fail if ngDoBootstrap() method is present',
      annotatedSource: `
        @Directive()
        class Test {
          ngDoBootstrap() {}
          ~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Injectable should fail if ngAfterContentChecked() method is present',
      annotatedSource: `
        @Injectable()
        class Test {
            ngAfterContentChecked() { console.log('AfterContentChecked'); }
            ~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Injectable should fail if ngAfterContentInit() method is present',
      annotatedSource: `
        @Injectable()
        class Test {
          ngAfterContentInit() { console.log('ngAfterContentInit'); }
          ~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Injectable should fail if ngAfterViewInit() method is present',
      annotatedSource: `
        @Injectable()
        class Test {
          ngAfterViewInit() { console.log('ngAfterViewInit'); }
          ~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Injectable should fail if ngDoBootstrap() method is present',
      annotatedSource: `
        @Injectable()
        class Test {
          ngDoBootstrap() {}
          ~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Injectable should fail if ngDoCheck() method is present',
      annotatedSource: `
        @Injectable()
        class Test {
          ngDoCheck() { console.log('ngDoCheck'); }
          ~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Injectable should fail if ngOnChanges() method is present',
      annotatedSource: `
        @Injectable()
        class Test {
          ngOnChanges() { console.log('ngOnChanges'); }
          ~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Injectable should fail if ngOnInit() method is present',
      annotatedSource: `
        @Injectable()
        class Test {
          ngOnInit() { console.log('ngOnInit'); }
          ~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @NgModule should fail if ngAfterContentChecked() method is present',
      annotatedSource: `
        @NgModule()
        class Test {
          ngAfterContentChecked() { console.log('ngAfterContentChecked'); }
          ~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @NgModule should fail if ngAfterContentInit() method is present',
      annotatedSource: `
        @NgModule()
        class Test {
          ngAfterContentInit() { console.log('ngAfterContentInit'); }
          ~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @NgModule should fail if ngAfterViewChecked() method is present',
      annotatedSource: `
        @NgModule()
        class Test {
          ngAfterViewChecked() { console.log('ngAfterViewChecked'); }
          ~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @NgModule should fail if ngAfterViewInit() method is present',
      annotatedSource: `
        @NgModule()
        class Test {
          ngAfterViewInit() { console.log('ngAfterViewInit'); }
          ~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @NgModule should fail if ngDoCheck() method is present',
      annotatedSource: `
        @NgModule()
        class Test {
          ngDoCheck() { console.log('ngDoCheck'); }
          ~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @NgModule should fail if ngOnChanges() method is present',
      annotatedSource: `
        @NgModule()
        class Test {
          ngOnChanges() { console.log('ngOnChanges'); }
          ~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @NgModule should fail if ngOnInit() method is present',
      annotatedSource: `
        @NgModule()
        class Test {
          ngOnInit() { console.log('ngOnInit'); }
          ~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @NgModule should fail if ngOnDestroy() method is present',
      annotatedSource: `
        @NgModule()
        class Test {
          ngOnDestroy() { console.log('ngOnDestroy'); }
          ~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Pipe should fail if ngAfterContentChecked() method is present',
      annotatedSource: `
        @Pipe()
        class Test {
          ngAfterContentChecked() { console.log('ngAfterContentChecked'); }
          ~~~~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Pipe should fail if ngAfterContentInit() method is present',
      annotatedSource: `
        @Pipe()
        class Test {
          ngAfterContentInit() { console.log('ngAfterContentInit'); }
          ~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Pipe should fail if ngAfterViewChecked() method is present',
      annotatedSource: `
        @Pipe()
        class Test {
          ngAfterViewChecked() { console.log('ngAfterViewChecked'); }
          ~~~~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Pipe should fail if ngAfterViewInit() method is present',
      annotatedSource: `
        @Pipe()
        class Test {
          ngAfterViewInit() { console.log('ngAfterViewInit'); }
          ~~~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Pipe should fail if ngDoBootstrap() method is present',
      annotatedSource: `
        @Pipe()
        class Test {
          ngDoBootstrap() {}
          ~~~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Pipe should fail if ngDoCheck() method is present',
      annotatedSource: `
        @Pipe()
        class Test {
          ngDoCheck() { console.log('ngDoCheck'); }
          ~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Pipe should fail if ngOnChanges() method is present',
      annotatedSource: `
        @Pipe()
        class Test {
          ngOnChanges() { console.log('ngOnChanges'); }
          ~~~~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'Class with @Pipe should fail if ngOnInit() method is present',
      annotatedSource: `
        @Pipe()
        class Test {
          ngOnInit() { console.log('ngOnInit'); }
          ~~~~~~~~
        }
      `,
      messageId,
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'It should fail if @Directive and @Pipe decorators are present on the same file and the @Pipe contains a non allowed method',
      annotatedSource: `
        @Pipe()
        class Test implements DoCheck {
          constructor() {}
          
          ngDoCheck() {}
          ~~~~~~~~~
        }
        
        @Directive()
        class TestDirective implements OnInit {
          ngOnInit() {
            console.log('Initialized');
          }
        }
      `,
      messageId,
    }),
  ],
});
