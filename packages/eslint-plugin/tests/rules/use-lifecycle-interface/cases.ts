import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import { ASTUtils } from '@angular-eslint/utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/use-lifecycle-interface';

const messageId: MessageIds = 'useLifecycleInterface';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    class Test implements OnInit {
      ngOnInit() {}
    }
    `,
  `class Test implements DoBootstrap {
      ngDoBootstrap() {}
    }
    `,
  `
    class Test extends Component implements OnInit, OnDestroy  {
      ngOnInit() {}

      private ngOnChanges = '';

      ngOnDestroy() {}

      ngOnSmth() {}
    }
    `,
  `
    class Test extends Component implements ng.OnInit, ng.OnDestroy  {
      ngOnInit() {}

      private ngOnChanges = '';

      ngOnDestroy() {}

      ngOnSmth() {}
    }
    `,
  'class Test {}',
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if lifecycle method is declared without implementing its interface',
    annotatedSource: `
        @Component()
        class Test {
          ngOnInit() {
          ~~~~~~~~
          }
        }
      `,
    messageId,
    data: {
      interfaceName: ASTUtils.AngularLifecycleInterfaces.OnInit,
      methodName: ASTUtils.AngularLifecycleMethods.ngOnInit,
    },
    annotatedOutput: `import { OnInit } from '@angular/core';

        @Component()
        class Test implements OnInit {
          ngOnInit() {
          
          }
        }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if one of the lifecycle methods is declared without implementing its interface',
    annotatedSource: `import { OnInit } from '@angular/core';

        @Directive()
        class Test extends Component implements OnInit {
          ngOnInit() {}

          ngOnDestroy() {
          ~~~~~~~~~~~
          }
        }
      `,
    messageId,
    data: {
      interfaceName: ASTUtils.AngularLifecycleInterfaces.OnDestroy,
      methodName: ASTUtils.AngularLifecycleMethods.ngOnDestroy,
    },
    annotatedOutput: `import { OnInit, OnDestroy } from '@angular/core';

        @Directive()
        class Test extends Component implements OnInit, OnDestroy {
          ngOnInit() {}

          ngOnDestroy() {
          
          }
        }
      `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if lifecycle methods are declared without implementing their interfaces',
    annotatedSource: `
        @Injectable()
        class Test {
          ngDoBootstrap() {}
          ~~~~~~~~~~~~~

          ngOnInit() {}
          ^^^^^^^^

          ngOnDestroy() {}
          ###########
        }
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: {
          interfaceName: ASTUtils.AngularLifecycleInterfaces.DoBootstrap,
          methodName: ASTUtils.AngularLifecycleMethods.ngDoBootstrap,
        },
      },
      {
        char: '^',
        messageId,
        data: {
          interfaceName: ASTUtils.AngularLifecycleInterfaces.OnInit,
          methodName: ASTUtils.AngularLifecycleMethods.ngOnInit,
        },
      },
      {
        char: '#',
        messageId,
        data: {
          interfaceName: ASTUtils.AngularLifecycleInterfaces.OnDestroy,
          methodName: ASTUtils.AngularLifecycleMethods.ngOnDestroy,
        },
      },
    ],
    // These are the result of each pass of the auto-fixer, with the final entry being the ultimate result the user sees
    annotatedOutputs: [
      `import { DoBootstrap } from '@angular/core';

        @Injectable()
        class Test implements DoBootstrap {
          ngDoBootstrap() {}
                       

          ngOnInit() {}
                  

          ngOnDestroy() {}
          
        }
      `,
      `import { DoBootstrap, OnInit } from '@angular/core';

        @Injectable()
        class Test implements DoBootstrap, OnInit {
          ngDoBootstrap() {}
                       

          ngOnInit() {}
                  

          ngOnDestroy() {}
          
        }
      `,
      `import { DoBootstrap, OnInit, OnDestroy } from '@angular/core';

        @Injectable()
        class Test implements DoBootstrap, OnInit, OnDestroy {
          ngDoBootstrap() {}
                       

          ngOnInit() {}
                  

          ngOnDestroy() {}
          
        }
      `,
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if lifecycle methods are declared without implementing their interfaces, using namespace',
    annotatedSource: `
        @NgModule()
        class Test extends Component implements ng.OnInit {
          ngOnInit() {}

          ngOnDestroy() {
          ~~~~~~~~~~~
          }
        }
      `,
    messageId,
    data: {
      interfaceName: ASTUtils.AngularLifecycleInterfaces.OnDestroy,
      methodName: ASTUtils.AngularLifecycleMethods.ngOnDestroy,
    },
    annotatedOutput: `import { OnDestroy } from '@angular/core';

        @NgModule()
        class Test extends Component implements ng.OnInit, OnDestroy {
          ngOnInit() {}

          ngOnDestroy() {
          
          }
        }
      `,
  }),
];
