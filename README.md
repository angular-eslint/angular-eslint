<p align="center">
  <img alt="angular-eslint-logo" src="https://user-images.githubusercontent.com/900523/101620109-0e5e1f00-3a0c-11eb-8c40-b1d9a8bb3c4c.png" width="128" height="128" />
</p>

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

## Supported Angular CLI Versions

We support Angular CLI `10.1.0` and onwards, including Angular CLI `11.x`. This range is also captured by our integration-tests package.

### Why Angular `10.1.0`?

Angular `10.1.0` is significant because at version `10.0.0` the Angular Team switched to using project references and a `tsconfig.base.json` at the root of the project. This ultimately was deemed to be unsuccessful and in `10.1.0` they switched back to the original `tsconfig.json` without project references. Because angular-eslint and typescript-eslint care about your underlying TypeScript config, it is important that you are on the updated version which does _not_ use project references.

The schematic will error if you try and run it when you still have a `tsconfig.base.json`.

As usual, the Angular Team provided an automatic migration for these changes as part of `ng update`, so for most people this change wasn't an issue. If you updated manually (which is highly discouraged), then it is possible you did not apply this critical change and will therefore run into the error with the schematic.

We recommend going back an running the automated migrations from `ng update`, or fixing things up manually as a last resort.

**Please do not open issues related to unsupported versions of the Angular CLI**.

<br>

## Usage with Nx Monorepos

Nx leans on some, _but not all_ of the packages from this project.

Specifically:

- It does not use the builder to execute ESLint
- It does not use the schematics to generate files and config, and is responsible for configuring ESLint via `.eslintrc.json` files in a way that makes sense for Nx workspaces.

**We strongly recommend that you do not try and hand-craft setups with angular-eslint and Nx**. It is easy to gets things wrong.

- **If using Angular CLI**, use the angular-eslint tooling as instructed below
- **If using Nx**, defer to the Nx tooling itself to configure things for you, it has been designed and tested specifically for this purpose.

Issues specific to Nx's support of Angular + ESLint should be filed on the Nx repo: https://github.com/nrwl/nx

<br>

## Packages included in this project

Please follow the links below for the packages you care about.

- [`@angular-eslint/builder`](./packages/builder/) - An Angular CLI Builder which is used to execute ESLint on your Angular projects using standard commands such as `ng lint`

- [`@angular-eslint/eslint-plugin`](./packages/eslint-plugin) - An ESLint-specific plugin that contains rules which are specific to Angular projects. It can be combined with any other ESLint plugins in the normal way.

- [`@angular-eslint/template-parser`](./packages/template-parser/) - An ESLint-specific parser which leverages the `@angular/compiler` to allow for custom ESLint rules to be written which assert things about your Angular templates.

- [`@angular-eslint/eslint-plugin-template`](./packages/eslint-plugin-template/) - An ESLint-specific plugin which, when used in conjunction with `@angular-eslint/template-parser`, allows for Angular template-specific linting rules to run.

- [`@angular-eslint/schematics`](./packages/schematics/) - Schematics which are used to add and update configuration files which are relevant for running ESLint on an Angular workspace.

<br>

## Migrating an Angular CLI project from Codelyzer and TSLint

We have some tooling to make this as automated as possible, but the reality is it will always be somewhat project-specific as to how much work will be involved in the migration.

### Step 1 - Add relevant dependencies

The first step is to run the schematic to add `@angular-eslint` to your project:

```sh
ng add @angular-eslint/schematics
```

This will handle installing the latest version of all the relevant packages for you and adding them to the `devDependencies` of your `package.json`.

### Step 2 - Run the `convert-tslint-to-eslint` schematic on a project

The next thing to do is consider which "project" you want to migrate to use ESLint. If you have a single application in your workspace you will likely have just a single entry in the `projects` configuration object within your `angular.json` file. If you have a `projects/` directory in your workspace, you will have multiple entries in your `projects` configuration and you will need to chose which one you want to migrate using the `convert-tslint-to-eslint` schematic.

You can run it like so:

