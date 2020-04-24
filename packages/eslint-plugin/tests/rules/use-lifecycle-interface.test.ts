import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import rule, {
  MessageIds,
  RULE_NAME,
} from '../../src/rules/use-lifecycle-interface';
import {
  AngularLifecycleInterfaces,
  AngularLifecycleMethods,
} from '../../src/utils/utils';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'useLifecycleInterface';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    class Test implements OnInit {
      ngOnInit() {}
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
    `
    class Test {}
`,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if lifecycle method is declared without implementing its interface',
      annotatedSource: `
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
    {
      // it should fail if lifecycle methods are declared without implementing their interfaces
      code: `
      class Test {
        ngOnInit() {}

        ngOnDestroy() {}
      }
`,
      errors: [
        {
          messageId: 'useLifecycleInterface',
          data: {
            interfaceName: AngularLifecycleInterfaces.OnInit,
            methodName: AngularLifecycleMethods.ngOnInit,
          },
          line: 3,
          column: 9,
        },
        {
          messageId: 'useLifecycleInterface',
          data: {
            interfaceName: AngularLifecycleInterfaces.OnDestroy,
            methodName: AngularLifecycleMethods.ngOnDestroy,
          },
          line: 5,
          column: 9,
        },
      ],
    },
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if lifecycle methods are declared without implementing their interfaces, using namespace',
      annotatedSource: `
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
  ],
});
