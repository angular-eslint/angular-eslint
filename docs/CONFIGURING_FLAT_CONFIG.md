# Configuring `angular-eslint` for use in ESLint's default flat config format

In version 9 of ESLint, they changed their default configuration format to the so called "flat config" style using exclusively a `eslint.config.js` file as the only way of configuring a project: https://eslint.org/blog/2024/04/eslint-v9.0.0-released/

**If you are still using ESLint v8, or continuing to use the eslintrc config format, do not use this guide, you should reference these docs instead: [CONFIGURING_ESLINTRC.md](./CONFIGURING_ESLINTRC.md).**

If you are using ESLint v9 or later with flat config, then the following guidance is for you.

It should be used in conjunction with the official ESLint documentation on eslintrc, which can be found here: https://eslint.org/docs/latest/use/configure/

---

<br>

## Notes on ESLint Configuration

These days with flat config, ESLint has first class support for different types of files being configured differently (different rules and parsers). We can leverage this for Angular projects, because they:

- use **TypeScript files** for source code
- use a **custom/extended form of HTML** for templates (be they inline or external HTML files)

The thing is: **ESLint understands neither of these things out of the box.**

Fortunately, however, ESLint has clearly defined points of extensibility that we can leverage to make this all work.

> For detailed information about ESLint plugins, parsers etc please review the official ESLint eslintrc config documentation: https://eslint.org/docs/latest/use/configure/

**The key principle of our configuration required for Angular projects is that we need to run different blocks of configuration for different file types/extensions**. In other words, we don't want the same rules to apply on TypeScript files that we do on HTML/inline-templates.

Therefore, our flat config will contain two entries, one for TS, one for HTML. We could provide these two entries directly in an exported array, but `typescript-eslint` provides and awesome typed utility function which makes writing our flat configs a lot nicer, so we will instead require the function and pass in multiple objects for our configuration.

**Workspace root level eslint.config.js**

```js
// @ts-check

// Allows us to bring in the recommended core rules from eslint itself
const eslint = require('@eslint/js');

// Allows us to use the typed utility for our config, and to bring in the recommended rules for TypeScript projects from typescript-eslint
const tseslint = require('typescript-eslint');

// Allows us to bring in the recommended rules for Angular projects from angular-eslint
const angular = require('angular-eslint');

// Export our config array, which is composed together thanks to the typed utility function from typescript-eslint
module.exports = tseslint.config(
  {
    // Everything in this config object targets our TypeScript files (Components, Directives, Pipes etc)
    files: ['**/*.ts'],
    extends: [
      // Apply the recommended core rules
      eslint.configs.recommended,
      // Apply the recommended TypeScript rules
      ...tseslint.configs.recommended,
      // Optionally apply stylistic rules from typescript-eslint that improve code consistency
      ...tseslint.configs.stylistic,
      // Apply the recommended Angular rules
      ...angular.configs.tsRecommended,
    ],
    // Set the custom processor which will allow us to have our inline Component templates extracted
    // and treated as if they are HTML files (and therefore have the .html config below applied to them)
    processor: angular.processInlineTemplates,
    // Override specific rules for TypeScript files (these will take priority over the extended configs above)
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    // Everything in this config object targets our HTML files (external templates,
    // and inline templates as long as we have the `processor` set on our TypeScript config above)
    files: ['**/*.html'],
    extends: [
      // Apply the recommended Angular template rules
      ...angular.configs.templateRecommended,
      // Apply the Angular template rules which focus on accessibility of our apps
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
);
```

If you decided to add one or more additional projects to your workspace, the schematics will automatically generate a project level `eslint.config.js` file for you. This will extend from the root level config and allow you to override or add additional rules specific to that project.

**Project level eslint.config.js**

```js
// @ts-check

// Allows us to use the typed utility for our config
const tseslint = require('typescript-eslint');

// Require our workspace root level config and extend from it
const rootConfig = require('../../eslint.config.js');

module.exports = tseslint.config(
  // Apply the root config first
  ...rootConfig,
  {
    // Any project level overrides or additional rules for TypeScript files can go here
    // (we don't need to extend from any typescript-eslint or angular-eslint configs because
    // we already applied the rootConfig above which has them)
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'lib', // different to our root config, which was "app"
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'lib', // different to our root config, which was "app"
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    // Any project level overrides or additional rules for HTML files can go here
    // (we don't need to extend from any angular-eslint configs because
    // we already applied the rootConfig above which has them)
    files: ['**/*.html'],
    rules: {},
  },
);
```

By setting up our config in this way, we have complete control over what rules etc apply to what file types and our separate concerns remain clearer and easier to maintain. The schematics provided by angular-eslint will already configure your project in this way.

## Premade configs provided by this project

We have several premade configs within this project which you can extend from (and indeed the configs generated by our schematics do just that). For more information about the configs, check out the README here:

https://github.com/angular-eslint/angular-eslint/blob/main/packages/angular-eslint/src/configs/README.md
