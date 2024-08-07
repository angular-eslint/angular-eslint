import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/use-component-view-encapsulation';

const messageId: MessageIds = 'useComponentViewEncapsulation';
const suggestRemoveViewEncapsulationNone: MessageIds =
  'suggestRemoveViewEncapsulationNone';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    @Component({
      encapsulation: ViewEncapsulation.Emulated,
      selector: 'app-foo-bar'
    })
    class Test {}
  `,
  `
    @Component({
      'encapsulation': ViewEncapsulation.Native,
      selector: 'app-foo-bar',
    })
    class Test {}
  `,
  `
    @Component({
      ['encapsulation']: ViewEncapsulation.ShadowDom,
    })
    class Test {}
  `,
  `
    function encapsulation() {
      return ViewEncapsulation.None;
    }

    @Component({
      [\`encapsulation\`]: encapsulation()
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

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `encapsulation` metadata property is set to `ViewEncapsulation.None`',
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
      "should fail if `encapsulation` property's key is `Literal` and its value is set to `ViewEncapsulation.None`",
    annotatedSource: `
      import type { ViewEncapsulation } from '@angular/core';
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
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `encapsulation` property's key is computed `Literal` and its value is set to `ViewEncapsulation.None`",
    annotatedSource: `
      import { ViewEncapsulation } from '@angular/core';
      import { HttpClient } from '@angular/common/http';

      @Component({
        selector: 'app-foo-bar',
        ['encapsulation']: ViewEncapsulation.None
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
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `encapsulation` property's key is computed `TemplateLiteral` and its value is set to `ViewEncapsulation.None`",
    annotatedSource: `
      import { ViewEncapsulation } from '@angular/core';
      import { HttpClient } from '@angular/common/http';

      @Component({
        selector: 'app-foo-bar',
        [\`encapsulation\`]: ViewEncapsulation.None
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
