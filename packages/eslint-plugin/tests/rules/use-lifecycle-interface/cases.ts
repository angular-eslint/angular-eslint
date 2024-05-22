import {
  ASTUtils,
  convertAnnotatedSourceToFailureCase,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/use-lifecycle-interface';

const messageId: MessageIds = 'useLifecycleInterface';

export const valid = [
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

export const invalid = [
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
    // NOTE: Only one case will be auto-fixed in the output because RuleTester executes once: https://github.com/eslint/eslint/issues/11187
    annotatedOutput: `import { DoBootstrap } from '@angular/core';

        @Injectable()
        class Test implements DoBootstrap {
          ngDoBootstrap() {}
                       

          ngOnInit() {}
                  

          ngOnDestroy() {}
          
        }
      `,
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
