import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/utils';
import type { MessageIds } from '../../../src/rules/contextual-decorator';

const messageId: MessageIds = 'contextualDecorator';

export const valid = [
  // `@Component()`.
  {
    // It should succeed if getter accessor is decorated with @Input() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          @Input()
          get label(): string {
            return this._label;
          }
          set label(value: string) {
            this._label = value;
          }
          private _label: string;
        }
      `,
  },
  {
    // It should succeed if setter accessor is decorated with @Input() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          @Input()
          set label(value: string) {
            this._label = value;
          }
          get label(): string {
            return this._label;
          }
          private _label: string;
        }
      `,
  },
  {
    // It should succeed if setter accessor is decorated with @ViewChild() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          @ViewChild(Pane)
          set label(value: Pane) {
            doSomething();
          }
        }
      `,
  },
  {
    // It should succeed if a method is decorated with @HostListener() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          @HostListener('mouseover')
          mouseOver() {
            this.doSomething();
          }
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Host() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          constructor(
            @Host() private readonly host: DynamicHost
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Inject() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          constructor(
            @Inject(LOCALE_ID) private readonly localeId: string
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Optional() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          constructor(
            @Optional() testBase: TestBase,
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Self() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          constructor(
            @Self() public readonly test: Test,
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @SkipSelf() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          constructor(
            @SkipSelf() protected readonly parentTest: ParentTest
          ) {}
        }
      `,
  },
  {
    // It should succeed if a property is decorated with @ContentChild() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          @ContentChild(Pane) pane: Pane;
        }
      `,
  },
  {
    // It should succeed if a property is decorated with @ContentChildren() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          @ContentChildren(Pane, { descendants: true }) arbitraryNestedPanes: QueryList<Pane>;
        }
      `,
  },
  {
    // It should succeed if a property is decorated with @HostBinding() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          @HostBinding('class.card-outline') private isCardOutline: boolean;
        }
      `,
  },
  {
    // It should succeed if a property is decorated with @Input() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          @Input() label: string;
        }
      `,
  },
  {
    // It should succeed if a property is decorated with @Output() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          @Output() emitter = new EventEmitter<void>();
        }
      `,
  },
  {
    // It should succeed if a property is decorated with @ViewChild() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          @ViewChild(Pane)
          set pane(value: Pane) {
            console.log('panel setter called');
          }
        }
      `,
  },
  {
    // It should succeed if a property is decorated with @ViewChildren() decorator.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          @ViewChildren(Pane) panes: QueryList<Pane>;
        }
      `,
  },
  {
    // It should succeed if declarations are decorated with allowed decorators.
    code: `
        @Component({
          template: 'Hi!'
        })
        class Test {
          @ContentChild(Pane) pane: Pane;

          @Input()
          get label(): string {
            return this._label;
          }
          set label(value: string) {
            this._label = value;
          }
          private _label: string;

          @ViewChild(Pane)
          set label(value: Pane) {
            doSomething();
          }

          get type(): string {
            return this._type;
          }
          set type(value: string) {
            this._type = value;
          }
          private _type: string;

          private prop: string | undefined;

          constructor(
            @Attribute('test') private readonly test: string,
            @Host() @Optional() private readonly host: DynamicHost,
            @Inject(LOCALE_ID) private readonly localeId: string,
            @Inject(TEST_BASE) @Optional() testBase: TestBase,
            @Optional() @Self() public readonly test: Test,
            @Optional() @SkipSelf() protected readonly parentTest: ParentTest
          ) {}

          @HostListener('mouseover')
          mouseOver(): void {
            this.doSomething();
          }

          clickHandler(): void {}
        }
      `,
  },
  // `@Directive()`.
  {
    // It should succeed if getter accessor is decorated with @Input() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          @Input()
          get label(): string {
            return this._label;
          }
          set label(value: string) {
            this._label = value;
          }
          private _label: string;
        }
      `,
  },
  {
    // It should succeed if setter accessor is decorated with @Input() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          @Input()
          set label(value: string) {
            this._label = value;
          }
          get label(): string {
            return this._label;
          }
          private _label: string;
        }
      `,
  },
  {
    // It should succeed if setter accessor is decorated with @ViewChild() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          @ViewChild(Pane)
          set label(value: Pane) {
            doSomething();
          }
        }
      `,
  },
  {
    // It should succeed if a method is decorated with @HostListener() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          @HostListener('mouseover')
          mouseOver() {
            this.doSomething();
          }
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Host() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          constructor(
            @Host() private readonly host: DynamicHost
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Inject() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          constructor(
            @Inject(LOCALE_ID) private readonly localeId: string
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Optional() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          constructor(
            @Optional() testBase: TestBase,
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Self() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          constructor(
            @Self() public readonly test: Test,
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @SkipSelf() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          constructor(
            @SkipSelf() protected readonly parentTest: ParentTest
          ) {}
        }
      `,
  },
  {
    // It should succeed if a property is decorated with @ContentChild() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          @ContentChild(Pane) pane: Pane;
        }
      `,
  },
  {
    // It should succeed if a property is decorated with @ContentChildren() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          @ContentChildren(Pane, { descendants: true }) arbitraryNestedPanes: QueryList<Pane>;
        }
      `,
  },
  {
    // It should succeed if a property is decorated with @HostBinding() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          @HostBinding('class.card-outline') private isCardOutline: boolean;
        }
      `,
  },
  {
    // It should succeed if a property is decorated with @Input() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          @Input() label: string;
        }
      `,
  },
  {
    // It should succeed if a property is decorated with @Output() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          @Output() emitter = new EventEmitter<void>();
        }
      `,
  },
  {
    // It should succeed if a property is decorated with @ViewChild() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          @ViewChild(Pane)
          set pane(value: Pane) {
            console.log('panel setter called');
          }
        }
      `,
  },
  {
    // It should succeed if a property is decorated with @ViewChildren() decorator.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          @ViewChildren(Pane) panes: QueryList<Pane>;
        }
      `,
  },
  {
    // It should succeed if declarations are decorated with allowed decorators.
    code: `
        @Directive({
          selector: 'test'
        })
        class Test {
          @ContentChild(Pane) pane: Pane;

          @Input()
          get label(): string {
            return this._label;
          }
          set label(value: string) {
            this._label = value;
          }
          private _label: string;

          @ViewChild(Pane)
          set label(value: Pane) {
            doSomething();
          }

          get type(): string {
            return this._type;
          }
          set type(value: string) {
            this._type = value;
          }
          private _type: string;

          private prop: string | undefined;

          constructor(
            @Attribute('test') private readonly test: string,
            @Host() @Optional() private readonly host: DynamicHost,
            @Inject(LOCALE_ID) private readonly localeId: string,
            @Inject(TEST_BASE) @Optional() testBase: TestBase,
            @Optional() @Self() public readonly test: Test,
            @Optional() @SkipSelf() protected readonly parentTest: ParentTest
          ) {}

          @HostListener('mouseover')
          mouseOver(): void {
            this.doSomething();
          }

          clickHandler(): void {}
        }
      `,
  },
  // `@Injectable()`.
  {
    // It should succeed if a parameter property is decorated with @Host() decorator.
    code: `
        @Injectable({
          providedIn: 'root'
        })
        class Test {
          constructor(
            @Host() private readonly host: DynamicHost
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Inject() decorator.
    code: `
        @Injectable({
          providedIn: 'root'
        })
        class Test {
          constructor(
            @Inject(LOCALE_ID) private readonly localeId: string
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Optional() decorator.
    code: `
        @Injectable({
          providedIn: 'root'
        })
        class Test {
          constructor(
            @Optional() testBase: TestBase,
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Self() decorator.
    code: `
        @Injectable({
          providedIn: 'root'
        })
        class Test {
          constructor(
            @Self() public readonly test: Test,
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @SkipSelf() decorator.
    code: `
        @Injectable({
          providedIn: 'root'
        })
        class Test {
          constructor(
            @SkipSelf() protected readonly parentTest: ParentTest
          ) {}
        }
      `,
  },
  {
    // It should succeed if declarations are decorated with allowed decorators.
    code: `
        @Injectable({
          providedIn: 'root'
        })
        class Test {
          get type(): string {
            return this._type;
          }
          set type(value: string) {
            this._type = value;
          }
          private _type: string;

          private prop: string | undefined;

          constructor(
            @Host() @Optional() private readonly host: DynamicHost,
            @Inject(LOCALE_ID) private readonly localeId: string,
            @Inject(TEST_BASE) @Optional() testBase: TestBase,
            @Optional() @Self() public readonly test: Test,
            @Optional() @SkipSelf() protected readonly parentTest: ParentTest
          ) {}

          clickHandler(): void {}
        }
      `,
  },
  // `@NgModule()`.
  {
    // It should succeed if a parameter property is decorated with @Host() decorator.
    code: `
        @NgModule({
          providers: []
        })
        class Test {
          constructor(
            @Host() private readonly host: DynamicHost
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Inject() decorator.
    code: `
        @NgModule({
          providers: []
        })
        class Test {
          constructor(
            @Inject(LOCALE_ID) private readonly localeId: string
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Optional() decorator.
    code: `
        @NgModule({
          providers: []
        })
        class Test {
          constructor(
            @Optional() testBase: TestBase,
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Self() decorator.
    code: `
        @NgModule({
          providers: []
        })
        class Test {
          constructor(
            @Self() public readonly test: Test,
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @SkipSelf() decorator.
    code: `
        @NgModule({
          providers: []
        })
        class Test {
          constructor(
            @SkipSelf() protected readonly parentTest: ParentTest
          ) {}
        }
      `,
  },
  {
    // It should succeed if declarations are decorated with allowed decorators.
    code: `
        @NgModule({
          providers: []
        })
        class Test {
          get type(): string {
            return this._type;
          }
          set type(value: string) {
            this._type = value;
          }
          private _type: string;

          private prop: string | undefined;

          constructor(
            @Host() @Optional() private readonly host: DynamicHost,
            @Inject(LOCALE_ID) private readonly localeId: string,
            @Inject(TEST_BASE) @Optional() testBase: TestBase,
            @Optional() @Self() public readonly test: Test,
            @Optional() @SkipSelf() protected readonly parentTest: ParentTest
          ) {}

          clickHandler(): void {}
        }
      `,
  },
  // `@Pipe()`.
  {
    // It should succeed if a parameter property is decorated with @Host() decorator.
    code: `
        @Pipe({
          name: 'test'
        })
        class Test {
          constructor(
            @Host() private readonly host: DynamicHost
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Inject() decorator.
    code: `
        @Pipe({
          name: 'test'
        })
        class Test {
          constructor(
            @Inject(LOCALE_ID) private readonly localeId: string
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Optional() decorator.
    code: `
        @Pipe({
          name: 'test'
        })
        class Test {
          constructor(
            @Optional() testBase: TestBase,
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @Self() decorator.
    code: `
        @Pipe({
          name: 'test'
        })
        class Test {
          constructor(
            @Self() public readonly test: Test,
          ) {}
        }
      `,
  },
  {
    // It should succeed if a parameter property is decorated with @SkipSelf() decorator.
    code: `
        @Pipe({
          name: 'test'
        })
        class Test {
          constructor(
            @SkipSelf() protected readonly parentTest: ParentTest
          ) {}
        }
      `,
  },
  {
    // It should succeed if declarations are decorated with allowed decorators.
    code: `
        @Pipe({
          name: 'test'
        })
        class Test {
          get type(): string {
            return this._type;
          }
          set type(value: string) {
            this._type = value;
          }
          private _type: string;

          private prop: string | undefined;

          constructor(
            @Host() @Optional() private readonly host: DynamicHost,
            @Inject(LOCALE_ID) private readonly localeId: string,
            @Inject(TEST_BASE) @Optional() testBase: TestBase,
            @Optional() @Self() public readonly test: Test,
            @Optional() @SkipSelf() protected readonly parentTest: ParentTest
          ) {}

          clickHandler(): void {}
        }
      `,
  },
  {
    // It should succeed if @Component and @Injectable decorators are present on the same file and
    // the @Component contains a non allowed decorator for @Injectable.
    code: `
        @Injectable()
        class TestService {
          constructor() {}
        }

        @Component({
          selector: 'app-test',
          template: '<h1>Hello</h1>',
          providers: [TestService]
        })
        class TestComponent implements OnChanges {
          @Output() emitter = new EventEmitter<void>();

          constructor(private test: TestService) {}
        }
      `,
  },
];

export const invalid = [
  // `@Injectable()`.
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if getter accessor is decorated with @Input() decorator',
    annotatedSource: `
        @Injectable({
          providedIn: 'root'
        })
        class Test {
          @Input()
          ~~~~~~~~
          get label(): string {
            return this._label;
          }
          set label(value: string) {
            this._label = value;
          }
          private _label: string;
        }
      `,
    data: { classDecoratorName: 'Injectable' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if setter accessor is decorated with @Input() decorator',
    annotatedSource: `
        @Injectable({
          providedIn: 'root'
        })
        class Test {
          @Input()
          ~~~~~~~~
          set label(value: string) {
            this._label = value;
          }
          get label(): string {
            return this._label;
          }
          private _label: string;
        }
      `,
    data: { classDecoratorName: 'Injectable' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if setter accessor is decorated with @ViewChild() decorator',
    annotatedSource: `
        @Injectable({
          providedIn: 'root'
        })
        class Test {
          @ViewChild(Pane)
          ~~~~~~~~~~~~~~~~
          set label(value: Pane) {
            doSomething();
          }
        }
      `,
    data: { classDecoratorName: 'Injectable' },
  }),
  // Methods.
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a method is decorated with @HostListener() decorator',
    annotatedSource: `
        @Injectable({
          providedIn: 'root'
        })
        class Test {
          @HostListener('mouseover')
          ~~~~~~~~~~~~~~~~~~~~~~~~~~
          mouseOver() {
            this.doSomething();
          }
        }
      `,
    data: { classDecoratorName: 'Injectable' },
  }),
  // Parameter properties.
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a parameter property is decorated with @Attribute() decorator',
    annotatedSource: `
        @Injectable({
          providedIn: 'root'
        })
        class Test {
          constructor(
            @Attribute('test') private readonly test: string
            ~~~~~~~~~~~~~~~~~~
          ) {}
        }
      `,
    data: { classDecoratorName: 'Injectable' },
  }),
  // Properties.
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a property is decorated with @ContentChild() decorator',
    annotatedSource: `
        @Injectable({
          providedIn: 'root'
        })
        class Test {
          @ContentChild(Pane) pane: Pane;
          ~~~~~~~~~~~~~~~~~~~
        }
      `,
    data: { classDecoratorName: 'Injectable' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a property is decorated with @ContentChildren() decorator',
    annotatedSource: `
        @Injectable({
          providedIn: 'root'
        })
        class Test {
          @ContentChildren(Pane, { descendants: true }) arbitraryNestedPanes: QueryList<Pane>;
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    data: { classDecoratorName: 'Injectable' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a property is decorated with @HostBinding() decorator',
    annotatedSource: `
        @Injectable({
          providedIn: 'root'
        })
        class Test {
          @HostBinding('class.card-outline') private isCardOutline: boolean;
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    data: { classDecoratorName: 'Injectable' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a property is decorated with @Input() decorator',
    annotatedSource: `
        @NgModule({
          providers: []
        })
        class Test {
          @Input() label: string;
          ~~~~~~~~
        }
      `,
    data: { classDecoratorName: 'NgModule' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a property is decorated with @Output() decorator',
    annotatedSource: `
        @NgModule({
          providers: []
        })
        class Test {
          @Output() emitter = new EventEmitter<void>();
          ~~~~~~~~~
        }
      `,
    data: { classDecoratorName: 'NgModule' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a property is decorated with @ViewChild() decorator',
    annotatedSource: `
        @NgModule({
          providers: []
        })
        class Test {
          @ViewChild(Pane) pane: Pane;
          ~~~~~~~~~~~~~~~~
        }
      `,
    data: { classDecoratorName: 'NgModule' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a property is decorated with @ViewChildren() decorator',
    annotatedSource: `
        @NgModule({
          providers: []
        })
        class Test {
          @ViewChildren(Pane) panes: QueryList<Pane>;
          ~~~~~~~~~~~~~~~~~~~
        }
      `,
    data: { classDecoratorName: 'NgModule' },
  }),
  // Multiple declarations.
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if declarations are decorated with non allowed decorator',
    annotatedSource: `
        @NgModule({
          providers: []
        })
        class Test {
          @ContentChild(Pane) pane: Pane;
          ~~~~~~~~~~~~~~~~~~~
  
          @Input()
          ^^^^^^^^
          get label(): string {
            return this._label;
          }
          set label(value: string) {
            this._label = value;
          }
          private _label: string;
  
          @ViewChild(Pane)
          ################
          set label(value: Pane) {
            doSomething();
          }
  
          get type(): string {
            return this._type;
          }
          set type(value: string) {
            this._type = value;
          }
          private _type: string;
  
          private prop: string | undefined;
  
          constructor(
            @Attribute('test') private readonly test: string,
            %%%%%%%%%%%%%%%%%%
            @Inject(LOCALE_ID) localeId: string
          ) {}
  
          @HostListener('mouseover')
          ¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶
          mouseOver() {
            this.doSomething();
          }
  
          clickHandler(): void {}
        }
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { classDecoratorName: 'NgModule' },
      },
      {
        char: '^',
        messageId,
        data: { classDecoratorName: 'NgModule' },
      },
      {
        char: '#',
        messageId,
        data: { classDecoratorName: 'NgModule' },
      },
      {
        char: '%',
        messageId,
        data: { classDecoratorName: 'NgModule' },
      },
      {
        char: '¶',
        messageId,
        data: { classDecoratorName: 'NgModule' },
      },
    ],
  }),
  // `@Pipe()`.
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if getter accessor is decorated with @Input() decorator',
    annotatedSource: `
        @Pipe({
          name: 'test'
        })
        class Test {
          @Input()
          ~~~~~~~~
          get label(): string {
            return this._label;
          }
          set label(value: string) {
            this._label = value;
          }
          private _label: string;
        }
      `,
    data: { classDecoratorName: 'Pipe' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if setter accessor is decorated with @Input() decorator',
    annotatedSource: `
        @Pipe({
          name: 'test'
        })
        class Test {
          @Input()
          ~~~~~~~~
          set label(value: string) {
            this._label = value;
          }
          get label(): string {
            return this._label;
          }
          private _label: string;
        }
      `,
    data: { classDecoratorName: 'Pipe' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if setter accessor is decorated with @ViewChild() decorator',
    annotatedSource: `
        @Pipe({
          name: 'test'
        })
        class Test {
          @ViewChild(Pane)
          ~~~~~~~~~~~~~~~~
          set label(value: Pane) {
            doSomething();
          }
        }
      `,
    data: { classDecoratorName: 'Pipe' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a method is decorated with @HostListener() decorator',
    annotatedSource: `
        @Pipe({
          name: 'test'
        })
        class Test {
          @HostListener('mouseover')
          ~~~~~~~~~~~~~~~~~~~~~~~~~~
          mouseOver() {
            this.doSomething();
          }
        }
      `,
    data: { classDecoratorName: 'Pipe' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a parameter property is decorated with @Attribute() decorator',
    annotatedSource: `
        @Pipe({
          name: 'test'
        })
        class Test {
          constructor(
            @Attribute('test') private readonly test: string
            ~~~~~~~~~~~~~~~~~~
          ) {}
        }
      `,
    data: { classDecoratorName: 'Pipe' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a property is decorated with @ContentChild() decorator',
    annotatedSource: `
        @Pipe({
          name: 'test'
        })
        class Test {
          @ContentChild(Pane) pane: Pane;
          ~~~~~~~~~~~~~~~~~~~
        }
      `,
    data: { classDecoratorName: 'Pipe' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a property is decorated with @ContentChildren() decorator',
    annotatedSource: `
        @Pipe({
          name: 'test'
        })
        class Test {
          @ContentChildren(Pane, { descendants: true }) arbitraryNestedPanes: QueryList<Pane>;
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    data: { classDecoratorName: 'Pipe' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a property is decorated with @HostBinding() decorator',
    annotatedSource: `
        @Pipe({
          name: 'test'
        })
        class Test {
          @HostBinding('class.card-outline') private isCardOutline: boolean;
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    data: { classDecoratorName: 'Pipe' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a property is decorated with @Input() decorator',
    annotatedSource: `
        @Pipe({
          name: 'test'
        })
        class Test {
          @Input() label: string;
          ~~~~~~~~
        }
      `,
    data: { classDecoratorName: 'Pipe' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a property is decorated with @Output() decorator',
    annotatedSource: `
        @Pipe({
          name: 'test'
        })
        class Test {
          @Output() emitter = new EventEmitter<void>();
          ~~~~~~~~~
        }
      `,
    data: { classDecoratorName: 'Pipe' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a property is decorated with @ViewChild() decorator',
    annotatedSource: `
        @Pipe({
          name: 'test'
        })
        class Test {
          @ViewChild(Pane) pane: Pane;
          ~~~~~~~~~~~~~~~~
        }
      `,
    data: { classDecoratorName: 'Pipe' },
  }),
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if a property is decorated with @ViewChildren() decorator',
    annotatedSource: `
        @Pipe({
          name: 'test'
        })
        class Test {
          @ViewChildren(Pane) panes: QueryList<Pane>;
          ~~~~~~~~~~~~~~~~~~~
        }
      `,
    data: { classDecoratorName: 'Pipe' },
  }),
  convertAnnotatedSourceToFailureCase({
    description:
      'should fail if declarations are decorated with non allowed decorator',
    annotatedSource: `
        @Pipe({
          name: 'test'
        })
        class Test {
          @ContentChild(Pane) pane: Pane;
          ~~~~~~~~~~~~~~~~~~~
  
          @Input()
          ^^^^^^^^
          get label(): string {
            return this._label;
          }
          set label(value: string) {
            this._label = value;
          }
          private _label: string;
  
          @ViewChild(Pane)
          ################
          set label(value: Pane) {
            doSomething();
          }
  
          get type(): string {
            return this._type;
          }
          set type(value: string) {
            this._type = value;
          }
          private _type: string;
  
          private prop: string | undefined;
  
          constructor(
            @Attribute('test') private readonly test: string,
            %%%%%%%%%%%%%%%%%%
            @Inject(LOCALE_ID) localeId: string
          ) {}
  
          @HostListener('mouseover')
          ¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶
          mouseOver() {
            this.doSomething();
          }
  
          clickHandler(): void {}
        }
      `,
    messages: [
      {
        char: '~',
        messageId,
        data: { classDecoratorName: 'Pipe' },
      },
      {
        char: '^',
        messageId,
        data: { classDecoratorName: 'Pipe' },
      },
      {
        char: '#',
        messageId,
        data: { classDecoratorName: 'Pipe' },
      },
      {
        char: '%',
        messageId,
        data: { classDecoratorName: 'Pipe' },
      },
      {
        char: '¶',
        messageId,
        data: { classDecoratorName: 'Pipe' },
      },
    ],
  }),
  // Multiple decorators per file.
  convertAnnotatedSourceToFailureCase({
    messageId,
    description:
      'should fail if contains @Directive and @Pipe decorators and the @Pipe contains a not allowed decorator',
    annotatedSource: `
        @Directive({
          selector: 'test'
        })
        class TestDirective {
          @Input() label: string;
        }
  
        @Pipe({
          name: 'test'
        })
        class Test {
          @Input() label: string;
          ~~~~~~~~
        }
      `,
    data: { classDecoratorName: 'Pipe' },
  }),
];