```sh
ng g @angular-eslint/schematics:convert-tslint-to-eslint {{YOUR_PROJECT_NAME_GOES_HERE}}
```

The schematic will do the following for you:

- Read your chosen project's `tslint.json` and use it to CREATE a `.eslintrc.json` at the root of the specific project which extends from the root config (if you do not already have a root config, it will also add one automatically for you).
  - The contents of this `.eslintrc.json` will be the closest possible equivalent to your `tslint.json` that the tooling can figure out.
  - You will want to pay close attention to the terminal output of the schematic as it runs, because it will let you know if it couldn't find an appropriate converter for a TSLint rule, or if it has installed any additional ESLint plugins to help you match up your new setup with your old one.
- UPDATE the project's `architect` configuration in the `angular.json` to such that the `lint` "target" will invoke ESLint instead of TSLint.
- UPDATE any instances of `tslint:disable` comments that are located within your TypeScript source files to their ESLint equivalent.

Now when you run:

```sh
npx ng lint {{YOUR_PROJECT_NAME_GOES_HERE}}
```

...you are running ESLint on your project! 🎉

### Step 3 - Remove root TSLint configuration and use only ESLint

Once you are happy with your ESLint setup, you simply need to remove the root-level `tslint.json` and potentially uninstall TSLint and any TSLint-related plugins/dependencies if your Angular CLI workspace is now no longer using TSLint at all.

<br>

## Notes on ESLint Configuration

It's important to understand up front that **using Angular with ESLint is actually an advanced/complex use-case** because of the nature of the files involved:

- Angular projects use **TypeScript files** for source code
- Angular projects use a **custom/extended form of HTML** for templates (be they inline or external HTML files)

The thing is: **ESLint understands neither of these things out of the box.**

Fortunately, however, ESLint has clearly defined points of extensibility that we can leverage to make this all work.

> For detailed information about ESLint plugins, parsers etc please review the official ESLint documentation: https://eslint.org

**The key principal of our configuration required for Angular projects is that we need to run different blocks of configuration for different file types/extensions**. In other words, we don't want the same rules to apply on TypeScript files that we do on HTML/inline-templates.

Therefore, the critical part of our configuration is the `"overrides"` array:

```cjson
{
  "overrides": [
    /**
     * -----------------------------------------------------
     * TYPESCRIPT FILES (COMPONENTS, SERVICES ETC) (.ts)
     * -----------------------------------------------------
     */
    {
      "files": ["*.ts"],

      // ... applies a special processor to extract inline Component templates
      // and treat them like HTML files
      "extends": ["plugin:@angular-eslint/template/process-inline-templates"]

      // ... other config specific to TypeScript files
    },

    /**
     * -----------------------------------------------------
     * COMPONENT TEMPLATES
     * -----------------------------------------------------
     */
    {
      "files": ["*.html"],
      // ... config specific to Angular Component templates
    }
  ]
}
```

By setting up our config in this way, we have complete control over what rules etc apply to what file types and our separate concerns remain clearer and easier to maintain.

### Seriously, move (mostly) all configuration into `overrides`

Even though you may be more familiar with including ESLint rules, plugins etc at the top level of your config object, we strongly recommend only really having `overrides` (and a couple of other things like `ignorePatterns`, `root` etc) at the top level and including all plugins, rules etc within the relevant block in the overrides array.

Anything you apply at the top level will apply to ALL files, and as we've said above there is a really strict separation of concerns between source code and templates in Angular projects, so it is very rare that things apply to all files.

Let's take a look at full (but minimal), manual example of a config file (**although we recommend deferring to the schematics for automatic config generation whenever possible**):

**.eslintrc.json**

