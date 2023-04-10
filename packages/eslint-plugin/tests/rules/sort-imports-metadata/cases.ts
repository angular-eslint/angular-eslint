import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/sort-imports-metadata';

const messageId: MessageIds = 'sortImportsMetadata';

export const valid = [
  `
  @Component({
    standalone: true,
    selector: 'test-component',
    imports: [aModule, bModule, cModule, dModule],
  })
  export class TestComponent { }
  `,
  `
  @Directive({
    standalone: true,
    selector: 'test-directive',
    imports: [aModule, bModule, cModule, dModule],
  })
  export class TestDirective { }
  `,
  `
  @Pipe({
    standalone: true,
    selector: 'test-pipe',
    imports: [aModule, bModule, cModule, dModule],
  })
  export class TestPipe { }
  `,
  `
  @Component({
    standalone: true,
    selector: 'test-component',
    imports: [
      aModule,
      bModule,
      cModule,
      dModule
    ],
  })
  export class TestComponent { }
  `,
];

export const invalid = [
  // TODO: This test fails for two reason:
  // First error is the whitespace prefix (see TODO in rule code):
  // -         aModule,
  // -         bModule,
  // -         cModule,
  // -         dModule,
  // +                 aModule,
  // +                 bModule,
  // +                 cModule,
  // +                 dModule,
  //
  // Second error is that the fix receives additional characters at the end of the array:
  //   dModule,
  // ],·················
  // })
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `imports` for a standalone component is not sorted ASC',
    annotatedSource: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports: [aModule, bModule, dModule, cModule],
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    export class TestComponent { }
    `,
    messageId,
    annotatedOutput: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports: [
        aModule,
        bModule,
        cModule,
        dModule,
      ],
    })
    export class TestComponent { }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `imports`, listed by line, for a standalone component is not sorted ASC',
    annotatedSource: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports: [
        aModule,
        ~~~~~~~
        bModule,
        ~~~~~~~
        dModule,
        ~~~~~~~
        cModule
        ~~~~~~~
      ],
    })
    export class TestComponent { }
    `,
    messageId,
    annotatedOutput: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports: [
        aModule,
        bModule,
        cModule,
        dModule,
      ],
    })
    export class TestComponent { }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `imports`, listed by line with comments, for a standalone component is not sorted ASC',
    annotatedSource: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports: [
        // Line comment above aModule
        // Another line comment above aModule
        aModule, // Line comment next to aModule
        ~~~~~~~
        bModule,
        /* Block comment above dModule */
        ~~~~~~~
        dModule, /* Block comment next to dModule */
        ~~~~~~~
        /**
         * Block comment above cModule
         **/
        // Line comment above cModule
        /* Another block comment above cModule */
        cModule
        ~~~~~~~
        /**
         * Block comment below cModule
         **/
        // Another line comment below cModule
      ],
    })
    export class TestComponent { }
    `,
    messageId,
    annotatedOutput: `
    @Component({
      standalone: true,
      selector: 'test-component',
      imports: [
        // Line comment above aModule
        // Another line comment above aModule
        aModule, // Line comment next to aModule
        bModule,
        /**
         * Block comment above cModule
         **/
        // Line comment above cModule
        /* Another block comment above cModule */
        cModule,
        /**
         * Block comment below cModule
         **/
        // Another line comment below cModule
        /* Block comment above dModule */
        dModule, /* Block comment next to dModule */
      ],
    })
    export class TestComponent { }
    `,
  }),
];
