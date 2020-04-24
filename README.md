<h1 align="center">Angular ESLint</h1>

<p align="center">Monorepo for all the tooling which enables ESLint to lint Angular projects</p>

<p align="center">
    <a href="https://actions-badge.atrox.dev/angular-eslint/angular-eslint/goto?ref=master"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fangular-eslint%2Fangular-eslint%2Fbadge%3Fref%3Dmaster&style=flat-square" /></a>
    <a href="https://www.npmjs.com/package/@angular-eslint/builder"><img src="https://img.shields.io/npm/v/@angular-eslint/builder/latest.svg?style=flat-square" alt="NPM Version" /></a>
    <a href="https://github.com/angular-eslint/angular-eslint/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@angular-eslint/builder.svg?style=flat-square" alt="GitHub license" /></a>
    <a href="https://www.npmjs.com/package/@angular-eslint/builder"><img src="https://img.shields.io/npm/dm/@angular-eslint/builder.svg?style=flat-square" alt="NPM Downloads" /></a>
    <a href="https://codecov.io/gh/angular-eslint/angular-eslint"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/angular-eslint/angular-eslint.svg?style=flat-square"></a>
    <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square" alt="Commitizen friendly" /></a>
</p>

<br>

> **This project is made possible** thanks to the continued hard work going into https://github.com/typescript-eslint/typescript-eslint, and brilliant work on the original TSLint rule implementations in https://github.com/mgechev/codelyzer.

Feel free to begin playing with the tooling in your own projects and submit PRs with missing rules and bug fixes.

We would also be very grateful for documentation PRs!

<br>

## Packages included in this project

Please follow the links below for the packages you care about.

- [`@angular-eslint/builder`](./packages/builder/) - An Angular CLI Builder which is used to execute ESLint on your Angular projects using standard commands such as `ng lint`

- [`@angular-eslint/eslint-plugin`](./packages/eslint-plugin) - An ESLint-specific plugin that contains rules which are specific to Angular projects. It can be combined with any other ESLint plugins in the normal way.

- [`@angular-eslint/template-parser`](./packages/template-parser/) - An ESLint-specific parser which leverages the `@angular/compiler` to allow for custom ESLint rules to be written which assert things about your Angular templates.

- [`@angular-eslint/eslint-plugin-template`](./packages/eslint-plugin-template/) - An ESLint-specific plugin which, when used in conjunction with `@angular-eslint/template-parser`, allows for Angular template-specific linting rules to run.

<br>

### Linting inline-templates with the VSCode extension for ESLint

If you use vscode-eslint, and inline-templates on your Angular Components, you will need to make sure you add the following to your VSCode settings:

```json
// ... more config

"eslint.options": {
  "extensions": [".ts", ".html"]
}

// ... more config
```

Please see the following issue for more information: https://github.com/microsoft/vscode-eslint/issues/922

<br>

### Migrating from Codelyzer and TSLint

We have some work in progress tooling to make this as automated as possible, but the reality is it will always be somewhat project-specific as to how much work will be involved in the migration.

The first step is to run the schematic to add `@angular-eslint` to your project:

```sh
ng add @angular-eslint/schematics
```

This will handle installing the latest version of all the relevant packages for you and adding them to the `devDependencies` of your `package.json`.

**Soon this ng-add schematic will also handle applying some of the following steps for you automatically**.

The migration involves a few different aspects:

1. Replacing the builder the Angular CLI will use when you run `ng lint`

2. Replacing your `tslint.json` files with `.eslintrc.json` files

3. Populating the `.eslintrc.json` files appropriately to match the previous setup you had in the Codelyzer + TSLint world

**The best reference configurations for performing your own migration** are located within the Angular CLI integration test within this monorepo. Check out the relevant configuration files:

- [packages/integration-tests/fixtures/angular-cli-workspace/.eslintrc.js](./packages/integration-tests/fixtures/angular-cli-workspace/.eslintrc.js)
- [packages/integration-tests/fixtures/angular-cli-workspace/angular.json](./packages/integration-tests/fixtures/angular-cli-workspace/angular.json)

If you are looking for general help in migrating from TSLint to ESLint, you can check out this project: https://github.com/typescript-eslint/tslint-to-eslint-config

### Rules List

<!-- begin rule list -->

|                                   |
| --------------------------------- |
| :white_check_mark: = done         |
| :construction: = work in progress |

