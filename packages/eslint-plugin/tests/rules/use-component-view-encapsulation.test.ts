import {
  convertAnnotatedSourceToFailureCase,
  RuleTester,
} from '@angular-eslint/utils';
import type { MessageIds } from '../../src/rules/use-component-view-encapsulation';
import rule, {
  RULE_NAME,
} from '../../src/rules/use-component-view-encapsulation';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId: MessageIds = 'useComponentViewEncapsulation';

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
    @Component({
      encapsulation: ViewEncapsulation.Emulated,
      selector: 'app-foo-bar'
    })
    export class Test {}
`,
    `
    @Component({
      encapsulation: ViewEncapsulation.Native,
      selector: 'app-foo-bar'
    })
    export class Test {}
`,
    `
    @Component({
      encapsulation: ViewEncapsulation.ShadowDom,
      selector: 'app-foo-bar'
    })
    export class Test {}
`,
    `
    @Component({
      selector: 'app-foo-bar'
    })
    export class Test {}
`,
    `
    @NgModule({
      bootstrap: [Foo]
    })
    export class Test {}
`,
  ],
  invalid: [
    convertAnnotatedSourceToFailureCase({
      description: 'it should fail if ViewEncapsulation.None is set',
      annotatedSource: `
        @Component({
          encapsulation: ViewEncapsulation.None,
                         ~~~~~~~~~~~~~~~~~~~~~~
          selector: 'app-foo-bar',
        })
        export class Test {}
      `,
      messageId,
    }),
  ],
});
