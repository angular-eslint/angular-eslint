# angular-eslint

Please see https://github.com/angular-eslint/angular-eslint for full usage instructions and guidance.

This is the core package that exposes most of the other `@angular-eslint/` packages for the common use case of using `angular-eslint` with Angular CLI workspaces.

It exposes all the tooling you need to work with ESLint v9 and `typescript-eslint` v8 with flat config in v18 of `angular-eslint` onwards.

> NOTE: For versions of `angular-eslint` older than v18, or workspaces still using ESLint v8 and `typescript-eslint` v7, or the legacy eslintrc config format, you will use a combination of the `@angular-eslint/` packages directly.

## Premade flat configs (only compatible with eslint.config.js files, not compatible with eslintrc files)

This package exposes a set of premade ESLint configs that you can use in your `eslint.config.js` files. They are not compatible with eslintrc files.

- [Premade flat configs](https://github.com/angular-eslint/angular-eslint/blob/main/packages/angular-eslint/src/configs)

You should access the configs exported from the [`@angular-eslint/eslint-plugin`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/src/configs) package for use in eslintrc files.
