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
const redundantOnPush: MessageIds = 'redundantOnPushComponentChangeDetection';

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
  // Explicit `ChangeDetectionStrategy.OnPush` is allowed by default
  // (`allowExplicitOnPush` defaults to `true`).
  `
  @Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class Test {}
  `,
  {
    code: `
  @Component({
    [\`changeDetection\`]: ChangeDetectionStrategy.OnPush,
  })
  class Test {}
  `,
    options: [{ allowExplicitOnPush: true }],
  },
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
      
      @Component({ selector: 'app-test' })
                                                            
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
      
      @Component({ selector: 'app-test', })
                                                                                  
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should still report `ChangeDetectionStrategy.Eager` when `allowExplicitOnPush` is enabled',
    annotatedSource: `
      import { ChangeDetectionStrategy } from '@angular/core';
      @Component({ changeDetection: ChangeDetectionStrategy.Eager })
                                                            ~~~~~
      class Test {}
    `,
    messageId,
    options: [{ allowExplicitOnPush: true }],
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
      'should fail and autofix redundant `ChangeDetectionStrategy.OnPush`, removing the now-unused import',
    annotatedSource: `
      import { ChangeDetectionStrategy } from '@angular/core';
      @Component({ changeDetection: ChangeDetectionStrategy.OnPush })
                                                            ~~~~~~
      class Test {}
    `,
    messageId: redundantOnPush,
    options: [{ allowExplicitOnPush: false }],
    annotatedOutput: `
      
      @Component({  })
                                                            
      class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and autofix redundant `ChangeDetectionStrategy.OnPush` with a `Literal` key',
    annotatedSource: `
      import { ChangeDetectionStrategy } from '@angular/core';
      @Component({ 'changeDetection': ChangeDetectionStrategy.OnPush })
                                                              ~~~~~~
      class Test {}
    `,
    messageId: redundantOnPush,
    options: [{ allowExplicitOnPush: false }],
    annotatedOutput: `
      
      @Component({  })
                                                              
      class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail and autofix redundant `ChangeDetectionStrategy.OnPush` with a computed `TemplateLiteral` key',
    annotatedSource: `
      import { ChangeDetectionStrategy } from '@angular/core';
      @Component({ [\`changeDetection\`]: ChangeDetectionStrategy.OnPush })
                                                                ~~~~~~
      class Test {}
    `,
    messageId: redundantOnPush,
    options: [{ allowExplicitOnPush: false }],
    annotatedOutput: `
      
      @Component({  })
                                                                
      class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should autofix redundant `ChangeDetectionStrategy.OnPush` followed by another property',
    annotatedSource: `
      import { ChangeDetectionStrategy } from '@angular/core';
      @Component({ changeDetection: ChangeDetectionStrategy.OnPush, selector: 'app-test' })
                                                            ~~~~~~
      class Test {}
    `,
    messageId: redundantOnPush,
    options: [{ allowExplicitOnPush: false }],
    annotatedOutput: `
      
      @Component({ selector: 'app-test' })
                                                            
      class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should autofix redundant `ChangeDetectionStrategy.OnPush` preceded by another property',
    annotatedSource: `
      import { ChangeDetectionStrategy } from '@angular/core';
      @Component({ selector: 'app-test', changeDetection: ChangeDetectionStrategy.OnPush })
                                                                                  ~~~~~~
      class Test {}
    `,
    messageId: redundantOnPush,
    options: [{ allowExplicitOnPush: false }],
    annotatedOutput: `
      
      @Component({ selector: 'app-test', })
                                                                                  
      class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should autofix redundant `ChangeDetectionStrategy.OnPush` when the import is absent',
    annotatedSource: `
      @Component({ changeDetection: ChangeDetectionStrategy.OnPush })
                                                            ~~~~~~
      class Test {}
    `,
    messageId: redundantOnPush,
    options: [{ allowExplicitOnPush: false }],
    annotatedOutput: `
      @Component({  })
                                                            
      class Test {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should not delete an adjacent comment when autofixing redundant OnPush',
    annotatedSource: `
      import { ChangeDetectionStrategy } from '@angular/core';
      @Component({
        changeDetection: ChangeDetectionStrategy.OnPush,
                                                 ~~~~~~
        // keep this comment
        selector: 'app-test',
      })
      class Test {}
    `,
    annotatedOutput: `
      
      @Component({
        // keep this comment
        selector: 'app-test',
      })
      class Test {}
    `,
    messageId: redundantOnPush,
    options: [{ allowExplicitOnPush: false }],
  }),
];
