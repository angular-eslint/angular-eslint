import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/prefer-on-push-component-change-detection';

const messageId: MessageIds = 'preferOnPushComponentChangeDetection';
const suggestRemoveChangeDetection: MessageIds = 'suggestRemoveChangeDetection';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `class Test {}`,
  `
  const options = {};
  @Component(options)
  class Test {}
  `,
  // As of Angular v22 OnPush is the default, so omitting `changeDetection` is valid.
  `
  @Component()
  class Test {}
  `,
  `
  @Component({})
  class Test {}
  `,
  `
  @Component({ selector: 'app-test' })
  class Test {}
  `,
  // `undefined` resolves to the default (OnPush), so it is not opting out.
  `
  @Component({ changeDetection: undefined })
  class Test {}
  `,
  `
  @Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class Test {}
  `,
  `
  @Component({
    'changeDetection': changeDetection,
  })
  class Test {}
  `,
  `
  const changeDetection = ChangeDetectionStrategy.Default;
  @Component({
    changeDetection,
  })
  class Test {}
  `,
  `
  function changeDetection() {
    return ChangeDetectionStrategy.OnPush;
  }

  @Component({
    ['changeDetection']: changeDetection(),
  })
  class Test {}
  `,
  `
  @Component({
    [\`changeDetection\`]: ChangeDetectionStrategy.OnPush,
  })
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
      'should fail if `changeDetection` is set to `ChangeDetectionStrategy.Eager`',
    annotatedSource: `
      import { ChangeDetectionStrategy } from '@angular/core';
      @Component({ changeDetection: ChangeDetectionStrategy.Eager })
                                                            ~~~~~
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveChangeDetection,
        output: `
      
      @Component({  })
                                                            
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `changeDetection` is set to the deprecated `ChangeDetectionStrategy.Default`',
    annotatedSource: `
      import { ChangeDetectionStrategy } from '@angular/core';
      @Component({ changeDetection: ChangeDetectionStrategy.Default })
                                                            ~~~~~~~
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveChangeDetection,
        output: `
      
      @Component({  })
                                                            
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `changeDetection` metadata property's key is `Literal` and its value is set to `ChangeDetectionStrategy.Eager`",
    annotatedSource: `
      import { ChangeDetectionStrategy } from '@angular/core';
      @Component({ 'changeDetection': ChangeDetectionStrategy.Eager })
                                                              ~~~~~
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveChangeDetection,
        output: `
      
      @Component({  })
                                                              
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `changeDetection` metadata property's key is computed `Literal` and its value is set to `ChangeDetectionStrategy.Eager`",
    annotatedSource: `
      import { ChangeDetectionStrategy } from '@angular/core';
      @Component({ ['changeDetection']: ChangeDetectionStrategy.Eager })
                                                                ~~~~~
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveChangeDetection,
        output: `
      
      @Component({  })
                                                                
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `changeDetection` metadata property's key is computed `TemplateLiteral` and its value is set to `ChangeDetectionStrategy.Eager`",
    annotatedSource: `
      import { ChangeDetectionStrategy } from '@angular/core';
      @Component({ [\`changeDetection\`]: ChangeDetectionStrategy.Eager })
                                                                ~~~~~
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveChangeDetection,
        output: `
      
      @Component({  })
                                                                
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and remove the trailing comma when `changeDetection` is followed by another property',
    annotatedSource: `
      import { ChangeDetectionStrategy } from '@angular/core';
      @Component({ changeDetection: ChangeDetectionStrategy.Eager, selector: 'app-test' })
                                                            ~~~~~
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveChangeDetection,
        output: `
      
      @Component({  selector: 'app-test' })
                                                            
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail when `changeDetection` is preceded by another property',
    annotatedSource: `
      import { ChangeDetectionStrategy } from '@angular/core';
      @Component({ selector: 'app-test', changeDetection: ChangeDetectionStrategy.Eager })
                                                                                  ~~~~~
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestRemoveChangeDetection,
        output: `
      
      @Component({ selector: 'app-test',  })
                                                                                  
      class Test {}
    `,
      },
    ],
  }),
];
