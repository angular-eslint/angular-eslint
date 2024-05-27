import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type { MessageIds } from '../../../src/rules/sort-lifecycle-methods';

const messageId: MessageIds = 'lifecycleMethodsNotSorted';

export const valid = [
  `
    @Component()
    class Test {
      ngOnChanges(): void {}
      ngOnInit(): void {}
      ngDoCheck(): void {}
      ngAfterContentInit(): void {}
      ngAfterContentChecked(): void {}
      ngAfterViewInit(): void {}
      ngAfterViewChecked(): void {}
      ngOnDestroy(): void {}
      doSomething(): void {}
    }
  `,
  `
    @Component()
    class Test {
      ngOnChanges(): void {}
      ngOnInit(): void {}
      ngAfterContentInit(): void {}
      ngAfterContentChecked(): void {}
      ngAfterViewChecked(): void {}
      ngOnDestroy(): void {}
    }
  `,
  `
    @Component()
    class Test {
      ngOnChanges(): void {}
      ngOnInit(): void {}
      ngAfterContentInit(): void {}
      ngAfterContentChecked(): void {}
      ngAfterViewChecked(): void {}
      ngOnDestroy(): void {}
    }
  `,
  `
    @Component()
    class Test {
      ngDoCheck(): void {}
      ngAfterContentInit(): void {}
      ngAfterContentChecked(): void {}
      ngAfterViewChecked(): void {}
      doSomething(): void {}
      doSomethingElse(): void {}
      doSomethingElseAgain(): void {}
    }
  `,
  `
    @Component()
    class Test {
      ngOnInit(): void {}
    }
  `,
  `
    @Component()
    class Test {}
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
        ngAfterContentChecked(): void {}
        ngAfterViewInit(): void {}
        ngAfterViewChecked(): void {}
        ngOnDestroy(): void {}
        doSomething(): void {}
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
        ngOnInit(): void {}
        ngAfterContentInit(): void {}
        ngAfterContentChecked(): void {}
        ngOnDestroy(): void {}
        ngAfterViewChecked(): void {}
        ~~~~~~~~~~~~~~~~~~
        doSomething(): void {}
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
        ngAfterContentChecked(): void {}
        ~~~~~~~~~~~~~~~~~~~~~
        ngAfterViewChecked(): void {}
        doSomething(): void {}
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
