import { convertAnnotatedSourceToFailureCase } from '@angular-eslint/test-utils';
import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import {
  MessageIds,
  Options,
} from '../../../src/rules/no-signal-mutable-updates';

export const valid: readonly (string | ValidTestCase<Options>)[] = [
  // Regular variables - not signals
  `
    let obj = { name: 'test' };
    obj.name = 'newName';
  `,
  `
    let arr = [1, 2, 3];
    arr.push(4);
  `,
  `
    let num = 5;
    num++;
  `,
  // Proper WritableSignal usage with .set()
  `
    let userData: WritableSignal<{ name: string }>;
    userData.set({ name: 'newName' });
  `,
  // Proper WritableSignal usage with .update()
  `
    let userData: WritableSignal<{ name: string }>;
    userData.update(current => ({ ...current, name: 'newName' }));
  `,
  // Proper array signal update with .set()
  `
    let items: WritableSignal<number[]>;
    items.set([...items(), 4]);
  `,
  // Proper array signal update with .update()
  `
    let items: WritableSignal<number[]>;
    items.update(current => [...current, 4]);
  `,
  // Reading signal values is fine
  `
    let userData: Signal<{ name: string }>;
    const name = userData().name;
  `,
  `
    let userData: WritableSignal<{ name: string }>;
    const name = userData().name;
  `,
  // Reading array signal values
  `
    let items: Signal<number[]>;
    const length = items().length;
  `,
  // Non-mutating array methods
  `
    let items: Signal<number[]>;
    const mapped = items().map(x => x * 2);
  `,
  `
    let items: Signal<number[]>;
    const filtered = items().filter(x => x > 0);
  `,
  `
    let items: WritableSignal<number[]>;
    const sliced = items().slice(0, 2);
  `,
  // Proper ModelSignal usage
  `
    let value: ModelSignal<{ name: string }>;
    value.set({ name: 'newName' });
  `,
  `
    let value: ModelSignal<{ name: string }>;
    value.update(current => ({ ...current, name: 'newName' }));
  `,
  // InputSignal - read-only, just reading is fine
  `
    let value: InputSignal<{ name: string }>;
    const name = value().name;
  `,
  // Calling a method that doesn't mutate
  `
    let items: Signal<number[]>;
    const includes = items().includes(5);
  `,
  // Complex but valid updates
  `
    let userData: WritableSignal<{ profile: { name: string } }>;
    userData.update(current => ({
      ...current,
      profile: { ...current.profile, name: 'newName' }
    }));
  `,
  // Store in a variable first (const reference, doesn't break reactivity if used properly)
  // This is valid because we're not mutating currentItems, we're creating a new array
  `
    let items: WritableSignal<number[]>;
    const currentItems = items();
    const newItems = [...currentItems, 4];
    items.set(newItems);
  `,
  // Reading through an intermediate variable is fine
  `
    let items: Signal<number[]>;
    const arr = items();
    const first = arr[0];
  `,
  `
    let items: Signal<number[]>;
    const arr = items();
    const length = arr.length;
  `,
].map(appendTypes);

