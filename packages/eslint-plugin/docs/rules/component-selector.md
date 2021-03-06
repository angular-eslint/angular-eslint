# Enforces conventions for component selectors (`component-selector`)

This rule enforces conventions for component selectors such as prefixes, style (_kebab-case_ or _camelCase_) and the use of element selectors as opposed to attribute or class selectors.

## Rule Details

For details in the Angular styleguide see: [prefixes](https://angular.io/guide/styleguide#style-02-07), [style](https://angular.io/guide/styleguide#style-05-02) and [element selectors](https://angular.io/guide/styleguide#style-05-03).

This rule has **NO** default options.

## Options

The schema for the options of this rule is:

```ts
interface Options {
  type: 'attribute' | 'element' | Array<'attribute' | 'element'>;
  prefix: string | Array<string>;
  style: 'camelCase' | 'kebab-case' | Array<'camelCase' | 'kebab-case'>;
}
```

The Angular styleguide recommends setting `type` to `element` and `style` to `kebab-case`, as well as setting at least a prefix.

## Examples

In the examples below, we will use the following configuration:

```json
"rules": {
  "@angular-eslint/component-selector": [
    "warn",
    {
      "type": "element",
      "style": "kebab-case",
      "prefix": ["app", "toh"]
    }
  ]
}
```

Examples of **incorrect** code:

```ts
@Component({
  selector: '[app-root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {}

@Component({
  selector: 'root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {}

@Component({
  selector: 'appRoot',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {}

@Component({
  selector: 'not-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {}
```

Examples of **correct** code:

```ts
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {}

@Component({
  selector: 'toh-heroes',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {}
```
