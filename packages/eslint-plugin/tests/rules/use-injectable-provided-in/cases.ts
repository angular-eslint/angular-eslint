import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/use-injectable-provided-in';

const messageId: MessageIds = 'useInjectableProvidedIn';
const suggestInjector: MessageIds = 'suggestInjector';

export const valid = [
  `class Test {}`,
  `
    const options = {};
    @Injectable(options)
    class Test {}
  `,
  `
    @Injectable({
      providedIn: \`any\`,
    })
    class Test {}
  `,
  `
    @Injectable({
      'providedIn': 'root',
    })
    class Test {}
  `,
  `
    @Injectable({
      providedIn: SomeModule,
    })
    class Test {}
  `,
  // https://github.com/angular-eslint/angular-eslint/issues/236
  `
    @Injectable()
    class Test implements HttpInterceptor {}
  `,
  // https://github.com/angular-eslint/angular-eslint/issues/236
  `
    @Injectable()
    class Test implements ng.HttpInterceptor {}
  `,
  `
    @CustomInjectable()
    class Test {}
  `,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `@Injectable` has no arguments',
    annotatedSource: `
      @Injectable()
      ~~~~~~~~~~~~~
      class Test {}
    `,
    messageId,
    suggestions: (['any', 'platform', 'root'] as const).map((injector) => ({
      messageId: suggestInjector,
      output: `
      @Injectable({providedIn: '${injector}'})
      
      class Test {}
    `,
      data: { injector },
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description: "should fail if `@Injectable`'s argument has no properties",
    annotatedSource: `
      @Injectable({})
      ~~~~~~~~~~~~~~~
      class Test {}
    `,
    messageId,
    suggestions: (['any', 'platform', 'root'] as const).map((injector) => ({
      messageId: suggestInjector,
      output: `
      @Injectable({providedIn: '${injector}'})
      
      class Test {}
    `,
      data: { injector },
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `@Injectable` has no `providedIn`',
    annotatedSource: `
      const providedIn = 'anotherProperty';
      @Injectable({ [providedIn]: [] })
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      class Test {}
    `,
    messageId,
    suggestions: (['any', 'platform', 'root'] as const).map((injector) => ({
      messageId: suggestInjector,
      output: `
      const providedIn = 'anotherProperty';
      @Injectable({ providedIn: '${injector}',[providedIn]: [] })
      
      class Test {}
    `,
      data: { injector },
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `providedIn` is set to `null`',
    annotatedSource: `
      @Injectable({ providedIn: null })
                    ~~~~~~~~~~~~~~~~
      class Test {}
    `,
    messageId,
    suggestions: (['any', 'platform', 'root'] as const).map((injector) => ({
      messageId: suggestInjector,
      output: `
      @Injectable({ providedIn: '${injector}' })
                    
      class Test {}
    `,
      data: { injector },
    })),
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'should fail if `providedIn` is set to `undefined`',
    annotatedSource: `
      @Injectable({ 'providedIn': undefined })
                    ~~~~~~~~~~~~~~~~~~~~~~~
      class Test {}
    `,
    messageId,
    suggestions: (['any', 'platform', 'root'] as const).map((injector) => ({
      messageId: suggestInjector,
      output: `
      @Injectable({ 'providedIn': '${injector}' })
                    
      class Test {}
    `,
      data: { injector },
    })),
  }),
];