```jsonc
{
  "root": true,
  "overrides": [
    {
      "files": ["*.ts"],
      "parserOptions": {
        "project": [
          "tsconfig.app.json",
          "tsconfig.spec.json",
          "e2e/tsconfig.json"
        ],
        "createDefaultProgram": true
      },
      "extends": [
        "plugin:@angular-eslint/recommended",
        // This is required if you use inline templates in Components
        "plugin:@angular-eslint/template/process-inline-templates"
      ],
      "rules": {
        /**
         * Any TypeScript source code (NOT TEMPLATE) related rules you wish to use/reconfigure over and above the
         * recommended set provided by the @angular-eslint project would go here.
         */
        "@angular-eslint/directive-selector": [
          "error",
          { "type": "attribute", "prefix": "app", "style": "camelCase" }
        ],
        "@angular-eslint/component-selector": [
          "error",
          { "type": "element", "prefix": "app", "style": "kebab-case" }
        ]
      }
    },
    {
      "files": ["*.html"],
      "extends": ["plugin:@angular-eslint/template/recommended"],
      "rules": {
        /**
         * Any template/HTML related rules you wish to use/reconfigure over and above the
         * recommended set provided by the @angular-eslint project would go here.
         */
      }
    }
  ]
}
```

> If I wanted to include other source code related rules extends etc, such as extending from `eslint:recommended`, then I would include that in the `"extends": []` within the `*.ts` override block, NOT the root of the config object.

Our schematics already do the "right" thing for you automatically in this regard, but if you have to configure things manually for whatever reason, **a full reference configuration example** can be found in the manual integration test located within this monorepo. Check out the relevant configuration files:

- [packages/integration-tests/fixtures/v1014-multi-project-manual-config/.eslintrc.json](./packages/integration-tests/fixtures/v1014-multi-project-manual-config/.eslintrc.json)
- [packages/integration-tests/fixtures/v1014-multi-project-manual-config/angular.json](./packages/integration-tests/fixtures/v1014-multi-project-manual-config/angular.json)

If you are looking for general help in migrating specific rules from TSLint to ESLint, you can check out this incredible project that we depend on in our conversion schematic: https://github.com/typescript-eslint/tslint-to-eslint-config

## Premade configs provided by this project

We have several premade configs within this project which you can extend from (and indeed the configs generated by our schematics do just that). For more information about the configs, check out their READMEs

- Source code: https://github.com/angular-eslint/angular-eslint/blob/master/packages/eslint-plugin/src/configs/README.md
- Templates: https://github.com/angular-eslint/angular-eslint/blob/master/packages/eslint-plugin-template/src/configs/README.md

## Going fully manual (not recommended)

Our premade configs handle the `parser` and `plugins` options for you behind the scenes so that your final config can be more concise.

If for some reason you wanted to not include any of the premade recommended configs, or you wanted to significantly customize your setup, a fully manual example with the right parsers and plugins wired up (but no actual rules activated) would look like this:

```jsonc
{
  "root": true,
  "overrides": [
    {
      "files": ["*.ts"],
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        "ecmaVersion": 2020,
        "sourceType": "module",
        "project": [
          "tsconfig.app.json",
          "tsconfig.spec.json",
          "e2e/tsconfig.json"
        ],
        "createDefaultProgram": true
      },
      "plugins": ["@typescript-eslint", "@angular-eslint"],
      "rules": {}
    },
    {
      "files": ["*.html"],
      "parser": "@angular-eslint/template-parser",
      "plugins": ["@angular-eslint/template"],
      "rules": {}
    }
  ]
}
```

<br>

### Linting HTML files and inline-templates with the VSCode extension for ESLint

If you use vscode-eslint, and want to lint HTML files and inline-templates on your Angular Components, you will need to make sure you add the following to your VSCode `settings.json`:

```jsonc
// ... more config

"eslint.options": {
  "extensions": [".ts", ".html"]
},

// ... more config

"eslint.validate": [
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact",
  "html"
],

// ... more config
```

Please see the following issue for more information: https://github.com/microsoft/vscode-eslint/issues/922

<br>

### Usage without Angular CLI Builder

If you're using this without the Angular CLI Builder don't forget to include `.html` as one of the file extensions when running the eslint CLI, otherwise templates will not be linted, e.g.:

```
eslint --ext .ts,.html
```

<br>

## Notes on performance

### Background and understanding the trade-offs

As you have hopefully understood from the above section on ESLint configuration what we are dealing with here is a set of tools that were _not_ designed and optimized for this specific use-case.

In software development we are permanently faced with trade-offs. In this case you can think about it this way:

