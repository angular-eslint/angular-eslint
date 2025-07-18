<!--

  DO NOT EDIT.

  This markdown file was autogenerated using a mixture of the following files as the source of truth for its data:
  - ../../src/rules/no-developer-preview.ts
  - ../../tests/rules/no-developer-preview/cases.ts

  In order to update this file, it is therefore those files which need to be updated, as well as potentially the generator script:
  - ../../../../tools/scripts/generate-rule-docs.ts

-->

<br>

# `@angular-eslint/no-developer-preview`

Disallow using code which is marked as developer preview

- Type: problem

<br>

## Rationale

Angular's [developer preview APIs](https://angular.dev/reference/releases#developer-preview) are fully functional and polished, but not yet covered by Angular's [breaking change policy](https://angular.dev/reference/releases#breaking-change-policy-and-update-paths). These APIs may change even in patch releases, making them risky for production applications.

<br>

## Rule Options

The rule does not have any configuration options.

<br>

## Usage Examples

> The following examples are generated automatically from the actual unit tests within the plugin, so you can be assured that their behavior is accurate based on the current commit.

<br>

<details>
<summary>❌ - Toggle examples of <strong>incorrect</strong> code for this rule</summary>

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
interface Test {};
const test: Test = {};
            ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
interface Test {};
Partial<Test>;
        ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
interface Test {
  good?: () => void;
  /** @developerPreview */
  bad?: () => void;
};
const test: Test = {};
test.bad();
     ~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
interface Test {
  good?: string;
  /** @developerPreview */
  bad?: string;
};
const test: Test = {};
if (test.good || test.bad) return;
                      ~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
class Test {
  good?: string;
  /** @developerPreview */
  bad?: string;
}
const { good, bad } = new Test();
              ~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
interface Test {
  a: {
    /** @developerPreview */
    b: {
      c: string;
    };
  };
};
const test: Test = { a: { b: { c: '' } } };
test.a.b.c = 'value';
       ~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
class Test {}
const test: Test = {};
            ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
class Test {}

const test = new Test();
                 ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
class Test {
  good?: string;
  /** @developerPreview */
  bad?: string;
}

const test = new Test();
test.good = 'good';
test.bad = 'bad';
     ~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
class Test {
  /** @developerPreview */
  func() {}
}

const test = new Test();
test.func();
     ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
class Test {
  good?: string;
  /** @developerPreview */
  bad?: string;
}
const test = new Test();
if (test.good || test.bad) return;
                      ~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
class Test {
  good() {}
  /** @developerPreview */
  bad() {}
}
const test = new Test();
test.good();
test.bad();
     ~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
const Test = class {};
const test = new Test();
                 ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
type Test = 'a' | 'b';
const test: Test = 'a';
            ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
function test() {}
test();
~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
const test = () => {}
test();
~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
function test(param = '') {}
test();
~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
let test: number = 1;
const result = test++;
               ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
const test = 'test';
const myString = test + '-suffix';
                 ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
const test = [];
for (const value of test) {}
                    ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
const test = true;
const value = test ? 'yes' : 'no';
              ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
const test = 'test';
const another = test;
                ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
const test = 'test';
console.log(test);
            ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
const test = { a: { b: {} } };
test.a.b;
~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
const test = {};
const result = { ...test };
                    ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
const test = [];
const result = [ ...test ];
                    ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
type A = () => {
  /** @developerPreview */
  b: string;
};
declare const a: A;

const { b } = a();
        ~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
const x = 1;

const { y = x } = {};
            ~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
const test = {
  a: '',
  /** @developerPreview */
  b: '',
};
test.b;
     ~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
const test = 'test';
const myString = `${test}-suffix`;
                    ~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
enum Test {
  member = 1,
}
Test.member;
~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
enum Test {
  member1 = 1,
  /** @developerPreview */
  member2 = 2,
}
Test.member1;
Test.member2;
     ~~~~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
/** @developerPreview */
function $localize2(value: TemplateStringsArray) {
  return value;
}
const result = $localize2`Hello World!`;
               ~~~~~~~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
import { developerPreviewFunction } from './dev-preview';

developerPreviewFunction();
~~~~~~~~~~~~~~~~~~~~~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
import { developerPreviewFunction as alias } from './dev-preview';

alias();
~~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
import { DeveloperPreviewClass } from './dev-preview';

const instance = new DeveloperPreviewClass();
                     ~~~~~~~~~~~~~~~~~~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
import { developerPreviewConst } from './dev-preview';

const myConst = developerPreviewConst;
                ~~~~~~~~~~~~~~~~~~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
import { developerPreviewConst } from './dev-preview';

const myConst = { prop: developerPreviewConst };
                        ~~~~~~~~~~~~~~~~~~~~~
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ❌ Invalid Code

```ts
import { SomeInterface } from './dev-preview';

const obj: SomeInterface = {};
const { developerPreviewItem } = obj;
        ~~~~~~~~~~~~~~~~~~~~
```

</details>

<br>

---

<br>

<details>
<summary>✅ - Toggle examples of <strong>correct</strong> code for this rule</summary>

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ✅ Valid Code

```ts
/** Not developerPreview */
interface Test {
  /** @publicApi */
  a1: string;
  /** @developerPreview */
  a2: string;
};
const test: Test = {};
test.a1 = 'value';
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ✅ Valid Code

```ts
/** Not developerPreview */
class Test {
  /** @deprecated */
  a1: string;
  /** @developerPreview */
  a2: string;
}
const test = new Test();
test.a1 = 'value';
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ✅ Valid Code

```ts
/** Not developerPreview */
const test = {};
if (test) return;
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ✅ Valid Code

```ts
/** Not developerPreview */
function test() {}
test();
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ✅ Valid Code

```ts
/** @developerPreview */
declare module "some-module" {}
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ✅ Valid Code

```ts
import { regularFunction, developerPreviewFunction } from './dev-preview';

regularFunction();
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ✅ Valid Code

```ts
import { RegularClass, DeveloperPreviewClass } from './dev-preview';

const instance = new RegularClass();
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ✅ Valid Code

```ts
import { developerPreviewFunction } from './dev-preview';

export { developerPreviewFunction as alias };
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ✅ Valid Code

```ts
export * from './dev-preview';
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ✅ Valid Code

```ts
/** @developerPreview */
declare function test(): void;
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ✅ Valid Code

```ts
/** @developerPreview */
declare const test: () => void;
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ✅ Valid Code

```ts
import { regularConst } from './dev-preview';
const myConst = regularConst;
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ✅ Valid Code

```ts
import { regularConst } from './dev-preview';
const myConst = { prop: regularConst };
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ✅ Valid Code

```ts
import { SomeInterface } from './dev-preview';
const obj: SomeInterface = {};
const { regularItem } = obj;
```

<br>

---

<br>

#### Default Config

```json
{
  "rules": {
    "@angular-eslint/no-developer-preview": [
      "error"
    ]
  }
}
```

<br>

#### ✅ Valid Code

```ts
import { something } from './non-existing';
const myVar = something;
```

</details>

<br>
