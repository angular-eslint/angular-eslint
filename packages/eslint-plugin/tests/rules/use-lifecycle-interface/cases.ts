import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/use-lifecycle-interface';
import {
  AngularLifecycleInterfaces,
  AngularLifecycleMethods,
} from '../../../src/utils/utils';

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
      interfaceName: AngularLifecycleInterfaces.OnInit,
      methodName: AngularLifecycleMethods.ngOnInit,
    },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'it should fail if one of the lifecycle methods is declared without implementing its interface',
    annotatedSource: `
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
      interfaceName: AngularLifecycleInterfaces.OnDestroy,
      methodName: AngularLifecycleMethods.ngOnDestroy,
    },
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
          interfaceName: AngularLifecycleInterfaces.DoBootstrap,
          methodName: AngularLifecycleMethods.ngDoBootstrap,
        },
      },
      {
        char: '^',
        messageId,
        data: {
          interfaceName: AngularLifecycleInterfaces.OnInit,
          methodName: AngularLifecycleMethods.ngOnInit,
        },
      },
      {
        char: '#',
        messageId,
        data: {
          interfaceName: AngularLifecycleInterfaces.OnDestroy,
          methodName: AngularLifecycleMethods.ngOnDestroy,
        },
      },
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
      interfaceName: AngularLifecycleInterfaces.OnDestroy,
      methodName: AngularLifecycleMethods.ngOnDestroy,
    },
  }),
];
