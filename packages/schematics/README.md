# @angular-eslint/schematics

Please see https://github.com/angular-eslint/angular-eslint for full usage instructions and guidance.

The `@angular-eslint/schematics` package is a set of custom Angular CLI Schematics which are used to add and update dependencies and configuration files which are relevant for running ESLint on an Angular workspace.

## Options

### `--skip-install`

Skips installing npm packages when running `ng add @angular-eslint/schematics`. This can be useful when the schematic is executed as part of a larger workflow that handles dependency installation separately.

```
ng add @angular-eslint/schematics --skip-install
```
