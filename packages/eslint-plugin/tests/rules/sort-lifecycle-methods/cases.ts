// import {convertAnnotatedSourceToFailureCase} from '@angular-eslint/utils';
// import type {MessageIds} from '../../../src/rules/sort-lifecycle-methods';

// const messageId: MessageIds = 'sortLifecycleMethods';
import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/sort-lifecycle-methods';

const messageId: MessageIds = 'sortLifecycleMethods';
export const valid = [
  `
    @Component()
    class Test {
      ngOnChanges(): void {}
      ngOnInit(): void {}
      ngDoCheck(): void {}
      doSomething(): void {}
      ngAfterContentInit(): void {}
      ngAfterContentChecked(): void {}
      ngAfterViewInit(): void {}
      ngAfterViewChecked(): void {}
      ngOnDestroy(): void {}
    }

    @Component()
    class Test {
      ngOnChanges(): void {}
      ngOnInit(): void {}
      ngAfterContentInit(): void {}
      ngAfterContentChecked(): void {}
      ngAfterViewChecked(): void {}
      ngOnDestroy(): void {}
    }

    @Component()
    class Test {
      doSomething(): void {}
      ngDoCheck(): void {}
      ngAfterContentInit(): void {}
      doSomethingElse(): void {}
      ngAfterContentChecked(): void {}
      ngAfterViewChecked(): void {}
      doSomethingElseAgain(): void {}
    }

    @Component()
    class Test {
      ngOnInit(): void {}
    }

    @Component()
    class Test {
    }
    `,
];

export const invalid = [
  convertAnnotatedSourceToFailureCase({
    description: 'ngOnChanges() is declared after ngOnInit()',
    annotatedSource: `
      @Component()
      class Test {
        ngOnInit(): void {}
        ngOnChanges(): void {}
        ~~~~~~~~~~~
        ngDoCheck(): void {}
        ngAfterContentInit(): void {}
        doSomething(): void {}
        ngAfterContentChecked(): void {}
        ngAfterViewInit(): void {}
        ngAfterViewChecked(): void {}
        ngOnDestroy(): void {}
      }
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'ngAfterViewChecked() is declared after ngOnDestroy()',
    annotatedSource: `
      @Component()
      class Test {
        ngOnChanges(): void {}
        doSomething(): void {}
        ngOnInit(): void {}
        ngAfterContentInit(): void {}
        ngAfterContentChecked(): void {}
        ngOnDestroy(): void {}
        ngAfterViewChecked(): void {}
        ~~~~~~~~~~~~~~~~~~
      }
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'ngOnDestroy() is declared after ngAfterContentInit()',
    annotatedSource: `
      @Component()
      class Test {
        ngDoCheck(): void {}
        ngAfterContentInit(): void {}
        ngOnDestroy(): void {}
        doSomething(): void {}
        ngAfterContentChecked(): void {}
        ~~~~~~~~~~~~~~~~~~~~~
        ngAfterViewChecked(): void {}
        doSomethingElse(): void {}
      }
      `,
    messageId,
  }),
  convertAnnotatedSourceToFailureCase({
    description: 'ngOnChanges() is declared after ngOnInit()',
    annotatedSource: `
      @Component()
      class Test {
        ngOnInit(): void {}
        ngOnChanges(): void {}
        ~~~~~~~~~~~
       }
      `,
    messageId,
  }),
];
