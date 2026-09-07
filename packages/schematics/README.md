# @angular-eslint/schematics

Please see https://github.com/angular-eslint/angular-eslint for full usage instructions and guidance.

The `@angular-eslint/schematics` package is a set of custom Angular CLI Schematics which are used to add and update dependencies and configuration files which are relevant for running ESLint on an Angular workspace.

## Options

### `--skip-install`

Skips installing npm packages when running `ng add @angular-eslint/schematics`. This can be useful when the schematic is executed as part of a larger workflow that handles dependency installation separately.

```
ng add @angular-eslint/schematics --skip-install
```

### `--tseslint-preset`

Chooses which typescript-eslint shared config the generated `eslint.config.js` extends. Defaults to `recommended`.

Allowed values:

- `recommended` — `tseslint.configs.recommended` + `tseslint.configs.stylistic` (default)
- `strict` — `tseslint.configs.strict` + `tseslint.configs.stylistic`
- `recommendedTypeChecked` — `tseslint.configs.recommendedTypeChecked` + `tseslint.configs.stylisticTypeChecked`, and enables `parserOptions.projectService`
- `strictTypeChecked` — `tseslint.configs.strictTypeChecked` + `tseslint.configs.stylisticTypeChecked`, and enables `parserOptions.projectService`

Type-checked presets make linting more powerful but slower. See [RULES_REQUIRING_TYPE_INFORMATION.md](../../docs/RULES_REQUIRING_TYPE_INFORMATION.md).

```
ng add @angular-eslint/schematics --tseslint-preset=strictTypeChecked
```

The same option is accepted by `add-eslint-to-project`, `application`, and `library`. It is applied when the root ESLint config is created.

### `--set-parser-options-project`

Enables `parserOptions.projectService` in the generated ESLint config so that rules requiring type information can run, without changing the typescript-eslint preset. Type-checked `tseslintPreset` values imply this option.

```
ng add @angular-eslint/schematics --set-parser-options-project
```
