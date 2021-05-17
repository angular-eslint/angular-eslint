# Requires `===` and `!==` in place of `==` and `!=` (eqeqeq)

It is considered good practice to use the type-safe equality operators `===` and `!==` instead of their regular counterparts `==` and `!=`.

The reason for this is that `==` and `!=` do type coercion which follows the rather obscure [Abstract Equality Comparison Algorithm](https://www.ecma-international.org/ecma-262/5.1/#sec-11.9.3).
For instance, the following statements are all considered `true`:

- `[] == false`
- `[] == ![]`
- `3 == "03"`

If one of those occurs in an innocent-looking statement such as `a == b` the actual problem is very difficult to spot.

## Rule Details

This rule is aimed at eliminating the type-unsafe equality operators.

Examples of **incorrect** code for this rule:

```html
<div *ngIf="x == 42"></div>
<div [class.test]="'' == text"></div>
<div>{{ item == undefined }}</div>
```

The `--fix` option on the command line automatically fixes some problems reported by this rule. A problem is only fixed if one of the operands is a non numeric `string`.

## Options

### allowNullOrUndefined

The `"allowNullOrUndefined"` option ignores null or undefined comparisons.

Examples of **incorrect** code for the `"allowNullOrUndefined"` option:

```html
<div *appShow="a == b"></div>
<div [style.width.%]="foo == true ? 90 : 15"></div>
<div>{{ bananas != 1 }}</div>
<div *ngIf="foo == 'undefined'"></div>
<div [ngClass]="'hello' !== 'world'"></div>
```

Examples of **correct** code for the `"allowNullOrUndefined"` option:

```html
<div *appShow="a === b"></div>
<div [style.width.%]="foo === true ? 90 : 15"></div>
<div>{{ bananas !== 1 }}</div>
<div *ngIf="foo === 'undefined'"></div>
<div [ngClass]="'hello' !== 'world'"></div>
<div>{{ value == undefined }}</div>
<div>{{foo === null}}</div>
```

## When Not To Use It

If you don't want to enforce a style for using equality operators, then it's safe to disable this rule.
