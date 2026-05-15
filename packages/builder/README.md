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

## Bulk suppressions

ESLint introduced bulk suppressions in v9.24. This allows you to enable new lint rules without having to fix every existing violation first. For details, see https://eslint.org/docs/latest/use/suppressions. In ESLint v10.1 a subset of the suppressions functionality was added to the Node.js API (https://eslint.org/blog/2026/03/eslint-v10.1.0-released/#api-support-for-bulk-suppressions).

You can now apply suppressions that were previously generated with the ESLint CLI. You can also set the location of the suppressions file that should be used. Currently it is not possible to create new suppressions or prune suppressions via the Node.js API (https://eslint.org/docs/latest/use/suppressions#usage-with-the-nodejs-api). This has to be done by using the ESLint CLI.

To apply suppressions you have to either use the CLI flag

```bash
ng lint --apply-suppressions --suppressions-location="/path/to/eslint-suppressions.json"
```

or add the option in `angular.json`:

```json
...
        "lint": {
          "builder": "@angular-eslint/builder:lint",
          "options": {
            "applySuppressions": true,
            "suppressionsLocation": "/path/to/eslint-suppressions.json"
          }
        }
...
```

The `suppressionsLocation` defaults to `{workspaceRoot}/eslint-suppressions.json`.

While setting `suppressionsLocation` without `applySuppressions` is allowed (because it could be used with `--suppress-all` in the future), it currently does nothing.
