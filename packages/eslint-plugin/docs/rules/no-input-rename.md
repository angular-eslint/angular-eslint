# Enforces directive input alias name (`no-input-rename`)

This rule enforces the name for directive input alias with the property name, disallows renaming directive inputs by providing a string to the decorator.

## Rule Details

For details in the Angular styleguide see: [input](https://angular.io/styleguide#style-05-13).

This rule has **NO** default options.

## Options

The schema for the options of this rule is:

```ts
interface Options {
  // A list with allowed input names
  readonly allowedNames?: readonly string[];
}
```

## Examples

In the examples below, we will use the following configuration:

```json
"rules": {
  "@angular-eslint/no-input-rename": [
    "warn",
    {
      "allowedNames": ["name"]
    }
  ]
}
```

Examples of **incorrect** code:

```ts
import { Input } from '@angular/core';
@Component({
  selector: 'foo',
})
class TestComponent {
  @Input('bar') label: string;
}

import { Input } from '@angular/core';
@Component({
  selector: 'foo',
})
class TestComponent {
  @Input('bar') set label(label: string) {}
}

import { Input } from '@angular/core';
@Component({
  selector: 'foo',
})
class TestComponent {
  @Input('foo') label: string;
}
```

Examples of **correct** code:

```ts
import { Input } from '@angular/core';
@Component
class TestComponent {
  @Input() label: string;
}

import { Input } from '@angular/core';
@Directive({
  selector: '[foo]',
})
class TestDirective {
  @Input('foo') bar = new EventEmitter<void>();
}

import { Input } from '@angular/core';
@Directive({
  selector: '[foo], label2',
})
class TestDirective {
  @Input() foo: string;
}

import { Input } from '@angular/core';
@Directive({
  selector: 'foo',
})
class TestDirective {
  @Input('aria-label') ariaLabel: string;
}
```
