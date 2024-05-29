import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/contextual-lifecycle';

const messageId: MessageIds = 'contextualLifecycle';

export const valid = [
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
];

export const invalid = [
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
    data: { classDecoratorName: 'Component', methodName: 'ngDoBootstrap' },
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
    data: { classDecoratorName: 'Directive', methodName: 'ngDoBootstrap' },
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
    data: {
      classDecoratorName: 'Injectable',
      methodName: 'ngAfterContentChecked',
    },
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
    data: {
      classDecoratorName: 'Injectable',
      methodName: 'ngAfterContentInit',
    },
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
    data: { classDecoratorName: 'Injectable', methodName: 'ngAfterViewInit' },
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
    data: { classDecoratorName: 'Injectable', methodName: 'ngDoBootstrap' },
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
    data: { classDecoratorName: 'Injectable', methodName: 'ngDoCheck' },
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
    data: { classDecoratorName: 'Injectable', methodName: 'ngOnChanges' },
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
    data: { classDecoratorName: 'Injectable', methodName: 'ngOnInit' },
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
    data: {
      classDecoratorName: 'NgModule',
      methodName: 'ngAfterContentChecked',
    },
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
    data: {
      classDecoratorName: 'NgModule',
      methodName: 'ngAfterContentInit',
    },
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
    data: {
      classDecoratorName: 'NgModule',
      methodName: 'ngAfterViewChecked',
    },
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
    data: { classDecoratorName: 'NgModule', methodName: 'ngAfterViewInit' },
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
    data: { classDecoratorName: 'NgModule', methodName: 'ngDoCheck' },
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
    data: { classDecoratorName: 'NgModule', methodName: 'ngOnChanges' },
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
    data: { classDecoratorName: 'NgModule', methodName: 'ngOnInit' },
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
    data: { classDecoratorName: 'NgModule', methodName: 'ngOnDestroy' },
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
    data: { classDecoratorName: 'Pipe', methodName: 'ngAfterContentChecked' },
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
    data: { classDecoratorName: 'Pipe', methodName: 'ngAfterContentInit' },
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
    data: { classDecoratorName: 'Pipe', methodName: 'ngAfterViewChecked' },
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
    data: { classDecoratorName: 'Pipe', methodName: 'ngAfterViewInit' },
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
    data: { classDecoratorName: 'Pipe', methodName: 'ngDoBootstrap' },
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
    data: { classDecoratorName: 'Pipe', methodName: 'ngDoCheck' },
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
    data: { classDecoratorName: 'Pipe', methodName: 'ngOnChanges' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'Class with @Pipe should fail if ngOnInit() method is present',
    annotatedSource: `
        @Pipe()
        class Test {
          ngOnInit() { console.log('ngOnInit'); }
          ~~~~~~~~
        }
      `,
    messageId,
    data: { classDecoratorName: 'Pipe', methodName: 'ngOnInit' },
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
    data: { classDecoratorName: 'Pipe', methodName: 'ngDoCheck' },
  }),
];
