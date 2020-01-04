<h1 align="center">Angular ESLint</h1>

<p align="center">Monorepo for all the tooling which enables ESLint to lint Angular projects</p>

<p align="center">
    <a href="https://dev.azure.com/angular-eslint/angular-eslint/_build/latest?definitionId=1&branchName=master"><img src="https://img.shields.io/azure-devops/build/angular-eslint/angular-eslint/1/master.svg?label=%F0%9F%9A%80%20Azure%20Pipelines&style=flat-square" alt="Azure Pipelines"/></a>
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

- [`@angular-eslint/builder`](./packages/builder/) - An Angular CLI Builder which is used to execute ESLint on your Angular projects using standard commands such as `ng lint`</p>

  - This package is also used to power ESLint usage within https://github.com/nrwl/nx workspaces, regardless of which framework is being used.

- [`@angular-eslint/eslint-plugin`](./packages/eslint-plugin) - An ESLint-specific plugin that contains rules which are specific to Angular projects. It can be combined with any other ESLint plugins in the normal way.

- [`@angular-eslint/template-parser`](./packages/template-parser/) - An ESLint-specific parser which leverages the `@angular/compiler` to allow for custom ESLint rules to be written which assert things about your Angular templates.

- [`@angular-eslint/eslint-plugin-template`](./packages/eslint-plugin-template/) - An ESLint-specific plugin which, when used in conjunction with `@angular-eslint/template-parser`, allows for Angular template-specific linting rules to run.

<br>

### Migrating from Codelyzer and TSLint

If you are looking for general help in migrating from TSLint to ESLint, you can check out this project: https://github.com/typescript-eslint/tslint-to-eslint-config

For Angular project's specifically, the migration involves a few different aspects:

1. Replacing the builder the Angular CLI will use when you run `ng lint`

2. Replacing your `tslint.json` files with `.eslintrc.json` files

3. Populating the `.eslintrc.json` files appropriately to match the previous setup you had in the Codelyzer + TSLint world

Soon we will provide an example project and also an `ng add` schematic to handle all of this for you automatically.

If you are interested in creating this, we would be very grateful to receive a PR in the meantime!

### Rules List

Help wanted to document previous Codelyzer rules and progress made so far in this repo!

Please use this as inspiration: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
