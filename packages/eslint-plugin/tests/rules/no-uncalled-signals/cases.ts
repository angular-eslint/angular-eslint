import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { ValidTestCase } from '@typescript-eslint/rule-tester';
import { MessageIds, Options } from '../../../src/rules/no-uncalled-signals';

const messageId: MessageIds = 'noUncalledSignals';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    let a = 1;
    if (a) { }
  `,
  `
    let a = true;
    if (!a) { }
  `,
  `
    let a: Signal<boolean>;
    let b = a() ? 1 : 2;
  `,
  `
    let a: Signal<boolean>;
    do {} while (a());
  `,
  `
    let a: Signal<boolean>;
    for (let i = 0; a(); i++) { }
  `,
  `
    let a: Signal<boolean>;
    if (a()) { }
  `,
  `
    let a: Signal<boolean>;
    switch (true) {
      case a():
        break;
    }
  `,
  `
    let a: Signal<boolean>;
    while (a()) { }
  `,
  `
    let a: Signal<boolean>;
    if (!a()) { }
  `,
  `
    let a: Signal<boolean>;
    if (a() || true) { }
  `,
  `
    let a: Signal<boolean>;
    if (a() == "hello") { }
  `,
  `
    let a: Signal<boolean>;
    if (false || (a() ?? true)) { }
  `,
  `
    let a: Signal<boolean>;
    if (false) {
      a
    }
  `,
  `
    let a: Signal<boolean> | null;
    if (a) { }
  `,
  `
    let a: Signal<boolean> | undefined;
    if (a) { }
  `,
  `
    let a: Signal<boolean> | NonSignal;
    if (a) { }
    interface NonSignal {}
  `,
  `
    let a: Signal<boolean>;
    let b = a() ?? true;
  `,
  `
    let a: Signal<boolean>;
    const b = a() || true;
  `,
  `
    let a: Signal<boolean>;
    let b = a;
  `,
  `
    function getSignal(): Signal<boolean> {}
    if (getSignal()()) { }
  `,
  // Test cases for the reported bug - direct signal calls on member expressions
  `
    export class AppComponent {
      readonly test: Signal<boolean>;

      constructor() {
        effect(() => {
          if (this.test()) { }
        });
      }
    }
  `,
  `
    export class AppComponent {
      readonly test: Signal<boolean>;

      constructor() {
        const t = this.test;
        effect(() => {
          if (t()) { }
        });
      }
    }
  `,
  // https://github.com/angular-eslint/angular-eslint/issues/2574
  `
    let a: WritableSignal<string>;
    let b: boolean;
    let c = b && a.set('');
  `,
  // https://github.com/angular-eslint/angular-eslint/issues/2691 (case 1)
  `
    let a: { b: WritableSignal<boolean> };
    true && a.b.set(false);
  `,
  // https://github.com/angular-eslint/angular-eslint/issues/2691 (case 2)
  `
    function a(b: WritableSignal<boolean> | InputSignal<boolean>) {
      return 'set' in b || 'applyValueToInputSignal' in b[SIGNAL];
    }
  `,
  // https://github.com/angular-eslint/angular-eslint/issues/2691 (case 3)
  `
    function a(b: { c: WritableSignal<boolean> }) {
      true && ((x) => b.c.set(x))(true);
    }
  `,
].map(appendTypes);

// Note: Unlike other test case files, we let TypeScript infer the array
// type here. If we specified a type for `invalid`, then we will get a
// type mismatch when mapping the elements in the array to append the types.
export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'conditional statement',
    annotatedSource: `
        let a: Signal<boolean>;
        let b = a ? 1 : 2;
                ~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: Signal<boolean>;
        let b = a() ? 1 : 2;
                
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'do while loop',
    annotatedSource: `
        let a: Signal<boolean>;
        do {} while (a);
                     ~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: Signal<boolean>;
        do {} while (a());
                     
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'for statement',
    annotatedSource: `
        let a: Signal<boolean>;
        for (let i = 0; a; i++) { }
                        ~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: Signal<boolean>;
        for (let i = 0; a(); i++) { }
                        
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'if statement',
    annotatedSource: `
        let a: Signal<boolean>;
        if (a) { }
            ~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: Signal<boolean>;
        if (a()) { }
            
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'switch case',
    annotatedSource: `
        let a: Signal<boolean>;
        switch (true) {
          case a:
               ~
            break;
        }
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: Signal<boolean>;
        switch (true) {
          case a():
               
            break;
        }
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'while loop',
    annotatedSource: `
        let a: Signal<boolean>;
        while (a) {}
               ~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: Signal<boolean>;
        while (a()) {}
               
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'negated if statement',
    annotatedSource: `
        let a: Signal<boolean>;
        if (!a) { }
             ~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: Signal<boolean>;
        if (!a()) { }
             
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'binary expression lhs',
    annotatedSource: `
        let a: Signal<number>;
        if (a === 1) { }
            ~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: Signal<number>;
        if (a() === 1) { }
            
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'binary expression rhs',
    annotatedSource: `
        let a: Signal<number>;
        if (1 === a) { }
                  ~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: Signal<number>;
        if (1 === a()) { }
                  
      `,
      },
    ],
  }),

  convertAnnotatedSourceToFailureCase({
    description: 'logical expression lhs',
    annotatedSource: `
        let a: Signal<number>;
        let b = a || 1;
                ~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: Signal<number>;
        let b = a() || 1;
                
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'logical expression rhs',
    annotatedSource: `
        let a: Signal<number>;
        let b = 1 || a;
                     ~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: Signal<number>;
        let b = 1 || a();
                     
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'deep in logical expression',
    annotatedSource: `
        let a: Signal<number>;
        let b = 1 || 2 || 3 || a || 4 || 5;
                               ~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: Signal<number>;
        let b = 1 || 2 || 3 || a() || 4 || 5;
                               
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'call expression that returns a signal',
    annotatedSource: `
        function getSignal(): Signal<number> { }
        if (getSignal()) { }
            ~~~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        function getSignal(): Signal<number> { }
        if (getSignal()()) { }
            
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'deep member expression',
    annotatedSource: `
        let a: { b: { c: { d: { e: Signal<number>; } } } }
        if (a.b.c.d.e) { }
            ~~~~~~~~~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: { b: { c: { d: { e: Signal<number>; } } } }
        if (a.b.c.d.e()) { }
            
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'InputSignal',
    annotatedSource: `
        let a: InputSignal<boolean>;
        if (a) { }
            ~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: InputSignal<boolean>;
        if (a()) { }
            
      `,
      },
    ],
  }),

  convertAnnotatedSourceToFailureCase({
    description: 'ModelSignal',
    annotatedSource: `
        let a: ModelSignal<boolean>;
        if (a) { }
            ~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: ModelSignal<boolean>;
        if (a()) { }
            
      `,
      },
    ],
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'WritableSignal',
    annotatedSource: `
        let a: WritableSignal<boolean>;
        if (a) { }
            ~
      `,
    messageId,
    suggestions: [
      {
        messageId: 'suggestCallSignal',
        output: `
        let a: WritableSignal<boolean>;
        if (a()) { }
            
      `,
      },
    ],
  }),
].map((test) => ({
  ...test,
  code: appendTypes(test.code),
  errors: test.errors.map((error) => ({
    ...error,
    suggestions: error.suggestions?.map((suggestion) => ({
      ...suggestion,
      output: appendTypes(suggestion.output),
    })),
  })),
}));

function appendTypes(code: string): string {
  // Exclude the types from the generated docs because they
  // are standard Angular types and only need to be defined
  // so that the type symbols in the tests are correct.
  if (process.env.GENERATING_RULE_DOCS === '1') {
    return code;
  }

  const start = /\S/u.exec(code)?.index ?? 0;
  const prefix = code.slice(0, start);

  return (
    code +
    '\n' +
    [
      'interface Signal<T> { (): T; }',
      'interface InputSignal<T> extends Signal<T> {}',
      'interface ModelSignal<T> extends Signal<T> {}',
      'interface WritableSignal<T> extends Signal<T> { set(value: T): void; }',
      'declare function effect(fn: () => void): void;',
    ]
      .map((x) => prefix + x)
      .join('\n')
  );
}
