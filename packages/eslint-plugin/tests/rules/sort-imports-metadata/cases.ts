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
      imports: [aModule, bModule, cModule, dModule],
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    export class TestComponent { }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `imports` for a standalone directive is not sorted ASC',
    annotatedSource: `
    @Directive({
      standalone: true,
      selector: 'test-directive',
      imports: [aModule, bModule, dModule, cModule],
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    export class TestDirective { }
    `,
    messageId,
    annotatedOutput: `
    @Directive({
      standalone: true,
      selector: 'test-directive',
      imports: [aModule, bModule, cModule, dModule],
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    export class TestDirective { }
    `,
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if `imports` for a standalone pipe is not sorted ASC',
    annotatedSource: `
    @Pipe({
      standalone: true,
      selector: 'test-pipe',
      imports: [aModule, bModule, dModule, cModule],
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    export class TestPipe { }
    `,
    messageId,
    annotatedOutput: `
    @Pipe({
      standalone: true,
      selector: 'test-pipe',
      imports: [aModule, bModule, cModule, dModule],
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    })
    export class TestPipe { }
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
      imports: [aModule, bModule, cModule, dModule],
    })
    export class TestComponent { }
    `,
  }),
];
