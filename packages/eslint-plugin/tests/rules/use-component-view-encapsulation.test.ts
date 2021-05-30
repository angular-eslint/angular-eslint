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
const suggestRemoveViewEncapsulationNone: MessageIds =
  'suggestRemoveViewEncapsulationNone';

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
      selector: 'app-foo-bar',
    })
    export class Test {}
    `,
    `
    @Component({
      encapsulation: ViewEncapsulation.ShadowDom,
    })
    export class Test {}
    `,
    `
    function encapsulation() {
      return ViewEncapsulation.None;
    }

    @Component({
      encapsulation: encapsulation()
    })
    export class Test {}
    `,
    `
    const encapsulation = 'templateUrl';
    @Component({
      [encapsulation]: '../a.html'
    })
    export class Test {}
    `,
    `
    const encapsulation = 'templateUrl';
    @Component({
      encapsulation
    })
    export class Test {}
    `,
    `
    const test = 'test';
    @Component({
      encapsulation: test,
    })
    export class Test {}
    `,
    `
    @Component({
      encapsulation: undefined,
    })
    export class Test {}
    `,
    `
    const options = {};
    @Component(options)
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
      description: 'it should fail if `ViewEncapsulation.None` is set',
      annotatedSource: `
        @Component({
          encapsulation: ViewEncapsulation.None,
                                           ~~~~
          selector: 'app-foo-bar',
        })
        export class Test {}
      `,
      messageId,
      suggestions: [
        {
          messageId: suggestRemoveViewEncapsulationNone,
          output: `
        @Component({
          
                                           
          selector: 'app-foo-bar',
        })
        export class Test {}
      `,
        },
      ],
    }),
    convertAnnotatedSourceToFailureCase({
      description:
        'it should fail if `ViewEncapsulation.None` is set and the suggestions should remove it along with its import',
      annotatedSource: `
        import { ViewEncapsulation } from '@angular/core';
        import { HttpClient } from '@angular/common/http';

        @Component({
          selector: 'app-foo-bar',
          encapsulation: ViewEncapsulation.None
                                           ~~~~
        })
        export class Test {}
      `,
      messageId,
      suggestions: [
        {
          messageId: suggestRemoveViewEncapsulationNone,
          output: `
        
        import { HttpClient } from '@angular/common/http';

        @Component({
          selector: 'app-foo-bar',
          
                                           
        })
        export class Test {}
      `,
        },
      ],
    }),
  ],
});
