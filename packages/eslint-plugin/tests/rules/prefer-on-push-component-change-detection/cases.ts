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
const suggestAddChangeDetectionOnPush: MessageIds =
  'suggestAddChangeDetectionOnPush';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `class Test {}`,
  `
  const options = {};
  @Component(options)
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
    description: 'should fail if `@Component` has no arguments',
    annotatedSource: `
      @Component()
      ~~~~~~~~~~~~
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddChangeDetectionOnPush,
        output: `import { ChangeDetectionStrategy } from '@angular/core';

      @Component({changeDetection: ChangeDetectionStrategy.OnPush})
      
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: "should fail if `@Component`'s argument has no properties",
    annotatedSource: `
      import type { ChangeDetectionStrategy } from '@angular/core';

      @Component({})
      ~~~~~~~~~~~~~~
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddChangeDetectionOnPush,
        output: `
      import type { ChangeDetectionStrategy } from '@angular/core';

      @Component({changeDetection: ChangeDetectionStrategy.OnPush})
      
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `@Component` has no `changeDetection`',
    annotatedSource: `
      import { Component } from '@angular/core';
      const changeDetection = 'template';
      @Component({ [changeDetection]: '' })
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddChangeDetectionOnPush,
        output: `
      import { Component, ChangeDetectionStrategy } from '@angular/core';
      const changeDetection = 'template';
      @Component({ changeDetection: ChangeDetectionStrategy.OnPush,[changeDetection]: '' })
      
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `changeDetection` is set to `undefined`',
    annotatedSource: `
      @Component({ changeDetection: undefined })
                                    ~~~~~~~~~
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddChangeDetectionOnPush,
        output: `import { ChangeDetectionStrategy } from '@angular/core';

      @Component({ changeDetection: ChangeDetectionStrategy.OnPush })
                                    
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `changeDetection` metadata property's key is `Literal` and its value is set to `ChangeDetectionStrategy.Default`",
    annotatedSource: `
      import * as ng from '@angular/core';
      @Component({ 'changeDetection': ChangeDetectionStrategy.Default })
                                                              ~~~~~~~
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddChangeDetectionOnPush,
        output: `import { ChangeDetectionStrategy } from '@angular/core';

      import * as ng from '@angular/core';
      @Component({ 'changeDetection': ChangeDetectionStrategy.OnPush })
                                                              
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `changeDetection` metadata property's key is computed `Literal` and its value is set to `ChangeDetectionStrategy.Default`",
    annotatedSource: `
      import type { OnInit } from '@angular/core';
      @Component({ ['changeDetection']: ChangeDetectionStrategy.Default })
                                                                ~~~~~~~
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddChangeDetectionOnPush,
        output: `import { ChangeDetectionStrategy } from '@angular/core';

      import type { OnInit } from '@angular/core';
      @Component({ ['changeDetection']: ChangeDetectionStrategy.OnPush })
                                                                
      class Test {}
    `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      "should fail if `changeDetection` metadata property's key is computed `TemplateLiteral` and its value is set to `ChangeDetectionStrategy.Default`",
    annotatedSource: `
      import ng from '@angular/core';
      @Component({ [\`changeDetection\`]: ChangeDetectionStrategy.Default })
                                                                ~~~~~~~
      class Test {}
    `,
    messageId,
    suggestions: [
      {
        messageId: suggestAddChangeDetectionOnPush,
        output: `
      import ng, { ChangeDetectionStrategy } from '@angular/core';
      @Component({ [\`changeDetection\`]: ChangeDetectionStrategy.OnPush })
                                                                
      class Test {}
    `,
      },
    ],
  }),
];
