<p align="center">
  <img src="https://raw.githubusercontent.com/mgechev/codelyzer/master/assets/logo.png" alt="" width="200">
</p>

# Angular ESLint

:warning: Not yet ready for use _yet_. Any help greatly appreciated!

A set of [ESLint](https://github.com/eslint/eslint) rules for static code analysis of Angular TypeScript projects.

You can run the static code analyzer over web apps, NativeScript, Ionic, etc.

## Changelog

You can find it [here](https://github.com/angular-eslint/angular-eslint/blob/master/CHANGELOG.md).

## Recommended configuration

The recommended configuration is based on the [Angular Style Guide](https://angular.io/styleguide).


## Disable a rule that validates Template or Styles

Lint rules can be disabled by adding a marker in TypeScript files. More information [here](https://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments).

To disable rules that validate templates or styles you'd need to add a marker in the TypeScript file referencing them.

```ts
import { Component } from '@angular/core';

/* eslint-disable template-use-track-by-function */
@Component({
  selector: 'codelyzer',
  templateUrl: './codelyzer.component.html'
})
class Codelyzer {}
```

## License

MIT