On the one hand...

> By using ESLint with Angular (both its TypeScript source code, and its HTML templates), we gain access to a truly massive ecosystem of existing rules, plugins and IDE extensions that we can instantly leverage on our projects.

On the other...

> The tooling will never be as fast or memory efficient, or as easy to configure, as something which was purpose built for a narrower use-case and which, well, does less...

TSLint was more in the latter camp - it was purpose built for linting TypeScript source code (note, _not_ HTML), and so it was (depending on the codebase) faster and more efficient at doing it - but it was hugely lacking in community support, features, plugins, rules etc...

Ok, so now we know which side of this particular trade-off we are on. That's an important start.

### ESLint configs and performance

Given the increased complexity around configuration, it is possible to end up with non-performant setups if we are not careful.

The first thing is to understand that if you are majorly deviating from the configs that this tooling generates for you automatically, you are greatly increasing the risk of you running into those issues.

The most important piece of ESLint configuration with regards to performance is the `parserOptions.project` option.

It is what informs `typescript-eslint` what tsconfigs should be used to create TypeScript `Program`s behind the scenes as the lint process runs. Without this, it would not be possible to leverage rules which take advantage of type information, we could only lint based on raw syntax.

If `parserOptions.project` has been configured, by default `typescript-eslint` will take this as a sign that you only want to lint files that are captured within the scope of the TypeScript `Program`s which are created. For example, let's say you have a `tsconfig.json` that contains the following:

```jsonc
{
  // ...more config
  "include" [
    "src/**/*.ts"
  ]
}
```

If you provide that file as a reference for `typescript-eslint`, it will conclude that you only want to lint `.ts` files within `src/`. If you attempt to lint a file outside of this pattern, it will error. Seems reasonable, right?

Unfortunately, for us in the context of the Angular CLI, we have an added complication. The Angular CLI generates one or more files which are not included in _any_ tsconfig scopes (such as `environment.prod.ts`).

To prevent this causing errors for users, we therefore enable the `createDefaultProgram` option for `typescript-eslint` when we generate your config (it's `false` by default). This flag tells `typescript-eslint` not to error in the case in finds a file not in a `Program`, and instead create a whole new Program to encapsulate that file and then carry on.

This is not ideal, but it works. However, can you see what we've now exposed ourselves to by enabling this?

Now if we run linting - _any_ files which are included in the lint run (e.g. by the glob patterns in the builder config in `angular.json`) will be linted, and if they are not in scope of an existing tsconfig a whole new Program will be created for each one of them.

Having patterns which do not makes sense together (files to lint vs provided tsconfigs) is usually how seriously non-performant setups can originate from your config. For small projects creating Programs takes a matter of seconds, for large projects, it can take far longer (depending on the circumstances).

Here are some steps you can take if you're linting process feels "unreasonably" slow:

- Run the process with debug information from `typescript-eslint` enabled:

```sh
DEBUG=typescript-eslint:* ng lint
```

You will now see a ton of logs which were not visible before. The two most common issues to look out for are:

- If you see a lot of logs saying that particular files are not being found in existing `Program`s (the scenario we described above) and default `Program`s have to be created
- If you see files included for a project that should not be

If you are still having problems after you have done some digging into these, feel free to open and issue to discuss it further, providing as much context as possible (including the logs from the command above).

<br>

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
| [`template-accessibility-tabindex-no-positive`] | :white_check_mark: |
| [`template-accessibility-table-scope`]          |                    |
| [`template-accessibility-valid-aria`]           |                    |
| [`template-banana-in-box`]                      | :white_check_mark: |
| [`template-click-events-have-key-events`]       |                    |
| [`template-mouse-events-have-key-events`]       |                    |
| [`template-no-any`]                             |                    |
| [`template-no-autofocus`]                       | :white_check_mark: |
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
| [`template-i18n`]                     | :white_check_mark: |
| [`template-no-call-expression`]       | :white_check_mark: |
| [`template-use-track-by-function`]    | :white_check_mark: |
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
| [`pipe-prefix`]                  | :white_check_mark: |
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

<!-- end rule list -->
