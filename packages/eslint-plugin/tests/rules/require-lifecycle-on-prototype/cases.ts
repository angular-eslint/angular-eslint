import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type {
  MessageIds,
  Options,
} from '../../../src/rules/require-lifecycle-on-prototype';

const messageId: MessageIds = 'defineOnPrototype';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  `
    @Component({})
    class Test {
      ngAfterContentChecked() {}
    }
  `,
  `
    @Component({})
    class Test {
      ngAfterContentInit() {}
    }
  `,
  `
    @Component({})
    class Test {
      ngAfterViewChecked() {}
    }
  `,
  `
    @Component({})
    class Test {
      ngAfterViewInit() {}
    }
  `,
  `
    @Component({})
    class Test {
      ngOnChanges() {}
    }
  `,
  `
    @Component({})
    class Test {
      ngOnDestroy() {}
    }
  `,
  `
    @Component({})
    class Test {
      ngOnInit() {}
    }
  `,
  `
    @Component({})
    class Test {
      ngDoCheck() {}
    }
  `,
  `
    @Directive({})
    class Test {
      ngAfterContentChecked() {}
    }
  `,
  `
    @Directive({})
    class Test {
      ngAfterContentInit() {}
    }
  `,
  `
    @Directive({})
    class Test {
      ngAfterViewChecked() {}
    }
  `,
  `
    @Directive({})
    class Test {
      ngAfterViewInit() {}
    }
  `,
  `
    @Directive({})
    class Test {
      ngOnChanges() {}
    }
  `,
  `
    @Directive({})
    class Test {
      ngOnDestroy() {}
    }
  `,
  `
    @Directive({})
    class Test {
      ngOnInit() {}
    }
  `,
  `
    @Directive({})
    class Test {
      ngDoCheck() {}
    }
  `,
  `
    @Injectable({})
    class Test {
      ngOnDestroy() {}
    }
  `,
  `
    @Pipe({})
    class Test {
      ngOnDestroy() {}
    }
  `,
  `
    @Component({})
    class Test {}
    function hook(type) {
      type.prototype.ngOnDestroy = () => {};
    }
    hook(Test);
  `,
  `
    @Component({})
    class Test {}
    function hook(type) {
      (type.prototype as any).ngOnDestroy = () => {};
    }
    hook(Test);
  `,
  `
    @Component({})
    class Test {}
    function hook(type) {
      type['prototype'].ngOnDestroy = () => {};
    }
    hook(Test);
  `,
  `
    @Component({})
    class Test {}
    function hook(type) {
      (type.prototype as unknown as { ngOnDestroy: () => void}).ngOnDestroy = () => {};
    }
    hook(Test);
  `,
  `
    @Component({})
    class Test {
      onDestroy = () => {}
    }
  `,
  `
    @Component({})
    class Test {
      constructor() {
        this.onDestroy = () => {}
      }
    }
  `,
  `
    @Component({})
    class Test {
      constructor() {
        this['onDestroy'] = () => {}
      }
    }
  `,
  `
    @Component({})
    class Test {
      constructor() {
        let ngOnDestroy;
        ngOnDestroy = () => {};
      }
    }
  `,
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase({
    description: `should fail when component has ngOnChanges property initialized to value.`,
    annotatedSource: `
      @Component({})
      class Test {
        ngOnChanges = func;
        ~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngOnChanges' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when component has ngOnInit property initialized to value.`,
    annotatedSource: `
      @Component({})
      class Test {
        ngOnInit = func;
        ~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngOnInit' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when component has ngDoCheck property initialized to value.`,
    annotatedSource: `
      @Component({})
      class Test {
        ngDoCheck = func;
        ~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngDoCheck' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when component has ngAfterContentInit property initialized to value.`,
    annotatedSource: `
      @Component({})
      class Test {
        ngAfterContentInit = func;
        ~~~~~~~~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngAfterContentInit' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when component has ngAfterContentChecked property initialized to value.`,
    annotatedSource: `
      @Component({})
      class Test {
        ngAfterContentChecked = func;
        ~~~~~~~~~~~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngAfterContentChecked' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when component has ngAfterViewInit property initialized to value.`,
    annotatedSource: `
      @Component({})
      class Test {
        ngAfterViewInit = func;
        ~~~~~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngAfterViewInit' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when component has ngAfterViewChecked property initialized to value.`,
    annotatedSource: `
      @Component({})
      class Test {
        ngAfterViewChecked = func;
        ~~~~~~~~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngAfterViewChecked' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when component has ngOnDestroy property initialized to value.`,
    annotatedSource: `
      @Component({})
      class Test {
        ngOnDestroy = func;
        ~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngOnDestroy' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when directive has ngOnChanges property initialized to value.`,
    annotatedSource: `
      @Directive({})
      class Test {
        ngOnChanges = func;
        ~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngOnChanges' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when directive has ngOnInit property initialized to value.`,
    annotatedSource: `
      @Directive({})
      class Test {
        ngOnInit = func;
        ~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngOnInit' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when directive has ngDoCheck property initialized to value.`,
    annotatedSource: `
      @Directive({})
      class Test {
        ngDoCheck = func;
        ~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngDoCheck' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when directive has ngAfterContentInit property initialized to value.`,
    annotatedSource: `
      @Directive({})
      class Test {
        ngAfterContentInit = func;
        ~~~~~~~~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngAfterContentInit' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when directive has ngAfterContentChecked property initialized to value.`,
    annotatedSource: `
      @Directive({})
      class Test {
        ngAfterContentChecked = func;
        ~~~~~~~~~~~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngAfterContentChecked' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when directive has ngAfterViewInit property initialized to value.`,
    annotatedSource: `
      @Directive({})
      class Test {
        ngAfterViewInit = func;
        ~~~~~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngAfterViewInit' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when directive has ngAfterViewChecked property initialized to value.`,
    annotatedSource: `
      @Directive({})
      class Test {
        ngAfterViewChecked = func;
        ~~~~~~~~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngAfterViewChecked' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when directive has ngOnDestroy property initialized to value.`,
    annotatedSource: `
      @Directive({})
      class Test {
        ngOnDestroy = func;
        ~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngOnDestroy' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when injectable has ngOnDestroy property initialized to value.`,
    annotatedSource: `
      @Injectable({})
      class Test {
        ngOnDestroy = func;
        ~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngOnDestroy' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when pipe has ngOnDestroy property initialized to value.`,
    annotatedSource: `
      @Pipe({})
      class Test {
        ngOnDestroy = func;
        ~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngOnDestroy' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when lifecycle property is initialized in constructor.`,
    annotatedSource: `
      class Test {
        constructor() {
          this.ngOnDestroy = func;
               ~~~~~~~~~~~
        }
      }
      `,
    messageId,
    data: { method: 'ngOnDestroy' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when lifecycle property is initialized in constructor using literal notation.`,
    annotatedSource: `
      class Test {
        constructor() {
          this['ngOnDestroy'] = func;
               ~~~~~~~~~~~~~
        }
      }
      `,
    messageId,
    data: { method: 'ngOnDestroy' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when lifecycle property is initialized in method.`,
    annotatedSource: `
      class Test {
        run() {
          this.ngOnDestroy = func;
               ~~~~~~~~~~~
        }
      }
      `,
    messageId,
    data: { method: 'ngOnDestroy' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when lifecycle property is set outside of class.`,
    annotatedSource: `
      function hook(component) {
        component.ngOnDestroy = func;
                  ~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngOnDestroy' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when cast is used to set lifecycle property.`,
    annotatedSource: `
      function hook(component) {
        (component as any).ngOnDestroy = func;
                           ~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngOnDestroy' },
  }),
  convertAnnotatedSourceToFailureCase({
    description: `should fail when literal notation is used for property name.`,
    annotatedSource: `
      class Test {
        ['ngOnDestroy'] = func;
         ~~~~~~~~~~~~~
      }
      `,
    messageId,
    data: { method: 'ngOnDestroy' },
  }),
];
