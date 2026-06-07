# Rules requiring type information

ESLint is a powerful linter by itself, able to work on the syntax of your source files and assert things based on the rules you configure. It gets even more powerful, however, when the TypeScript type-checker is layered on top of it when analyzing TypeScript files, which is something that `typescript-eslint` allows us to do.

Some rules (from `typescript-eslint`, and a handful from `angular-eslint`) require this type information in order to run. Creating the necessary TypeScript `Program` behind the scenes so that the type-checker is available is relatively expensive compared to pure syntax analysis, so by default `angular-eslint` sets up your config with performance in mind and does _not_ enable typed linting. You opt in only when you need a rule that requires type information.

## Enabling typed linting with the Project Service

With flat config, the simplest and most performant way to enable typed linting is the `typescript-eslint` **Project Service**. You enable it by setting `languageOptions.parserOptions.projectService` to `true` in the config block that targets your TypeScript files. The Project Service figures out the right `tsconfig.json` for each file automatically, so there is no need to hand-maintain a list of `parserOptions.project` paths.

For background, see the official `typescript-eslint` guide on typed linting: https://typescript-eslint.io/getting-started/typed-linting

### EXAMPLE 1: Root/Single App Project

Let's take an example of an ESLint config that angular-eslint might generate for you out of the box for a single app workspace/the root project in a multi-project workspace:

```js {% fileName="eslint.config.js" %}
// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
);
```

Here we have not enabled the Project Service, which is appropriate because we are not leveraging any rules which require type information.

If we now come in and add a rule which does require type information, for example `@typescript-eslint/await-thenable`, and run `ng lint`, we will get an error explaining that the rule requires type information but the parser has not been configured to provide it.

The solution is to enable the Project Service in the TypeScript config block:

<!-- prettier-ignore -->
```js {% fileName="eslint.config.js" %}
// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    // Enable the typescript-eslint Project Service so that rules requiring
    // type information can create the type-checker behind the scenes.
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      // This rule requires the TypeScript type checker to be present when it runs
      '@typescript-eslint/await-thenable': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
);
```

And that's it! Now any rules requiring type information will run correctly when we run `ng lint`.

### EXAMPLE 2: Library Project (in `projects/` for example)

For additional projects in a workspace, the schematics generate a project level `eslint.config.js` which extends the root config. You enable typed linting in exactly the same way — by adding the Project Service to the project's TypeScript config block:

<!-- prettier-ignore -->
```js {% fileName="projects/my-library/eslint.config.js" %}
// @ts-check
const tseslint = require('typescript-eslint');
const rootConfig = require('../../eslint.config.js');

module.exports = tseslint.config(
  ...rootConfig,
  {
    files: ['**/*.ts'],
    // Enable the typescript-eslint Project Service for this project's source
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'lib', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'lib', style: 'kebab-case' },
      ],
      // This rule requires the TypeScript type checker to be present when it runs
      '@typescript-eslint/await-thenable': 'error',
    },
  },
  {
    files: ['**/*.html'],
    rules: {},
  },
);
```

And that's it! Now any rules requiring type information will run correctly when we run `ng lint my-library`.

## Generating new projects with typed linting configured automatically

If your workspace is already leveraging rules requiring type information and you want any newly generated projects to be set up for typed linting automatically, you can add the `--set-parser-options-project` flag when generating the new application or library. This causes the generated `eslint.config.js` to include the Project Service:

```sh
ng g @angular-eslint/schematics:application {PROJECT_NAME_HERE} --set-parser-options-project

ng g @angular-eslint/schematics:library {PROJECT_NAME_HERE} --set-parser-options-project
```

If you don't want to have to remember to pass `--set-parser-options-project` each time, then you can set it to true by default in your schematic defaults in your `angular.json` file:

<!-- prettier-ignore -->
```jsonc
{
  // ... more angular.json config here ...

  "schematics": {
    "@angular-eslint/schematics:application": {
      "setParserOptionsProject": true
    },
    "@angular-eslint/schematics:library": {
      "setParserOptionsProject": true
    }
  }
}
```

## Typed linting and performance

Enabling type information makes linting more powerful, but it also makes it more expensive, because the TypeScript type-checker has to be created and your files have to be type-checked as part of the lint run. A few things to keep in mind:

- **Prefer the Project Service.** It is the approach the schematics generate and the one `typescript-eslint` recommends. It automatically associates each linted file with the correct `tsconfig.json`, which avoids the most common class of misconfiguration that used to cause slow or broken setups.
- **Only enable typed linting where you need it.** If a project does not use any rules that require type information, leave the Project Service off for that project so its lint run stays as fast as possible.
- **Keep your `tsconfig.json` files focused.** The Project Service lints files in the scope of your project's TypeScript configuration. Patterns that pull large numbers of unrelated files into the type-checker are the usual cause of "unreasonably" slow lint runs.

If your linting feels unreasonably slow, you can run it with `typescript-eslint`'s debug output enabled to see exactly which files and `tsconfig.json` files are being loaded:

```sh
DEBUG=typescript-eslint:* ng lint
```

This logs verbosely as the lint run executes. The two most common issues to look out for are:

- files being pulled into the type-checker that you did not expect to be linted, and
- a single lint run loading far more of your codebase into the type-checker than the project actually needs.

If you are still having problems after digging into these, feel free to open an issue to discuss it further, providing as much context as possible (including the logs from the command above).
