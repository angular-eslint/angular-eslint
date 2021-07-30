# Enforces a maximum number of lines in inline declarations (`component-max-inline-declarations`)

This rule enforces a maximum number of lines in inline template, styles and animations.

## Rule Details

This rule follows the recommendation from the [Angular styleguide](https://angular.io/guide/styleguide#style-05-04).

Example of **incorrect** code for this rule (with default configuration):

```ts
@Component({
  template: `
    <div>first line</div>
    <div>second line</div>
    <div>third line</div>
    <div>fourth line</div>
  `,
})
class Test {}
```

Example of **correct** code for this rule:

```ts
@Component({
  template: '<div>just one line template</div>',
  styles: ['div { display: none; }'],
  animations: [state('void', style({ opacity: 0, transform: 'scale(1, 0)' }))],
})
class Test {}
```

## Options

By default, the maximum number of lines for template will be `3`, styles will be `3` and animations `15`. You may pass positive values for each, for example:

```json
{
  "@angular-eslint/component-max-inline-declarations": [
    "error",
    {
      "template": 5,
      "styles": 5,
      "animations": 5
    }
  ]
}
```

Examples of **incorrect** code with the above options:

```ts
@Component({
  template: `
    <div>first line</div>
    <div>second line</div>
    <div>third line</div>
    <div>fourth line</div>
    <div>fifth line</div>
    <div>sixth line</div>
  `,
})
class Test {}
```

Example of **correct** code with the above options:

```ts
@Component({
  template: `
    <div>first line</div>
    <div>second line</div>
    <div>third line</div>
    <div>fourth line</div>
  `,
})
class Test {}
```