export const invalid: readonly InvalidTestCase<MessageIds, Options>[] = [
  // Direct property mutation on Signal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'mutating property of read-only Signal',
    annotatedSource: `
      let userData: Signal<{ name: string }>;
      userData().name = 'newName';
      ~~~~~~~~~~~~~~~
    `,
    messageId: 'noMutableSignalUpdate',
  }),

  // Direct property mutation on WritableSignal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'mutating property of WritableSignal',
    annotatedSource: `
      let userData: WritableSignal<{ name: string }>;
      userData().name = 'newName';
      ~~~~~~~~~~~~~~~
    `,
    messageId: 'noMutableWritableSignalUpdate',
  }),

  // Nested property mutation on WritableSignal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'mutating nested property of WritableSignal',
    annotatedSource: `
      let userData: WritableSignal<{ profile: { name: string } }>;
      userData().profile.name = 'newName';
      ~~~~~~~~~~~~~~~~~~~~~~~
    `,
    messageId: 'noMutableWritableSignalUpdate',
  }),

  // Update expression on Signal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'using increment operator on Signal property',
    annotatedSource: `
      let counter: Signal<{ count: number }>;
      counter().count++;
      ~~~~~~~~~~~~~~~
    `,
    messageId: 'noMutableSignalUpdate',
  }),

  // Update expression on WritableSignal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'using increment operator on WritableSignal property',
    annotatedSource: `
      let counter: WritableSignal<{ count: number }>;
      counter().count++;
      ~~~~~~~~~~~~~~~
    `,
    messageId: 'noMutableWritableSignalUpdate',
  }),

  // Pre-increment on WritableSignal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'using pre-increment operator on WritableSignal property',
    annotatedSource: `
      let counter: WritableSignal<{ count: number }>;
      ++counter().count;
        ~~~~~~~~~~~~~~~
    `,
    messageId: 'noMutableWritableSignalUpdate',
  }),

  // Array push on Signal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'calling push on read-only Signal array',
    annotatedSource: `
      let items: Signal<number[]>;
      items().push(4);
      ~~~~~~~~~~~~
    `,
    messageId: 'noMutableSignalUpdate',
  }),

  // Array push on WritableSignal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'calling push on WritableSignal array',
    annotatedSource: `
      let items: WritableSignal<number[]>;
      items().push(4);
      ~~~~~~~~~~~~
    `,
    messageId: 'useSetOrUpdate',
  }),

  // Array pop on WritableSignal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'calling pop on WritableSignal array',
    annotatedSource: `
      let items: WritableSignal<number[]>;
      items().pop();
      ~~~~~~~~~~~
    `,
    messageId: 'useSetOrUpdate',
  }),

  // Array splice on WritableSignal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'calling splice on WritableSignal array',
    annotatedSource: `
      let items: WritableSignal<number[]>;
      items().splice(0, 1);
      ~~~~~~~~~~~~~~
    `,
    messageId: 'useSetOrUpdate',
  }),

  // Array sort on WritableSignal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'calling sort on WritableSignal array',
    annotatedSource: `
      let items: WritableSignal<number[]>;
      items().sort();
      ~~~~~~~~~~~~
    `,
    messageId: 'useSetOrUpdate',
  }),

  // Array reverse on WritableSignal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'calling reverse on WritableSignal array',
    annotatedSource: `
      let items: WritableSignal<number[]>;
      items().reverse();
      ~~~~~~~~~~~~~~~
    `,
    messageId: 'useSetOrUpdate',
  }),

  // Array unshift on WritableSignal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'calling unshift on WritableSignal array',
    annotatedSource: `
      let items: WritableSignal<number[]>;
      items().unshift(0);
      ~~~~~~~~~~~~~~~
    `,
    messageId: 'useSetOrUpdate',
  }),

  // Array shift on WritableSignal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'calling shift on WritableSignal array',
    annotatedSource: `
      let items: WritableSignal<number[]>;
      items().shift();
      ~~~~~~~~~~~~~
    `,
    messageId: 'useSetOrUpdate',
  }),

  // Array fill on WritableSignal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'calling fill on WritableSignal array',
    annotatedSource: `
      let items: WritableSignal<number[]>;
      items().fill(0);
      ~~~~~~~~~~~~
    `,
    messageId: 'useSetOrUpdate',
  }),

  // ModelSignal property mutation
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'mutating property of ModelSignal',
    annotatedSource: `
      let value: ModelSignal<{ name: string }>;
      value().name = 'newName';
      ~~~~~~~~~~~~
    `,
    messageId: 'noMutableWritableSignalUpdate',
  }),

  // ModelSignal array push
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'calling push on ModelSignal array',
    annotatedSource: `
      let items: ModelSignal<number[]>;
      items().push(4);
      ~~~~~~~~~~~~
    `,
    messageId: 'useSetOrUpdate',
  }),

  // InputSignal property mutation (read-only)
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'mutating property of InputSignal',
    annotatedSource: `
      let value: InputSignal<{ name: string }>;
      value().name = 'newName';
      ~~~~~~~~~~~~
    `,
    messageId: 'noMutableSignalUpdate',
  }),

  // Compound assignment on WritableSignal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'using compound assignment on WritableSignal property',
    annotatedSource: `
      let counter: WritableSignal<{ count: number }>;
      counter().count += 5;
      ~~~~~~~~~~~~~~~
    `,
    messageId: 'noMutableWritableSignalUpdate',
  }),

  // Decrement on WritableSignal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'using decrement operator on WritableSignal property',
    annotatedSource: `
      let counter: WritableSignal<{ count: number }>;
      counter().count--;
      ~~~~~~~~~~~~~~~
    `,
    messageId: 'noMutableWritableSignalUpdate',
  }),

  // Member expression in component
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'mutating signal property in component',
    annotatedSource: `
      export class AppComponent {
        readonly userData: WritableSignal<{ name: string }>;

        updateName() {
          this.userData().name = 'newName';
          ~~~~~~~~~~~~~~~~~~~~
        }
      }
    `,
    messageId: 'noMutableWritableSignalUpdate',
  }),

  // Array copyWithin on WritableSignal
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'calling copyWithin on WritableSignal array',
    annotatedSource: `
      let items: WritableSignal<number[]>;
      items().copyWithin(0, 1);
      ~~~~~~~~~~~~~~~~~~
    `,
    messageId: 'useSetOrUpdate',
  }),

  // InputSignalWithTransform mutation
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'mutating property of InputSignalWithTransform',
    annotatedSource: `
      let value: InputSignalWithTransform<{ name: string }, string>;
      value().name = 'newName';
      ~~~~~~~~~~~~
    `,
    messageId: 'noMutableSignalUpdate',
  }),

  // Indirect mutations - storing signal value in variable then mutating
  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'indirect mutation via variable assignment (push)',
    annotatedSource: `
      let items: WritableSignal<number[]>;
      const arr = items();
      arr.push(4);
      ~~~~~~~~
    `,
    messageId: 'useSetOrUpdate',
  }),

  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'indirect mutation via variable assignment (property)',
    annotatedSource: `
      let userData: WritableSignal<{ name: string }>;
      const data = userData();
      data.name = 'newName';
      ~~~~~~~~~
    `,
    messageId: 'noMutableWritableSignalUpdate',
  }),

  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'indirect mutation on read-only Signal',
    annotatedSource: `
      let items: Signal<number[]>;
      const arr = items();
      arr.push(4);
      ~~~~~~~~
    `,
    messageId: 'noMutableSignalUpdate',
  }),

  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'indirect mutation via array index assignment',
    annotatedSource: `
      let items: WritableSignal<number[]>;
      const arr = items();
      arr[0] = 999;
      ~~~~~~
    `,
    messageId: 'noMutableWritableSignalUpdate',
  }),

  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'indirect mutation via update expression',
    annotatedSource: `
      let counter: WritableSignal<{ count: number }>;
      const obj = counter();
      obj.count++;
      ~~~~~~~~~
    `,
    messageId: 'noMutableWritableSignalUpdate',
  }),

  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'indirect mutation via pop',
    annotatedSource: `
      let items: WritableSignal<number[]>;
      const arr = items();
      arr.pop();
      ~~~~~~~
    `,
    messageId: 'useSetOrUpdate',
  }),

  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'indirect mutation via sort',
    annotatedSource: `
      let items: WritableSignal<number[]>;
      const arr = items();
      arr.sort();
      ~~~~~~~~
    `,
    messageId: 'useSetOrUpdate',
  }),

  convertAnnotatedSourceToFailureCase<MessageIds, Options>({
    description: 'indirect mutation on ModelSignal',
    annotatedSource: `
      let items: ModelSignal<number[]>;
      const arr = items();
      arr.push(1);
      ~~~~~~~~
    `,
    messageId: 'useSetOrUpdate',
  }),
].map((test) => ({
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

  /* istanbul ignore next */
  const start = /\S/u.exec(code)?.index ?? 0;
  const prefix = code.slice(0, start);

  return (
    code +
    '\n' +
    [
      'interface Signal<T> { (): T; }',
      'interface InputSignal<T> extends Signal<T> {}',
      'interface ModelSignal<T> extends Signal<T> { set(value: T): void; update(fn: (current: T) => T): void; }',
      'interface InputSignalWithTransform<T, TTransform> extends Signal<T> {}',
      'interface WritableSignal<T> extends Signal<T> { set(value: T): void; update(fn: (current: T) => T): void; }',
      'declare function effect(fn: () => void): void;',
    ]
      .map((x) => prefix + x)
      .join('\n')
  );
}
