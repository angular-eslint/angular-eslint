import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/use-component-view-encapsulation';

const messageId: MessageIds = 'useComponentViewEncapsulation';
const suggestRemoveViewEncapsulationNone: MessageIds =
  'suggestRemoveViewEncapsulationNone';

export const valid = [
  `
    @Component({
      encapsulation: ViewEncapsulation.Emulated,
      selector: 'app-foo-bar'
    })
    class Test {}
    `,
  `
    @Component({
      encapsulation: ViewEncapsulation.Native,
      selector: 'app-foo-bar',
    })
    class Test {}
    `,
  `
    @Component({
      encapsulation: ViewEncapsulation.ShadowDom,
    })
    class Test {}
    `,
  `
    function encapsulation() {
      return ViewEncapsulation.None;
    }

    @Component({
      encapsulation: encapsulation()
    })
    class Test {}
    `,
  `
    const encapsulation = 'templateUrl';
    @Component({
      [encapsulation]: '../a.html'
    })
    class Test {}
    `,
  `
    const encapsulation = 'templateUrl';
    @Component({
      encapsulation
    })
    class Test {}
    `,
  `
    const test = 'test';
    @Component({
      encapsulation: test,
    })
    class Test {}
    `,
  `
    @Component({
      encapsulation: undefined,
    })
    class Test {}
    `,
  `
    @Component({})
    class Test {}
    `,
  `
    const options = {};
    @Component(options)
    class Test {}
    `,
  `
    @NgModule({
      bootstrap: [Foo]
    })
    class Test {}
    `,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `encapsulation` is set to `ViewEncapsulation.None`',
    annotatedSource: `
        @Component({
          encapsulation: ViewEncapsulation.None,
                                           ~~~~
          selector: 'app-foo-bar',
        })
        class Test {}
      `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveViewEncapsulationNone,
        output: `
        @Component({
          
                                           
          selector: 'app-foo-bar',
        })
        class Test {}
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `encapsulation` is set to `ViewEncapsulation.None` and the suggestions should remove it along with its import',
    annotatedSource: `
        import { ViewEncapsulation } from '@angular/core';
        import { HttpClient } from '@angular/common/http';

        @Component({
          selector: 'app-foo-bar',
          'encapsulation': ViewEncapsulation.None
                                             ~~~~
        })
        class Test {}
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
        class Test {}
      `,
      },
    ],
  }),
];
