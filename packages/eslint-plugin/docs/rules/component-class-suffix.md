# Enforces components to have a specified suffix (`component-class-suffix`)

This rule enforces that classes decorated with @Component must have suffix "Component" (or custom) in their name.

## Rule Details

This rule follows the recommendation from the [Angular styleguide](https://angular.io/guide/styleguide#style-02-03).

Examples of **incorrect** code for this rule (with default configuration):

```ts
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
class App {}
```

Example of **correct** code for this rule:

```ts
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
class AppComponent {}
```

## Options

By default, the suffix will be `Component`. You may pass an array of suffixes, for example:

```json
{
  "@angular-eslint/component-class-suffix": [
    "error",
    {
      "suffixes": ["Component", "Comp"]
    }
  ]
}
```

Examples of **incorrect** code with the above options:

```ts
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppCompe {}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class App {}
```

Example of **correct** code with the above options:

```ts
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComp {}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {}
```
