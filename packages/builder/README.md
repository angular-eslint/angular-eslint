# @angular-eslint/builder

Please see https://github.com/angular-eslint/angular-eslint for full usage instructions and guidance.

The `@angular-eslint/builder` package is a custom Angular CLI builder that allows you to run ESLint on your Angular CLI projects.

It wraps the ESLint programmatic node API (https://eslint.org/docs/latest/integrate/nodejs-api) to provide a seamless experience via `ng lint` that is closely equivalent to using the `eslint` CLI directly.

## Performance statistics

You can profile rule execution times by enabling ESLint's stats output:

```bash
ng lint --stats
```

This option requires a flat ESLint configuration (`eslint.config.js/ts/mjs`). Using `--stats` with legacy `.eslintrc.*` files will cause an error.
