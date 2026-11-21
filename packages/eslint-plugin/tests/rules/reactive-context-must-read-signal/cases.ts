import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import {
  MessageIds,
  Options,
} from '../../../src/rules/reactive-context-must-read-signal';

const messageId: MessageIds = 'mustReadSignal';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  ...[
    // computed() that reads a WritableSignal created with signal().
    `
    const a = signal(0);
    const c = computed(() => a() * 2);
  `,
    // computed() that reads a Signal-typed value.
    `
    let a: Signal<number>;
    const c = computed(() => a() + 1);
  `,
    // computed() that reads a signal whose type is an interface rather than
    // the 'Signal' type alias, which is how signals appear in real code.
    `
    interface WritableSignal<T> {
      (): T;
      set(value: T): void;
    }
    declare const a: WritableSignal<number>;
    const c = computed(() => a() + 1);
  `,
    // computed() that reads an InputSignal.
    `
    let a: InputSignal<number>;
    const c = computed(() => a());
  `,
    // computed() that reads a ModelSignal.
    `
    let a: ModelSignal<number>;
    const c = computed(() => a() + 1);
  `,
    // The signal is read inside a nested callback that runs synchronously.
    `
    let a: Signal<number[]>;
    const c = computed(() => a().map((x) => x * 2));
  `,
    // computed() that reads a signal through 'this'.
    `
    class Test {
      count = signal(0);
      c = computed(() => this.count() + 1);
    }
  `,
    // Conservative: a helper call might read a signal internally, so stay silent.
    `
    function helper(): number {
      return 1;
    }
    const c = computed(() => helper());
  `,
    // Conservative: a method of another class might read a signal internally.
    `
    class Service {
      getValue(): number {
        return 1;
      }
    }
    class Test {
      service = new Service();
      c = computed(() => this.service.getValue());
    }
  `,
    // Conservative: an Angular API that is not a signal read stays unknown.
    `
    const c = computed(() => untracked(() => 1));
  `,
    // Conservative: a standard library call that is handed a function value we
    // cannot look inside, e.g. 'this.transform', might read a signal.
    `
    class Test {
      items = [1, 2, 3];
      transform(value: number): number {
        return value;
      }
      c = computed(() => this.items.map(this.transform));
    }
  `,
    // Conservative: a standard library call that is handed an 'any' value might
    // be given a function that reads a signal.
    `
    declare const transform: any;
    class Test {
      items = [1, 2, 3];
      c = computed(() => this.items.map(transform));
    }
  `,
    // Conservative: a union that includes a function value we cannot look
    // inside might read a signal.
    `
    class Test {
      items = [1, 2, 3];
      transform: ((value: number) => number) | ((value: number) => string) =
        (value) => value;
      c = computed(() => this.items.map(this.transform));
    }
  `,
    // Conservative: a spread argument could expand to a function that reads a
    // signal, so a standard library call that receives one stays unknown.
    `
    class Test {
      values = [1, 2, 3];
      c = computed(() => Math.max(...this.values));
    }
  `,
    // Conservative: 'call()' is a standard library method, but it runs the
    // function it is called on, which might read a signal.
    `
    function helper(): number {
      return 1;
    }
    const c = computed(() => helper.call(undefined));
  `,
    // Conservative: 'apply()' runs the function it is called on, too.
    `
    function helper(): number {
      return 1;
    }
    const c = computed(() => helper.apply(undefined, []));
  `,
    // Conservative: a signal called through 'call()' is treated as unknown,
    // not as a signal read.
    `
    interface WritableSignal<T> {
      (): T;
      set(value: T): void;
    }
    declare const a: WritableSignal<number>;
    const c = computed(() => a.call(undefined));
  `,
    // Conservative: constructing a user-defined class runs arbitrary code.
    `
    class Box {
      value = 1;
    }
    const c = computed(() => new Box().value);
  `,
    // Conservative: a template tag runs arbitrary code.
    `
    declare function html(
      strings: TemplateStringsArray,
      ...values: unknown[]
    ): string;
    const outside = html\`ignored\`;
    const c = computed(() => html\`static\`);
  `,
    // Conservative: a getter can read a signal without looking like a call.
    `
    class Test {
      count = signal(0);
      get double(): number {
        return this.count() * 2;
      }
      c = computed(() => this.double);
    }
  `,
    // Conservative: destructuring invokes a getter just like a member
    // expression does.
    `
    class Test {
      count = signal(0);
      get double(): number {
        return this.count() * 2;
      }
      c = computed(() => {
        const { double } = this;
        return double;
      });
    }
  `,
    // Conservative: a rest element copies every property, including getters.
    `
    class Test {
      count = signal(0);
      get double(): number {
        return this.count() * 2;
      }
      c = computed(() => {
        const { count, ...rest } = this;
        return rest;
      });
    }
  `,
    // computed() that reads the result of a nested computed.
    `
    let a: Signal<number>;
    const c = computed(() => {
      const inner = computed(() => a() * 2);
      return inner() + 1;
    });
  `,
    // Conservative: the tracked function is not an inline function, so we
    // cannot tell whether it reads a signal.
    `
    function compute(): number {
      return 1;
    }
    const c = computed(compute);
  `,
    // linkedSignal() shorthand that reads a signal.
    `
    let a: Signal<number>;
    const c = linkedSignal(() => a() + 1);
  `,
    // linkedSignal() options form: the 'source' reads a signal.
    `
    let a: Signal<number>;
    const c = linkedSignal({ source: () => a(), computation: (s) => s * 2 });
  `,
    // linkedSignal() options form: the 'computation' reads a signal.
    `
    let a: Signal<number>;
    const c = linkedSignal({ source: () => 1, computation: () => a() });
  `,
    // linkedSignal() options form: the documented usage passes the signal
    // itself as the 'source', which we cannot analyse as a function.
    `
    let a: Signal<string[]>;
    const c = linkedSignal({ source: a, computation: (options) => options[0] });
  `,
    // linkedSignal() options form: a spread could provide a reactive 'source'.
    `
    declare const options: { source: () => number };
    const c = linkedSignal({ ...options, computation: (s) => s + 1 });
  `,
    // effect() that reads a signal.
    `
    let a: Signal<number>;
    effect(() => {
      console.log(a());
    });
  `,
    // afterRenderEffect() shorthand that reads a signal.
    `
    let a: Signal<number>;
    afterRenderEffect(() => a() + 1);
  `,
    // afterRenderEffect() phases form: one of the phases reads a signal.
    `
    let a: Signal<number>;
    afterRenderEffect({
      earlyRead: () => 1,
      write: () => a(),
    });
  `,
    // resource() is not checked unless 'checkResources' is enabled.
    `
    const r = resource({ params: () => 1, loader: () => null });
  `,
    // Not Angular's computed(): a member expression callee is ignored.
    `
    declare const Test: { computed: (fn: () => unknown) => unknown };
    Test.computed(() => 1);
  `,
    // Incomplete code: there is no tracked function to analyse.
    `
    const c = computed();
  `,
    // 'computed' referenced without being called.
    `
    const x = computed;
  `,
    // Regression for #3198: inherited Object.prototype names are not primitives.
    `
    const callback = ({
      valueOf,
      toString,
      constructor,
      hasOwnProperty,
    }: {
      valueOf: () => unknown;
      toString: () => unknown;
      constructor: () => unknown;
      hasOwnProperty: () => unknown;
    }) => {
      valueOf();
      toString();
      constructor();
      hasOwnProperty();
    };
  `,
  ].map(appendTypes),

  // resource() with checkResources: the 'params' reads a signal.
  {
    code: appendTypes(`
    let a: Signal<number>;
    const r = resource({ params: () => a(), loader: () => null });
  `),
    options: [{ checkResources: true }],
  },

  // With 'followLocalCalls', the rule looks inside local functions, but it
  // still stays silent when a followed function might read a signal, or when
  // it cannot safely look inside a function.
  ...[
    // A followed private method reads a signal.
    `
    class Test {
      count: Signal<number> = signal(0);
      private double(): number {
        return this.count() * 2;
      }
      c = computed(() => this.double());
    }
  `,
    // A followed private getter reads a signal.
    `
    class Test {
      count: Signal<number> = signal(0);
      private get double(): number {
        return this.count() * 2;
      }
      c = computed(() => this.double);
    }
  `,
    // A local function passed as the tracked function reads a signal.
    `
    let a: Signal<number>;
    function compute(): number {
      return a() * 2;
    }
    const c = computed(compute);
  `,
    // A default parameter value runs when no argument is passed, so its
    // signal read counts.
    `
    class Test {
      count: Signal<number> = signal(0);
      private label(value: number = this.count() * 2): string {
        return String(value);
      }
      c = computed(() => this.label());
    }
  `,
    // A signal read in a callback inside a followed function counts as well.
    `
    class Test {
      count: Signal<number> = signal(0);
      items = [1, 2, 3];
      private scaled(): number[] {
        return this.items.map((item) => item * this.count());
      }
      c = computed(() => this.scaled());
    }
  `,
    // Mutual recursion.
    `
    class Test {
      count: Signal<number> = signal(0);
      private a(depth: number): number {
        return depth > 0 ? this.b(depth - 1) : this.count() * 2;
      }
      private b(depth: number): number {
        return this.a(depth);
      }
      first = computed(() => this.a(1));
      // 'b' is checked while 'a' is still being followed.
      second = computed(() => this.b(1));
    }
  `,
    // Conservative: recursion is treated as unknown.
    `
    function factorial(n: number): number {
      return n <= 1 ? 1 : n * factorial(n - 1);
    }
    const c = computed(() => factorial(5));
  `,
    // A public method is not followed, because a subclass could override it
    // with one that reads a signal.
    `
    class Test {
      name = 'x';
      label(): string {
        return this.name;
      }
      c = computed(() => this.label());
    }
  `,
    // A protected method could be overridden as well.
    `
    class Test {
      name = 'x';
      protected title(): string {
        return this.name;
      }
      c = computed(() => this.title());
    }
  `,
    // So could a public getter.
    `
    class Test {
      name = 'x';
      get initial(): string {
        return this.name[0];
      }
      c = computed(() => this.initial);
    }
  `,
    // What a followed function calls is checked in the same way: a method of
    // another class and an Angular API are still unknown.
    `
    class Service {
      getValue(): number {
        return 1;
      }
    }
    class Test {
      private readonly service = new Service();
      private value(): number {
        return this.service.getValue();
      }
      private peek(): number {
        return untracked(() => 1);
      }
      a = computed(() => this.value());
      b = computed(() => this.peek());
    }
  `,
    // A declared type can hide a getter that reads a signal, like 'total'
    // here, so an argument may not get a wider type: 'Item' for a 'Line'.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    function show(item: Item): string {
      return String(item.total);
    }
    const c = computed(() => show(line));
  `,
    // A returned value may not get a wider type either: the declared 'Item'
    // hides the 'Line' that is returned.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    function current(): Item {
      return line;
    }
    const c = computed(() => current().total);
  `,
    // The caller sees the return type of the overload signature, which can
    // be wider than what is returned.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    function pick(index: 0): Item;
    function pick(index: number) {
      return line;
    }
    const c = computed(() => pick(0).total);
  `,
    // The annotation on the variable types the result of the function.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    const lookUp: () => Item = () => line;
    const c = computed(() => lookUp().total);
  `,
    // A declared return type still matters when the result is used:
    // 'computation' gets what 'source' returns.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    class Test {
      private current(): Item {
        return line;
      }
      c = linkedSignal({
        source: () => this.current(),
        computation: (item: Item) => item.total,
      });
    }
  `,
    // A declared return type still matters when a callback hands its result
    // to 'map'.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    class Test {
      ids = [1, 2];
      private current(): Item {
        return line;
      }
      c = computed(() => this.ids.map(() => { return this.current(); })[0].total);
    }
  `,
    // A declared return type still matters when another function, like 'relay',
    // hands the result to its caller.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    class Test {
      private current(): Item {
        return line;
      }
      private relay() {
        return this.current();
      }
      c = computed(() => this.relay().total);
    }
  `,
    // A declared return type still matters when 'map' hands back what 'byId'
    // returns.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    class Test {
      ids = [1, 2];
      private byId(id: number): Item {
        return line;
      }
      c = computed(() => this.ids.map(this.byId)[0].total);
    }
  `,
    // A declared return type still matters when the result is used in an
    // expression.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    class Test {
      ids = [1, 2];
      private current(): Item {
        return line;
      }
      c = computed(() => (this.ids.length ? this.current() : line).total);
    }
  `,
    // A declared return type still matters when the result is kept in a
    // variable.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    class Test {
      private current(): Item {
        return line;
      }
      c = computed(() => { const item = this.current(); return item.total; });
    }
  `,
    // A function referred to in an options object is not followed.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    class Test {
      private current(): Item {
        return line;
      }
      c = linkedSignal({ source: this.current, computation: (item: Item) => item.total });
    }
  `,
    // 'any' and 'unknown' are never trusted as the type of an argument.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    const anything: any = line;
    const mystery: unknown = line;
    function readAny(value: any): number {
      return value.total;
    }
    function readUnknown(value: unknown): number {
      return (value as Item).total;
    }
    const a = computed(() => readAny(anything));
    const b = computed(() => readUnknown(mystery));
  `,
    // A spread argument is never trusted.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    const pair: [Line, Line] = [line, line];
    function second(first: Line, item: Item): number {
      return item.total;
    }
    const c = computed(() => second(...pair));
  `,
    // 'arguments' reads the argument as 'any'.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    function fromArguments(item: Line): number {
      return arguments[0].total;
    }
    const c = computed(() => fromArguments(line));
  `,
    // The argument must match the 'Item' of the implementation, not the 'Line'
    // of the overload signature.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    function overloaded(item: Line): number;
    function overloaded(item: Item): number {
      return item.total;
    }
    const c = computed(() => overloaded(line));
  `,
    // Each argument is checked, not only the first.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    function both(count: number, item: Item): number {
      return count + item.total;
    }
    const c = computed(() => both(1, line));
  `,
    // An argument must be plain: a primitive, or an array, a tuple or a promise
    // of primitives. A union with an object and a tuple with one are not plain.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    declare const maybe: Line | undefined;
    const tuple: [number, Line] = [1, line];
    function readUnknown(value: unknown): number {
      return (value as Item).total;
    }
    const a = computed(() => readUnknown(maybe));
    const b = computed(() => readUnknown(tuple));
  `,
    // A function with a 'this' parameter is not followed, because it can
    // give 'this' a wider type.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
      private own(this: Item): number {
        return this.total;
      }
      c = computed(() => this.own());
    }
  `,
    // A private method called on another object than 'this' is not followed:
    // 'box' is a 'Box<Line>', but the body of 'show' sees 'T'.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    class Box<T extends Item> {
      constructor(readonly value: T) {}
      private show(): number {
        return this.value.total;
      }
      static watch(box: Box<Line>, boxes: Box<Line>[]) {
        return [computed(() => box.show()), computed(() => boxes[0].show())];
      }
    }
  `,
    // A default value is checked like an argument.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    function withDefault(item: Item = line): number {
      return item.total;
    }
    const c = computed(() => withDefault());
  `,
    // A function with a destructured parameter is not followed.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    interface Options {
      readonly item?: Item;
    }
    const line = new Line();
    const options: Options = {};
    function destructured({ item = line }: Options = options): number {
      return item.total;
    }
    const c = computed(() => destructured());
  `,
    // A local function called with 'new' is not followed.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    function Make() {
      return line;
    }
    const c = computed(() => new Make().total);
  `,
    // A local function used as a template tag is not followed.
    `
    function shout(strings: TemplateStringsArray): string {
      return strings.join('').toUpperCase();
    }
    const c = computed(() => shout\`static\`);
  `,
    // A value returned under a declared type must be plain or have exactly
    // that type. Here a 'Line' is returned as an 'Item'.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    const current = (): Item => line;
    class Test {
      c = computed(() => current().total);
    }
  `,
    // What a generator yields is not checked.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    function* lines(): Generator<Item, void> {
      yield line;
    }
    class Test {
      c = effect(() => { for (const item of lines()) { console.log(item.total); } });
    }
  `,
    // A getter is also typed by the parameter of its setter.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    class Test {
      lines = [line];
      private get first() {
        return this.lines[0];
      }
      private set first(value: Item) {
        this.lines = [];
      }
      c = computed(() => this.first.total);
    }
  `,
    // Without a declared type, TypeScript reduces the 'Line' and the 'Item'
    // that 'pick' returns to 'Item'.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    class Test {
      lines = [line];
      fallback: Item = { total: 0 };
      private pick() {
        if (this.lines.length) {
          return this.lines[0];
        }
        return this.fallback;
      }
      c = computed(() => this.pick().total);
    }
  `,
    // A returned 'Line' is not the whole declared 'Line | Plain'.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    class Plain {
      total = 1;
    }
    const line = new Line();
    class Test {
      lines = [line];
      private either(): Line | Plain {
        return this.lines[0];
      }
      c = computed(() => this.either().total);
    }
  `,
    // The caller of a method sees the return type of the overload signature,
    // not the 'Line' of the implementation.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    class Test {
      lines = [line];
      private at(index: 0): Item;
      private at(index: number): Line {
        return this.lines[index];
      }
      c = computed(() => this.at(0).total);
    }
  `,
    // Conservative: an array of arrays is not plain. That also keeps the
    // check of a recursive type like 'Json' from recursing without end.
    `
    type Json = string | Json[];
    const data: Json = ['a', ['b']];
    function first(json: Json): Json {
      return Array.isArray(json) ? json[0] : json;
    }
    const c = computed(() => first(data).length);
  `,
    // The standard library can pass every value it gets on to a function that
    // it is handed: 'map' calls 'label' with 'this.line' as 'this'.
    `
    class Line {
      qty: Signal<number> = signal(1);
      get name(): string {
        return String(this.qty());
      }
      trim(): string {
        return this.name;
      }
    }
    class Test {
      name = 'x';
      line = new Line();
      ids = [1, 2];
      private label(id: number): string {
        return this.name + id;
      }
      c = computed(() => this.ids.map(this.label, this.line));
    }
  `,
    // The rows are 'any', so 'clean' may not get a string.
    `
    class Line {
      qty: Signal<number> = signal(1);
      get name(): string {
        return String(this.qty());
      }
      trim(): string {
        return this.name;
      }
    }
    class Test {
      line = new Line();
      rows: any[] = [this.line];
      private clean(value: string): string {
        return value.trim();
      }
      c = computed(() => this.rows.map(this.clean));
    }
  `,
    // Conservative: 'setTimeout' passes 'this.line' on, but only later.
    `
    class Line {
      qty: Signal<number> = signal(1);
      get name(): string {
        return String(this.qty());
      }
      trim(): string {
        return this.name;
      }
    }
    class Test {
      line = new Line();
      private clean(value: string): string {
        return value.trim();
      }
      c = effect(() => { setTimeout(this.clean, 0, this.line); });
    }
  `,
    // Conservative: a callee in parentheses hides what 'map' is called on.
    `
    class Test {
      names = ['a'];
      private clean(value: string): string {
        return value.trim();
      }
      c = computed(() => (this.names?.map)(this.clean));
    }
  `,
    // Conservative: calling a getter runs the function it returns, which we
    // cannot look inside.
    `
    class Test {
      handler: () => number = () => 1;
      private get run() {
        return this.handler;
      }
      c = computed(() => this.run());
      d = computed(this.run);
    }
  `,
    // Conservative: a write to a private accessor runs its setter, which is
    // not followed, so a setter that reads a signal keeps the context unknown.
    `
    class Test {
      count: Signal<number> = signal(0);
      n = 0;
      private get counter(): number {
        return this.n;
      }
      private set counter(value: number) {
        this.n = value + this.count();
      }
      c = effect(() => { this.counter = 1; });
    }
  `,
    // An update of a private accessor runs its setter, too.
    `
    class Test {
      count: Signal<number> = signal(0);
      n = 0;
      private get counter(): number {
        return this.n;
      }
      private set counter(value: number) {
        this.n = value + this.count();
      }
      c = effect(() => { this.counter++; });
    }
  `,
    // A destructuring assignment to a private accessor runs its setter, too.
    `
    class Test {
      count: Signal<number> = signal(0);
      n = 0;
      private get counter(): number {
        return this.n;
      }
      private set counter(value: number) {
        this.n = value + this.count();
      }
      c = effect(() => { ({ value: this.counter } = { value: 1 }); });
    }
  `,
    // A write through a type assertion runs the setter, too.
    `
    class Test {
      count: Signal<number> = signal(0);
      n = 0;
      private get counter(): number {
        return this.n;
      }
      private set counter(value: number) {
        this.n = value + this.count();
      }
      c = effect(() => { (this.counter as number) = 1; });
    }
  `,
    // Conservative: a method reached through an element access is not
    // resolved, so it is not followed.
    `
    class Test {
      name = 'x';
      private label(): string {
        return this.name;
      }
      c = computed(() => this['label']());
    }
  `,
    // A decorator can replace a method, so a decorated method is not followed.
    `
    declare const memoize: any;
    class Test {
      name = 'x';
      @memoize
      private label(): string {
        return this.name;
      }
      c = computed(() => this.label());
    }
  `,
    // Conservative: a decorator on either accessor of a pair blocks both,
    // because a legacy decorator gets the descriptor of the pair.
    `
    declare const memoize: any;
    class Test {
      name = 'x';
      @memoize
      private set title(value: string) {
        this.name = value;
      }
      private get title(): string {
        return this.name;
      }
      c = computed(() => this.title);
    }
  `,
    // The same holds when the decorated setter comes after the getter.
    `
    declare const memoize: any;
    class Test {
      name = 'x';
      private get note(): string {
        return this.name;
      }
      @memoize
      private set note(value: string) {
        this.name = value;
      }
      c = computed(() => this.note);
    }
  `,
    // A private method that is assigned to is not followed, because the new
    // function could read a signal.
    `
    class Test {
      count: Signal<number> = signal(0);
      constructor() {
        this.label = () => String(this.count());
      }
      private label(): string {
        return 'x';
      }
      c = computed(() => this.label());
    }
  `,
    // An assignment through an element access counts as well.
    `
    class Test {
      count: Signal<number> = signal(0);
      constructor() {
        this['title'] = () => String(this.count());
      }
      private title(): string {
        return 'y';
      }
      c = computed(() => this.title());
    }
  `,
    // An assignment through an element access with a constant key counts as
    // well.
    `
    const KEY = 'note';
    class Test {
      count: Signal<number> = signal(0);
      constructor() {
        this[KEY] = () => String(this.count());
      }
      private note(): string {
        return 'z';
      }
      c = computed(() => this.note());
    }
  `,
    // Conservative: a function without a body could do anything.
    `
    declare function helper(): number;
    const c = computed(() => helper());
  `,
    // Two implementations of one function do not compile, and we cannot tell
    // which of them would run.
    `
    let a: Signal<number>;
    function helper(): number {
      return 1;
    }
    function helper(): number {
      return a();
    }
    const c = computed(() => helper());
  `,
    // Conservative: a 'let' or 'var' binding could be reassigned to a
    // function that reads a signal.
    `
    let format = (value: number) => value.toFixed(2);
    var round = (value: number) => value.toFixed(0);
    const a = computed(() => format(1));
    const b = computed(() => round(1));
  `,
    // An assignment outside the class counts as well, and a key that is not
    // a single string can name any member.
    `
    let a: Signal<number>;
    class Test {
      private label(): string {
        return 'x';
      }
      c = computed(() => this.label());
    }
    function patch(test: Test, name: string): void {
      test[name] = () => String(a());
    }
  `,
    // A followed function that reads a getter stays unknown.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    function fromGetter(): number {
      return line.total;
    }
    const c = computed(() => fromGetter());
  `,
    // A followed function that uses 'new' stays unknown.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    function fromNew(): number {
      return new Line().qty.length;
    }
    const c = computed(() => fromNew());
  `,
    // A followed function that calls a template tag stays unknown.
    `
    declare function tag(strings: TemplateStringsArray): number;
    function fromTag(): number {
      return tag\`x\`;
    }
    const c = computed(() => fromTag());
  `,
    // A followed function that destructures a getter stays unknown.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    function fromPattern(): number {
      const { total } = line;
      return total;
    }
    const c = computed(() => fromPattern());
  `,
    // Every parameter must be a plain name, not only the first.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    const items: Item[] = [line];
    function pattern(count: number, [first]: Item[]): number {
      return count + first.total;
    }
    const c = computed(() => pattern(1, items));
  `,
    // Every returned value must match the declared type, not only the first.
    `
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    const item: Item = { total: 1 };
    function oneOf(flag: boolean): Item {
      if (flag) {
        return item;
      }
      return line;
    }
    const c = computed(() => oneOf(true).total);
  `,
    // Conservative: a property that holds a function can be reassigned.
    `
    class Test {
      private format = (value: number) => value.toFixed(2);
      c = computed(() => this.format(1));
    }
  `,
    // Functions declared in other files are not followed, whether they are
    // imported by name or reached through a namespace import.
    `
    import { format } from './helpers';
    import * as helpers from './helpers';
    const a = computed(() => format(1));
    const b = computed(() => helpers.format(1));
  `,
  ].map((code): ValidTestCase<Options> => ({
    code: appendTypes(code),
    options: [{ followLocalCalls: true }],
  })),

  // A declared type predicate retypes 'this' for the caller, and nothing
  // checks that it is true. 'this is Flat' hides the getter 'total' of 'Line'.
  {
    code: appendTypes(`
    interface Flat {
      qty: Signal<number>;
      readonly total: number;
      readonly extra: number;
    }
    class Line {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
      private isFlat(): this is Flat {
        return true;
      }
      c = computed(() => (this.isFlat() ? this.total : 0));
    }
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
  // A declared type predicate on a parameter retypes its argument for the
  // caller, and nothing checks that it is true.
  {
    code: appendTypes(`
    interface Flat {
      qty: Signal<number>;
      readonly total: number;
      readonly extra: number;
    }
    class Line {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    function isFlat(value: Line): value is Flat {
      return true;
    }
    const c = computed(() => (isFlat(line) ? line.total : 0));
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
  // An assertion retypes its argument for the caller as well.
  {
    code: appendTypes(`
    interface Flat {
      qty: Signal<number>;
      readonly total: number;
      readonly extra: number;
    }
    class Line {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    function assertFlat(value: Line): asserts value is Flat {}
    const c = computed(() => { assertFlat(line); return line.total; });
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
  // A type predicate in an overload signature retypes the argument, too.
  {
    code: appendTypes(`
    interface Flat {
      qty: Signal<number>;
      readonly total: number;
      readonly extra: number;
    }
    class Line {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    function isFlatToo(value: Line): value is Flat;
    function isFlatToo(value: Line): boolean {
      return true;
    }
    const c = computed(() => (isFlatToo(line) ? line.total : 0));
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
  // An assertion can narrow anything that its argument mentions.
  {
    code: appendTypes(`
    class Line {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    const line = new Line();
    function check(condition: boolean): asserts condition {}
    const c = computed(() => { check(line instanceof Line); return 1; });
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
  // Only the array type itself is plain: a subclass of 'Array' can override
  // a method. 'Reactive' overrides 'join()'.
  {
    code: appendTypes(`
    class Reactive extends Array<number> {
      count: Signal<number> = signal(0);
      override join(): string {
        return String(this.count());
      }
    }
    const list = new Reactive();
    function show(values: readonly number[]): string {
      return values.join();
    }
    const c = computed(() => show(list));
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
  // 'reduce' hands 'grow' what it returned before, which is the 'Reactive'.
  {
    code: appendTypes(`
    class Reactive extends Array<number> {
      count: Signal<number> = signal(0);
      override join(): string {
        return String(this.count());
      }
    }
    const list = new Reactive();
    function grow(all: readonly number[], id: number) {
      return all.join().length > id ? all : list;
    }
    const c = computed(() => [1, 2].reduce<readonly number[]>(grow, [0]));
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
  // A class that implements 'ArrayLike' can declare a getter.
  {
    code: appendTypes(`
    class Lazy implements ArrayLike<number> {
      readonly [index: number]: number;
      count: Signal<number> = signal(0);
      get length(): number {
        return this.count();
      }
    }
    const lazy: ArrayLike<number> = new Lazy();
    function size(values: { readonly length: number }): number {
      return values.length;
    }
    const c = computed(() => size(lazy));
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
  // The inferred type reduces 'Reactive' and 'number[]' to 'number[]'.
  {
    code: appendTypes(`
    class Reactive extends Array<number> {
      count: Signal<number> = signal(0);
      override join(): string {
        return String(this.count());
      }
    }
    const list = new Reactive();
    function mixed(flag: boolean) {
      if (flag) {
        return list;
      }
      return [1, 2];
    }
    const c = computed(() => mixed(true).join());
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
  // A member is only followed on the 'this' of its own class. In 'toString',
  // 'this' is a 'Box<Line>', not the 'this' of the class.
  {
    code: appendTypes(`
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    class Box<T extends Item> {
      constructor(readonly value: T) {}
      private read(): number {
        return this.value.total;
      }
      static patch(box: Box<Line>): void {
        box.toString = function () {
          return String(computed(() => this.read())());
        };
      }
    }
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
  // A method reference must not use 'this': Angular calls 'size' with
  // another 'this'.
  {
    code: appendTypes(`
    class Test {
      ids = [1];
      private size(): number {
        return this.ids.length;
      }
      c = computed(this.size);
    }
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
  // A getter read must not be narrowed: the getter returns another object
  // the second time.
  {
    code: appendTypes(`
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    class Other {
      total = 1;
      other = true;
    }
    class Test {
      line = new Line();
      slot: Line | Other = new Other();
      private get current(): Line | Other {
        return this.slot;
      }
      c = computed(() => {
        if (this.current instanceof Line) {
          return 0;
        }
        this.slot = this.line;
        return this.current.total;
      });
    }
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
  // An inferred return type must not be reduced: TypeScript reduces the two
  // 'Line | Item' to 'Item'.
  {
    code: appendTypes(`
    interface Item {
      readonly total: number;
    }
    class Line implements Item {
      qty: Signal<number> = signal(1);
      get total(): number {
        return this.qty() * 2;
      }
    }
    class Test {
      line = new Line();
      either: Line | Item = this.line;
      private pick(flag: boolean) {
        if (flag) {
          return this.either;
        }
        return this.either;
      }
      c = computed(() => this.pick(true).total);
    }
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
  // The depth of followed calls is limited, so the end of a very long chain of
  // local calls stays unknown.
  {
    code: appendTypes(`
    ${Array.from(
      { length: 60 },
      (_, i) => `function f${i}(): number { return f${i + 1}(); }`,
    ).join('\n')}
    function f60(): number { return 1; }
    const c = computed(() => f0());
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
  // The parser accepts a JSDoc type, but it has no visitor keys for it.
  {
    code: appendTypes(`
    function legacy(value: string?): number {
      return 1;
    }
    const c = computed(() => legacy('a'));
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
  // Without 'followLocalCalls', a function value in any argument of a
  // standard library call is unknown.
  {
    code: appendTypes(`
    class Test {
      private replacer(key: string, value: number): number {
        return value;
      }
      c = computed(() => JSON.stringify({ a: 1 }, this.replacer));
    }
  `),
    settings: { hideFromDocs: true },
  },
  // Only the 'Promise' of the standard library is plain, not a class that
  // happens to have the same name.
  {
    code: appendTypes(`
    interface Lazy {
      readonly value: number;
    }
    class Promise<T> {
      count: Signal<number> = signal(0);
      constructor(private readonly inner: T) {}
      get value(): T {
        this.count();
        return this.inner;
      }
    }
    const made = new Promise(1);
    function make(): Lazy {
      return made;
    }
    const c = computed(() => make().value);
  `),
    options: [{ followLocalCalls: true }],
    settings: { hideFromDocs: true },
  },
];

const invalidBase: readonly InvalidTestCase<MessageIds, Options>[] = [
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() reads only a non-reactive variable',
    annotatedSource: `
        const value = 42;
        const c = computed(() => value * 2);
                  ~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() returns a literal',
    annotatedSource: `
        const c = computed(() => 42);
                  ~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() reads only a plain property',
    annotatedSource: `
        class Test {
          name = 'x';
          c = computed(() => this.name);
              ~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() destructures only a plain property',
    annotatedSource: `
        class Test {
          name = 'x';
          c = computed(() => {
              ~~~~~~~~~~~~~~~~
            const { name } = this;
            ~~~~~~~~~~~~~~~~~~~~~~
            return name;
            ~~~~~~~~~~~~
          });
          ~~
        }
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'computed() calls a standard library method on a non-reactive value',
    annotatedSource: `
        class Test {
          name = 'x';
          c = computed(() => this.name.toUpperCase());
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'computed() calls a standard library method with an inline callback',
    annotatedSource: `
        class Test {
          items = [1, 2, 3];
          c = computed(() => this.items.filter((item) => item > 1));
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() only calls a global from the standard library',
    annotatedSource: `
        const x = 1.5;
        const c = computed(() => Math.floor(x));
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() constructs a standard library class',
    annotatedSource: `
        const c = computed(() => new Date().getFullYear());
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() is a function expression with no signal read',
    annotatedSource: `
        const c = computed(function () {
                  ~~~~~~~~~~~~~~~~~~~~~~
          return 42;
          ~~~~~~~~~~
        });
        ~~
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'non-reactive computed() with an options argument',
    annotatedSource: `
        const c = computed(() => 1, { equal: (a, b) => a === b });
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'linkedSignal() shorthand with no signal read',
    annotatedSource: `
        const c = linkedSignal(() => 42);
                  ~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'linkedSignal' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'linkedSignal() options form where neither function is reactive',
    annotatedSource: `
        const c = linkedSignal({ source: () => 1, computation: (s) => s + 1 });
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'linkedSignal' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'effect() with no signal read',
    annotatedSource: `
        const value = 1;
        effect(() => value + 1);
        ~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'effect' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'effect() that only logs a non-reactive value',
    annotatedSource: `
        effect(() => {
        ~~~~~~~~~~~~~~
          console.log('side effect');
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~
        });
        ~~
      `,
    messageId,
    data: { primitive: 'effect' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'afterRenderEffect() shorthand with no signal read',
    annotatedSource: `
        afterRenderEffect(() => 42);
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    messageId,
    data: { primitive: 'afterRenderEffect' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'afterRenderEffect() phases form with no signal read',
    annotatedSource: `
        afterRenderEffect({
        ~~~~~~~~~~~~~~~~~~~
          earlyRead: () => 1,
          ~~~~~~~~~~~~~~~~~~~
          write: (value) => value + 1,
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        });
        ~~
      `,
    messageId,
    data: { primitive: 'afterRenderEffect' },
  }),
  {
    ...convertAnnotatedSourceToFailureCase<MessageIds, Options>({
      description:
        'resource() with static params when checkResources is enabled',
      annotatedSource: `
        const r = resource({ params: () => 1, loader: () => null });
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
      messageId,
      data: { primitive: 'resource' },
    }),
    options: [{ checkResources: true }],
  },
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() calls a local helper that reads no signal',
    annotatedSource: `
        function helper(): number {
          return 1;
        }
        const c = computed(() => helper());
                  ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() calls an exported function that reads no signal',
    annotatedSource: `
        export function helper(): number {
          return 1;
        }
        const c = computed(() => helper());
                  ~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() is passed a local function that reads no signal',
    annotatedSource: `
        function compute(): number {
          return 1;
        }
        const c = computed(compute);
                  ~~~~~~~~~~~~~~~~~
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'computed() calls a private method that only calls the standard library',
    annotatedSource: `
        class Test {
          name = 'x';
          private label(): string {
            return this.name.toUpperCase();
          }
          c = computed(() => this.label());
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'effect() that calls a private async method',
    annotatedSource: `
        class Test {
          saved = false;
          private async save(): Promise<void> {
            this.saved = true;
          }
          e = effect(() => void this.save());
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'effect' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'computed() calls a private method that returns an object and declares no return type',
    annotatedSource: `
        class Test {
          title = 'x';
          private buildVm() {
            return { title: this.title, length: this.title.length };
          }
          vm = computed(() => this.buildVm());
               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          length = computed(() => this.buildVm().length);
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        }
      `,
    options: [{ followLocalCalls: true }],
    messages: [
      { char: '~', messageId, data: { primitive: 'computed' } },
      { char: '^', messageId, data: { primitive: 'computed' } },
    ],
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() calls a #private method that reads no signal',
    annotatedSource: `
        class Test {
          name = 'x';
          #label(): string {
            return this.name.trim();
          }
          c = computed(() => this.#label());
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() reads a private getter that reads no signal',
    annotatedSource: `
        class Test {
          name = 'x';
          private get label(): string {
            return this.name.toUpperCase();
          }
          c = computed(() => this.label);
              ~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() reads a #private getter that reads no signal',
    annotatedSource: `
        class Test {
          name = 'x';
          get #label(): string {
            return this.name;
          }
          c = computed(() => this.#label);
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() calls an overloaded private method',
    annotatedSource: `
        class Test {
          private format(value: string): string;
          private format(value: number): string;
          private format(value: string | number): string {
            return String(value);
          }
          c = computed(() => this.format(1));
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() reads a private getter that has a setter',
    annotatedSource: `
        class Test {
          name = 'x';
          private get label(): string {
            return this.name;
          }
          private set label(value: string) {
            this.name = value;
          }
          rename(): void {
            this.label = 'y';
          }
          c = computed(() => this.label);
              ~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() calls a private static method',
    annotatedSource: `
        class Test {
          private static format(value: number): string {
            return value.toFixed(2);
          }
          c = computed(() => Test.format(1));
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'computed() calls a function with primitive parameters of every kind',
    annotatedSource: `
        enum Mode {
          On,
          Off,
        }
        function describe(
          flag: boolean,
          size: bigint,
          mode: Mode,
          key: symbol,
          label: string | null,
          count?: number,
        ): string {
          return [flag, size, mode, key.description, label, count].join();
        }
        const c = computed(() => describe(true, 1n, Mode.On, Symbol.iterator, null));
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() calls a const arrow function that reads no signal',
    annotatedSource: `
        const format = (value: number) => value.toFixed(2);
        const c = computed(() => format(1));
                  ~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'computed() passes a private method to a standard library call',
    annotatedSource: `
        class Test {
          items = [1, 2, 3];
          private double(value: number): number {
            return value * 2;
          }
          c = computed(() => this.items.map(this.double));
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() calls an overloaded function',
    annotatedSource: `
        function format(value: string): string;
        function format(value: number): string;
        function format(value: string | number): string {
          return String(value);
        }
        const c = computed(() => format(1));
                  ~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() calls a chain of local functions',
    annotatedSource: `
        function f1(): number { return f2(); }
        function f2(): number { return f3(); }
        function f3(): number { return f4(); }
        function f4(): number { return f5(); }
        function f5(): number { return f6(); }
        function f6(): number { return 1; }
        const c = computed(() => f1());
                  ~~~~~~~~~~~~~~~~~~~~
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() calls a private method that is declared after it',
    annotatedSource: `
        class Test {
          c = computed(() => this.label());
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          name = 'x';
          private label(): string {
            return this.name;
          }
        }
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'computed() returns the result of a helper with a declared return type',
    annotatedSource: `
        interface Vm {
          readonly title: string;
        }
        function defaults(): Vm {
          return { title: 'x' };
        }
        class Test {
          title = 'x';
          private buildVm(): Vm {
            return { title: this.title };
          }
          private get vm(): Vm {
            return { title: this.title };
          }
          a = computed(() => this.buildVm());
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          b = computed(() => { return this.buildVm(); });
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
          c = computed(() => this.vm);
              #######################
          d = computed(defaults);
              %%%%%%%%%%%%%%%%%%
        }
      `,
    options: [{ followLocalCalls: true }],
    messages: [
      { char: '~', messageId, data: { primitive: 'computed' } },
      { char: '^', messageId, data: { primitive: 'computed' } },
      { char: '#', messageId, data: { primitive: 'computed' } },
      { char: '%', messageId, data: { primitive: 'computed' } },
    ],
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'effect() calls a helper and discards its result',
    annotatedSource: `
        interface Vm {
          readonly title: string;
        }
        class Test {
          title = 'x';
          private setup(): Vm {
            return { title: this.title };
          }
          private init(): void {
            this.setup();
          }
          a = effect(() => { this.setup(); });
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          b = effect(() => this.init());
              ^^^^^^^^^^^^^^^^^^^^^^^^^
        }
      `,
    options: [{ followLocalCalls: true }],
    messages: [
      { char: '~', messageId, data: { primitive: 'effect' } },
      { char: '^', messageId, data: { primitive: 'effect' } },
    ],
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'computed() passes an argument, or uses a default value, that has exactly the type of the parameter',
    annotatedSource: `
        interface User {
          readonly first: string;
          readonly last: string;
        }
        const GUEST: User = { first: 'Guest', last: '' };
        function fullName(user: User = GUEST): string {
          return user.first + ' ' + user.last;
        }
        class Test {
          user: User = { first: 'Ada', last: 'Lovelace' };
          a = computed(() => fullName(this.user));
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          b = computed(() => fullName());
              ^^^^^^^^^^^^^^^^^^^^^^^^^^
        }
      `,
    options: [{ followLocalCalls: true }],
    messages: [
      { char: '~', messageId, data: { primitive: 'computed' } },
      { char: '^', messageId, data: { primitive: 'computed' } },
    ],
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'computed() calls helpers that take and return arrays, tuples and promises of primitives',
    annotatedSource: `
        class Test {
          names = ['a', 'b'];
          sizes = [1, 2, 3];
          private tags(): string[] {
            const tags = this.names.map((name) => {
              return { text: name.toUpperCase() };
            });
            return tags.map((tag) => tag.text);
          }
          private total(sizes: readonly number[]): number {
            return sizes.reduce((sum, size) => sum + size, 0);
          }
          private bounds(): [number, number] | undefined {
            return this.sizes.length ? [this.sizes[0], this.sizes.length] : undefined;
          }
          private later(): Promise<number> {
            return Promise.resolve(this.sizes.length);
          }
          private log(size: number): void {
            console.log(size);
          }
          a = computed(() => this.tags().join(', '));
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          b = computed(() => this.total(this.sizes));
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
          c = computed(() => this.bounds()?.[0]);
              ##################################
          d = effect(() => { void this.later().then(this.log); });
              %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        }
      `,
    options: [{ followLocalCalls: true }],
    messages: [
      { char: '~', messageId, data: { primitive: 'computed' } },
      { char: '^', messageId, data: { primitive: 'computed' } },
      { char: '#', messageId, data: { primitive: 'computed' } },
      { char: '%', messageId, data: { primitive: 'effect' } },
    ],
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'effect() calls a private method that returns early in a callback',
    annotatedSource: `
        class Test {
          names = ['a', ''];
          private log(name: string): void {
            if (!name) {
              return;
            }
            console.log(name);
          }
          e = effect(() => this.names.forEach((name) => this.log(name)));
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'effect' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'computed() calls private methods that return from two branches and declare no return type',
    annotatedSource: `
        interface User {
          readonly name: string;
        }
        class Test {
          users: User[] = [{ name: 'Ada' }];
          index = 0;
          private selected() {
            if (this.index < 0) {
              return null;
            }
            return this.users[this.index];
          }
          private preferred() {
            if (this.index > 0) {
              return this.users[this.index];
            }
            return this.users[0];
          }
          a = computed(() => this.selected()?.name);
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          b = computed(() => this.preferred().name);
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        }
      `,
    options: [{ followLocalCalls: true }],
    messages: [
      { char: '~', messageId, data: { primitive: 'computed' } },
      { char: '^', messageId, data: { primitive: 'computed' } },
    ],
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'computed() reads a result that has exactly the declared return type',
    annotatedSource: `
        interface Option {
          readonly id: number;
          readonly name: string;
        }
        class Test {
          options: Option[] = [];
          fallback: Option = { id: 0, name: 'None' };
          private selected(): Option | undefined {
            return this.options.find((option) => option.id === 1);
          }
          private get first(): Option {
            return this.fallback;
          }
          a = computed(() => this.selected()?.name);
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          b = computed(() => this.first.name);
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        }
      `,
    options: [{ followLocalCalls: true }],
    messages: [
      { char: '~', messageId, data: { primitive: 'computed' } },
      { char: '^', messageId, data: { primitive: 'computed' } },
    ],
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'computed() and effect() pass on a local function or a private method without calling it',
    annotatedSource: `
        function double(value: number): number {
          return value + value;
        }
        class Test {
          private tick(): void {
            console.log('tick');
          }
          private build(): number {
            return 1;
          }
          a = effect(() => { setTimeout(this.tick, 0); });
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          b = computed(() => [1, 2].map(double));
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
          c = computed(this.build);
              ####################
        }
      `,
    options: [{ followLocalCalls: true }],
    messages: [
      { char: '~', messageId, data: { primitive: 'effect' } },
      { char: '^', messageId, data: { primitive: 'computed' } },
      { char: '#', messageId, data: { primitive: 'computed' } },
    ],
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'computed() reads the result of an overloaded function',
    annotatedSource: `
        function format(value: string): string;
        function format(value: number): string;
        function format(value: string | number): string {
          return String(value);
        }
        const c = computed(() => format(1).length);
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description:
      'computed() checks a private getter for undefined and reads it again',
    annotatedSource: `
        interface User {
          readonly name: string;
        }
        const shout = function (text: string): string {
          return text.toUpperCase();
        };
        class Test {
          saved: User | undefined;
          private get user(): User | undefined {
            return this.saved;
          }
          c = computed(() => (this.user ? shout(this.user.name) : ''));
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `,
    options: [{ followLocalCalls: true }],
    messageId,
    data: { primitive: 'computed' },
  }),
];

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] =
  invalidBase.map((test) => ({
    ...test,
    code: appendTypes(test.code),
  }));

function appendTypes(code: string): string {
  // Exclude the types from the generated docs because they
  // are standard Angular types and only need to be defined
  // so that the type symbols in the tests are correct.
  /* istanbul ignore next */
  if (process.env.GENERATING_RULE_DOCS === '1') {
    return code;
  }

  // Put the given code on the same line as the import so that the tests don't have
  // to adjust the line numbers to account for the code that we insert at the start.
  return (
    'import { afterRenderEffect, computed, effect, InputSignal, linkedSignal, ModelSignal, resource, signal, Signal, untracked } from "@angular/core";' +
    code
  );
}
