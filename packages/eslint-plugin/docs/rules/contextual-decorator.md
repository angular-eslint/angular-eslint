# Ensures that classes use contextual decorators in its body (`contextual-decorator`)

Ensures that classes don't use decorators out of context.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
@Injectable({
  providedIn: 'root',
})
class Test {
  @Input()
  get label(): string {
    return this._label;
  }
  set label(value: string) {
    this._label = value;
  }
  private _label: string = '';
}
```

```ts
@NgModule({
  providers: [],
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
    @Inject(LOCALE_ID) localeId: string,
  ) {}
  @HostListener('mouseover')
  mouseOver() {
    this.doSomething();
  }
  clickHandler(): void {}
}
```

Examples of **correct** code for this rule:

```ts
@Component({
  template: 'Hi!',
})
class TestComponent {
  @Input()
  get label(): string {
    return this._label;
  }
  set label(value: string) {
    this._label = value;
  }
  private _label: string = '';
}
```

```ts
@Component({
  template: 'Hi!',
})
class TestComponent {
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
    @Optional() @SkipSelf() protected readonly parentTest: ParentTest,
  ) {}
  @HostListener('mouseover')
  mouseOver(): void {
    this.doSomething();
  }
  clickHandler(): void {}
}
```