#### Functionality

| Codelyzer rule                                  |       Status       |
| ----------------------------------------------- | :----------------: |
| [`contextual-decorator`]                        |                    |
| [`contextual-lifecycle`]                        | :white_check_mark: |
| [`no-attribute-decorator`]                      | :white_check_mark: |
| [`no-lifecycle-call`]                           | :white_check_mark: |
| [`no-output-native`]                            | :white_check_mark: |
| [`no-pipe-impure`]                              | :white_check_mark: |
| [`prefer-on-push-component-change-detection`]   | :white_check_mark: |
| [`template-accessibility-alt-text`]             |                    |
| [`template-accessibility-elements-content`]     |                    |
| [`template-accessibility-label-for`]            |                    |
| [`template-accessibility-tabindex-no-positive`] |                    |
| [`template-accessibility-table-scope`]          |                    |
| [`template-accessibility-valid-aria`]           |                    |
| [`template-banana-in-box`]                      | :white_check_mark: |
| [`template-click-events-have-key-events`]       |                    |
| [`template-mouse-events-have-key-events`]       |                    |
| [`template-no-any`]                             |                    |
| [`template-no-autofocus`]                       |                    |
| [`template-no-distracting-elements`]            |                    |
| [`template-no-negated-async`]                   | :white_check_mark: |
| [`use-injectable-provided-in`]                  | :white_check_mark: |
| [`use-lifecycle-interface`]                     | :white_check_mark: |

#### Maintainability

| Codelyzer rule                        |       Status       |
| ------------------------------------- | :----------------: |
| [`component-max-inline-declarations`] | :white_check_mark: |
| [`no-conflicting-lifecycle`]          | :white_check_mark: |
| [`no-forward-ref`]                    | :white_check_mark: |
| [`no-input-prefix`]                   | :white_check_mark: |
| [`no-input-rename`]                   | :white_check_mark: |
| [`no-output-on-prefix`]               | :white_check_mark: |
| [`no-output-rename`]                  | :white_check_mark: |
| [`no-unused-css`]                     |                    |
| [`prefer-output-readonly`]            | :white_check_mark: |
| [`relative-url-prefix`]               | :white_check_mark: |
| [`template-conditional-complexity`]   |                    |
| [`template-cyclomatic-complexity`]    | :white_check_mark: |
| [`template-i18n`]                     |                    |
| [`template-no-call-expression`]       | :white_check_mark: |
| [`template-use-track-by-function`]    |                    |
| [`use-component-selector`]            | :white_check_mark: |
| [`use-component-view-encapsulation`]  | :white_check_mark: |
| [`use-pipe-decorator`]                | :white_check_mark: |
| [`use-pipe-transform-interface`]      | :white_check_mark: |

#### Style

| Codelyzer rule                   |       Status       |
| -------------------------------- | :----------------: |
| [`angular-whitespace`]           |                    |
| [`component-class-suffix`]       | :white_check_mark: |
| [`component-selector`]           | :white_check_mark: |
| [`directive-class-suffix`]       | :white_check_mark: |
| [`directive-selector`]           | :white_check_mark: |
| [`import-destructuring-spacing`] |                    |
| [`no-host-metadata-property`]    | :white_check_mark: |
| [`no-inputs-metadata-property`]  | :white_check_mark: |
| [`no-outputs-metadata-property`] | :white_check_mark: |
| [`no-queries-metadata-property`] | :white_check_mark: |
| [`pipe-prefix`]                  |                    |
| [`prefer-inline-decorator`]      |                    |

<!-- Codelyzer Links -->

