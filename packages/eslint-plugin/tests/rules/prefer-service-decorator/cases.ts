import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/prefer-service-decorator';

const messageId: MessageIds = 'preferServiceDecorator';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `class Test {}`,
  // `@Injectable()` without metadata is not equivalent to `@Service()`.
  `
    @Injectable()
    class Test {}
  `,
  // `providedIn` other than `'root'` has no `@Service()` equivalent.
  `
    @Injectable({ providedIn: null })
    class Test {}
  `,
  `
    @Injectable({ providedIn: 'platform' })
    class Test {}
  `,
  `
    @Injectable({ providedIn: 'any' })
    class Test {}
  `,
  `
    @Injectable({ providedIn: SomeModule })
    class Test {}
  `,
  // Provider metadata that `@Service()` does not support is left untouched,
  // even when combined with `providedIn: 'root'`.
  `
    @Injectable({ useClass: TestImpl })
    class Test {}
  `,
  `
    @Injectable({ useExisting: TestImpl })
    class Test {}
  `,
  `
    @Injectable({ useValue: TEST_VALUE })
    class Test {}
  `,
  `
    @Injectable({ providedIn: 'root', useClass: TestImpl })
    class Test {}
  `,
  `
    @Injectable({ providedIn: 'root', useFactory: () => new Test(), deps: [Dep] })
    class Test {}
  `,
  // Already using `@Service()`.
  `
    @Service()
    class Test {}
  `,
  // Not the Angular `Injectable` decorator.
  `
    @CustomInjectable({ providedIn: 'root' })
    class Test {}
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description:
      "should replace `@Injectable({ providedIn: 'root' })` with `@Service()` and update the import",
    annotatedSource: `
      import { Injectable } from '@angular/core';

      @Injectable({ providedIn: 'root' })
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      class MyService {}
    `,
    messageId,
    annotatedOutput: `
      import { Service } from '@angular/core';

      @Service()
      
      class MyService {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should support a template literal `providedIn` value',
    annotatedSource: `
      import { Injectable } from '@angular/core';

      @Injectable({ providedIn: \`root\` })
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      class MyService {}
    `,
    messageId,
    annotatedOutput: `
      import { Service } from '@angular/core';

      @Service()
      
      class MyService {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should rename `useFactory` to `factory` and drop `providedIn` when it comes first',
    annotatedSource: `
      import { Injectable } from '@angular/core';

      @Injectable({ providedIn: 'root', useFactory: () => new MyService() })
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      class MyService {}
    `,
    messageId,
    annotatedOutput: `
      import { Service } from '@angular/core';

      @Service({ factory: () => new MyService() })
      
      class MyService {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should rename `useFactory` to `factory` and drop `providedIn` when it comes last',
    annotatedSource: `
      import { Injectable } from '@angular/core';

      @Injectable({ useFactory: () => new MyService(), providedIn: 'root' })
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      class MyService {}
    `,
    messageId,
    annotatedOutput: `
      import { Service } from '@angular/core';

      @Service({ factory: () => new MyService(), })
      
      class MyService {}
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should remove the now-unused `Injectable` import when `Service` is already imported',
    annotatedSource: `
      import { Service, Injectable } from '@angular/core';

      @Injectable({ providedIn: 'root' })
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      class A {}

      @Service()
      class B {}
    `,
    messageId,
    annotatedOutput: `
      import { Service } from '@angular/core';

      @Service()
      
      class A {}

      @Service()
      class B {}
    `,
  }),
  {
    name: "should replace a multiline `@Injectable` whose only metadata is `providedIn: 'root'`",
    code: `import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
class MyService {}
`,
    output: `import { Service } from '@angular/core';

@Service()
class MyService {}
`,
    errors: [{ messageId }],
  },
  {
    name: 'should rename `useFactory` to `factory` in a multiline metadata object',
    code: `import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
  useFactory: () => new MyService(),
})
class MyService {}
`,
    output: `import { Service } from '@angular/core';

@Service({
  factory: () => new MyService(),
})
class MyService {}
`,
    errors: [{ messageId }],
  },
];