[`angular-whitespace`]: https://codelyzer.com/rules/angular-whitespace
[`component-class-suffix`]: https://codelyzer.com/rules/component-class-suffix
[`component-max-inline-declarations`]: https://codelyzer.com/rules/component-max-inline-declarations
[`component-selector`]: https://codelyzer.com/rules/component-selector
[`contextual-decorator`]: https://codelyzer.com/rules/contextual-decorator
[`contextual-lifecycle`]: https://codelyzer.com/rules/contextual-lifecycle
[`directive-class-suffix`]: https://codelyzer.com/rules/directive-class-suffix
[`directive-selector`]: https://codelyzer.com/rules/directive-selector
[`import-destructuring-spacing`]: https://codelyzer.com/rules/import-destructuring-spacing
[`no-attribute-decorator`]: https://codelyzer.com/rules/no-attribute-decorator
[`no-conflicting-lifecycle`]: https://codelyzer.com/rules/no-conflicting-lifecycle
[`no-forward-ref`]: https://codelyzer.com/rules/no-forward-ref
[`no-host-metadata-property`]: https://codelyzer.com/rules/no-host-metadata-property
[`no-input-prefix`]: https://codelyzer.com/rules/no-input-prefix
[`no-input-rename`]: https://codelyzer.com/rules/no-input-rename
[`no-inputs-metadata-property`]: https://codelyzer.com/rules/no-inputs-metadata-property
[`no-lifecycle-call`]: https://codelyzer.com/rules/no-lifecycle-call
[`no-output-native`]: https://codelyzer.com/rules/no-output-native
[`no-output-on-prefix`]: https://codelyzer.com/rules/no-output-on-prefix
[`no-output-rename`]: https://codelyzer.com/rules/no-output-rename
[`no-outputs-metadata-property`]: https://codelyzer.com/rules/no-outputs-metadata-property
[`no-pipe-impure`]: https://codelyzer.com/rules/no-pipe-impure
[`no-queries-metadata-property`]: https://codelyzer.com/rules/no-queries-metadata-property
[`no-unused-css`]: https://codelyzer.com/rules/no-unused-css
[`pipe-prefix`]: https://codelyzer.com/rules/pipe-prefix
[`prefer-inline-decorator`]: https://codelyzer.com/rules/prefer-inline-decorator
[`prefer-on-push-component-change-detection`]: https://codelyzer.com/rules/prefer-on-push-component-change-detection
[`prefer-output-readonly`]: https://codelyzer.com/rules/prefer-output-readonly
[`relative-url-prefix`]: https://codelyzer.com/rules/relative-url-prefix
[`template-accessibility-alt-text`]: https://codelyzer.com/rules/template-accessibility-alt-text
[`template-accessibility-elements-content`]: https://codelyzer.com/rules/template-accessibility-elements-content
[`template-accessibility-label-for`]: https://codelyzer.com/rules/template-accessibility-label-for
[`template-accessibility-tabindex-no-positive`]: https://codelyzer.com/rules/template-accessibility-tabindex-no-positive
[`template-accessibility-table-scope`]: https://codelyzer.com/rules/template-accessibility-table-scope
[`template-accessibility-valid-aria`]: https://codelyzer.com/rules/template-accessibility-valid-aria
[`template-banana-in-box`]: https://codelyzer.com/rules/template-banana-in-box
[`template-click-events-have-key-events`]: https://codelyzer.com/rules/template-click-events-have-key-events
[`template-conditional-complexity`]: https://codelyzer.com/rules/template-conditional-complexity
[`template-cyclomatic-complexity`]: https://codelyzer.com/rules/template-cyclomatic-complexity
[`template-i18n`]: https://codelyzer.com/rules/template-i18n
[`template-mouse-events-have-key-events`]: https://codelyzer.com/rules/template-mouse-events-have-key-events
[`template-no-any`]: https://codelyzer.com/rules/template-no-any
[`template-no-autofocus`]: https://codelyzer.com/rules/template-no-autofocus
[`template-no-call-expression`]: https://codelyzer.com/rules/template-no-call-expression
[`template-no-distracting-elements`]: https://codelyzer.com/rules/template-no-distracting-elements
[`template-no-negated-async`]: https://codelyzer.com/rules/template-no-negated-async
[`template-use-track-by-function`]: https://codelyzer.com/rules/template-use-track-by-function
[`use-component-selector`]: https://codelyzer.com/rules/use-component-selector
[`use-component-view-encapsulation`]: https://codelyzer.com/rules/use-component-view-encapsulation
[`use-injectable-provided-in`]: https://codelyzer.com/rules/use-injectable-provided-in
[`use-lifecycle-interface`]: https://codelyzer.com/rules/use-lifecycle-interface
[`use-pipe-decorator`]: https://codelyzer.com/rules/use-pipe-decorator
[`use-pipe-transform-interface`]: https://codelyzer.com/rules/use-pipe-transform-interface

<!-- PR Links -->

[`pr72`]: https://api.github.com/repos/angular-eslint/angular-eslint/pulls/72

<!-- end rule list -->
