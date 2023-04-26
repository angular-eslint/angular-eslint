<p align="center">
  <img alt="angular-eslint-logo" src="https://user-images.githubusercontent.com/900523/101620109-0e5e1f00-3a0c-11eb-8c40-b1d9a8bb3c4c.png" width="128" height="128" />
</p>

<h1 align="center">Angular ESLint</h1>

<p align="center">Monorepo for all the tooling which enables ESLint to lint Angular projects</p>

<p align="center">
    <a href="https://actions-badge.atrox.dev/angular-eslint/angular-eslint/goto?ref=main"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fangular-eslint%2Fangular-eslint%2Fbadge%3Fref%3Dmain&style=flat-square" /></a>
    <a href="https://www.npmjs.com/package/@angular-eslint/eslint-plugin"><img src="https://img.shields.io/npm/v/@angular-eslint/eslint-plugin/latest.svg?style=flat-square" alt="NPM Version" /></a>
    <a href="https://github.com/angular-eslint/angular-eslint/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@angular-eslint/eslint-plugin.svg?style=flat-square" alt="GitHub license" /></a>
    <a href="https://www.npmjs.com/package/@angular-eslint/eslint-plugin"><img src="https://img.shields.io/npm/dm/@angular-eslint/eslint-plugin.svg?style=flat-square" alt="NPM Downloads" /></a>
    <a href="https://codecov.io/gh/angular-eslint/angular-eslint"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/angular-eslint/angular-eslint.svg?style=flat-square"></a>
    <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square" alt="Commitizen friendly" /></a>
</p>

<br>

> **This project is made possible** thanks to the continued hard work going into https://github.com/typescript-eslint/typescript-eslint, and brilliant work on the original TSLint rule implementations in https://github.com/mgechev/codelyzer.

<br>

## Quick Start

1. Follow the latest **Getting Started** guide on https://angular.io/ in order to install the Angular CLI

2. Create a new Angular CLI workspace in the normal way, optionally using any of the supported command line arguments and following the interactive prompts:

```sh
ng new # --maybe --some --other --flags --here
```

3. **Change directory into your new workspace** and then use the Angular CLI to add `@angular-eslint/schematics`.

```sh
ng add @angular-eslint/schematics
```

...and that's it!

As well as installing all relevant dependencies, the `ng add` command will automatically detect that you have a workspace with a single project in it, which does not have a linter configured yet. It can therefore go ahead and wire everything up for you!

You will also see that it added the following in your angular.json:

```json
  "cli": {
    "schematicCollections": ["@angular-eslint/schematics"]
  }
```

Read the section on [Using ESLint by default when generating new Projects within your Workspace](#using-eslint-by-default-when-generating-new-projects-within-your-workspace) to understand why this is useful.

<br>

## Supported Angular CLI Versions

As of v12, we aligned the major version of `@angular-eslint` with Angular (and Angular CLI).

Therefore, as an example (because these versions may or may not exist yet when you read this):

- `@angular-eslint` packages at `12.x.x` and `@angular/cli@12.x.x` are compatible
- `@angular-eslint` packages at `13.x.x` and `@angular/cli@13.x.x` are compatible
- `@angular-eslint` packages at `14.x.x` and `@angular/cli@14.x.x` are compatible
- ...and so on...

> NOTE: the exact minor and patch versions of each library represented here by `x`'s do not need to match each other, just the first (major) number

For an understanding of Angular CLI version support prior to v12, please see [./docs/ANGULAR_VERSION_SUPPORT.md](./docs/ANGULAR_VERSION_SUPPORT.md)

**Please do not open issues related to unsupported versions of the Angular CLI**.

<br>

## Supported ESLint Versions

See the specified peerDependency in any of our packages, such as the `eslint-plugin`: https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/package.json

<br>

## Usage with Nx Monorepos

Nx leans on some, _but not all_ of the packages from this project.

Specifically:

- It does not use the builder to execute ESLint
- It does not use the schematics to generate files and config, and is responsible for configuring ESLint via `.eslintrc.json` files in a way that makes sense for Nx workspaces.

**We strongly recommend that you do not try and hand-craft setups with angular-eslint and Nx**. It is easy to get things wrong.

- **If using Angular CLI**, use the angular-eslint tooling as instructed below
- **If using Nx**, defer to the Nx tooling itself to configure things for you, it has been designed and tested specifically for this purpose.

Issues specific to Nx's support of Angular + ESLint should be filed on the Nx repo: https://github.com/nrwl/nx

<br>

## Packages included in this project

Please follow the links below for the packages you care about.

- [`@angular-eslint/builder`](./packages/builder/) - An Angular CLI Builder which is used to execute ESLint on your Angular projects using standard commands such as `ng lint`

- [`@angular-eslint/eslint-plugin`](./packages/eslint-plugin) - An ESLint-specific plugin that contains rules which are specific to Angular projects. It can be combined with any other ESLint plugins in the normal way.

- [`@angular-eslint/eslint-plugin-template`](./packages/eslint-plugin-template/) - An ESLint-specific plugin which, when used in conjunction with `@angular-eslint/template-parser`, allows for Angular template-specific linting rules to run.

- [`@angular-eslint/schematics`](./packages/schematics/) - Schematics which are used to add and update configuration files which are relevant for running ESLint on an Angular workspace.

- [`@angular-eslint/template-parser`](./packages/template-parser/) - An ESLint-specific parser which leverages the `@angular/compiler` to allow for custom ESLint rules to be written which assert things about your Angular templates.

- [`@angular-eslint/utils`](./packages/utils/) - Utilities which are helpful when writing and testing custom ESLint rules for Angular workspaces.

<br>

## Package Versions

All of the packages are published with the same version number to make it easier to coordinate both releases and installations.

We publish a canary release on every successful merge to main, so **you never need to wait for a new stable version to make use of any updates**.

The latest version under the `latest` tag is:

<a href="https://www.npmjs.com/package/@angular-eslint/schematics"><img src="https://img.shields.io/npm/v/@angular-eslint/schematics/latest.svg?style=flat-square" alt="NPM Version" /></a>

The latest version under the `canary` tag **(latest commit to main)** is:

<a href="https://www.npmjs.com/package/@angular-eslint/schematics"><img src="https://img.shields.io/npm/v/@angular-eslint/schematics/canary.svg?style=flat-square" alt="NPM Version" /></a>

(Note: The only exception to the automated publishes described above is when we are in the final phases of creating the next major version of the libraries - e.g. going from `1.x.x` to `2.x.x`. During these periods, we manually publish `canary` releases until we are happy with the release and promote it to `latest`.)

<br>

## Philosophy on lint rules which enforce code formatting concerns

Please see here for our philosophy on using a linter to enforce code formatting concerns: [./docs/FORMATTING_RULES.md](./docs/FORMATTING_RULES.md)

TL;DR - We will not be maintaining code formatting rules in this project, but you are very welcome to create them yourself using our tooling.

<br>

## Adding ESLint configuration to an existing Angular CLI project which _has no existing linter_

**NOTE: If you are looking for instructions on how to migrate a project which uses TSLint, please see the next section.**

If you want to add ESLint configuration (a `.eslintrc.json` file and an applicable `"lint"` target in your `angular.json`) to an existing Angular CLI project which does not yet have a linter set up, you can invoke the following schematic:

```sh
ng g @angular-eslint/schematics:add-eslint-to-project {{YOUR_PROJECT_NAME_GOES_HERE}}
```

> If you only have a single project in your Angular CLI workspace, the project name argument is optional

<br>

## Migrating an Angular CLI project from Codelyzer and TSLint

Please see here for the legacy information around converting from Codelyzer and TSLint prior to version 16: [./docs/MIGRATING_FROM_TSLINT.md](./docs/MIGRATING_FROM_TSLINT.md)

<br>

## Using ESLint by default when generating new Projects within your Workspace

Regardless of whether or not you added `@angular-eslint` to a brand new workspace, or you added it in order to convert a project within an existing workspace, it is likely that _from now on_ you want any subsequent projects that you generate in your workspace to also use ESLint.

In order to achieve this, `@angular-eslint` provides a set of custom generator schematics which sit on top of the default ones that the Angular CLI provides. They provide all the standard Angular CLI options, but just handle adding ESLint related configuration for you in each case.

You can always invoke them directly by specifying the collection name as part of the generate command:

```sh
# To generate a new Angular app in the workspace using ESLint
ng g @angular-eslint/schematics:application
# To generate a new Angular library in the workspace using ESLint
ng g @angular-eslint/schematics:library
```

Or, alternatively, if you don't want to have to remember to set that collection prefix in front of the `:` every time, you can set the `schematicCollections` in your `angular.json` to start with `@angular-eslint/schematics`.

You can either do that by hand by adjusting the JSON, or by running the following Angular CLI command:

```sh
ng config cli.schematicCollections "[\"@angular-eslint/schematics\"]"
```

The final result in your `angular.json` will be something like this:

```json
  "cli": {
    "schematicCollections": ["@angular-eslint/schematics"]
  }
```

Now your generate commands can just be:

```sh
# To generate a new Angular app in the workspace using ESLint (thanks to the schematicCollections set above)
ng g app
# To generate a new Angular library in the workspace using ESLint (thanks to the schematicCollections set above)
ng g lib
```

<br>

## Notes on Supported ESLint Configuration File Types

**We strongly recommend you stick to using `.eslintrc.json`.**

This is not a constraint we force upon you, and you are more than welcome to use any of ESLint's supported file types for your ESLint config files, e.g. `.eslintrc.js`, `.eslintrc.yml` **however** please note that you will not receive any automated updates to your config from this toolset if you choose to use something other than `.eslintrc.json`. We will also only generate `.eslintrc.json` files from our code generators (which you could then convert yourself if you wanted to).

The reason for this is very simple - JSON is a format which is very easy to statically analyze and write transformations for and it is beyond the scope of this community-run project to provide multiple implementations of every possible migration for every possible ESLint configuration file type for every version we release.

<br>

## Notes on ESLint Configuration Itself

It's important to understand up front that **using Angular with ESLint is actually an advanced/complex use-case** because of the nature of the files involved:

- Angular projects use **TypeScript files** for source code
- Angular projects use a **custom/extended form of HTML** for templates (be they inline or external HTML files)

The thing is: **ESLint understands neither of these things out of the box.**

Fortunately, however, ESLint has clearly defined points of extensibility that we can leverage to make this all work.

> For detailed information about ESLint plugins, parsers etc please review the official ESLint documentation: https://eslint.org

**The key principle of our configuration required for Angular projects is that we need to run different blocks of configuration for different file types/extensions**. In other words, we don't want the same rules to apply on TypeScript files that we do on HTML/inline-templates.

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
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
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

## Premade configs provided by this project

We have several premade configs within this project which you can extend from (and indeed the configs generated by our schematics do just that). For more information about the configs, check out their READMEs

- Source code: https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/src/configs/README.md
- Templates: https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/src/configs/README.md

## Going fully manual (not recommended)

Our premade configs handle the `parser` and `plugins` options for you behind the scenes so that your final config can be more concise.

If for some reason you wanted to not include any of the premade recommended configs, or you wanted to significantly customize your setup, a fully manual example with the right parsers and plugins wired up (but no actual rules activated) would look like this:

```jsonc
{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "parser": "@typescript-eslint/parser",
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

Our schematics already do the "right" thing for you automatically in this regard, but if you have to configure things manually for whatever reason, **please always use the file based overrides as shown in all the examples above**.

<br>

## Notes for `eslint-plugin-prettier` users

Prettier is an awesome code formatter which can be used entirely independently of linting.

Some folks, however, like to apply prettier by using it inside of ESLint, using `eslint-plugin-prettier`. If this applies to you then you will want to read this section on how to apply it correctly for HTML templates. Make sure you read and fully understand the information above on the importance of `"overrides"` before reading this section.

If you choose to use `eslint-plugin-prettier`, **please ensure that you are using version 4.1.0 or later**, and apply the following configuration to ESLint and prettier:

**.prettierrc**

```json
{
  "overrides": [
    {
      "files": "*.html",
      "options": {
        "parser": "angular"
      }
    }
  ]
}
```

**.eslintrc.json**

```jsonc
{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates",
        "plugin:prettier/recommended" // <--- here we inherit from the recommended setup from eslint-plugin-prettier for TS
      ],
      "rules": {}
    },
    {
      "files": ["*.html"],
      "extends": [
        "plugin:@angular-eslint/template/recommended",
        "plugin:prettier/recommended" // <--- here we inherit from the recommended setup from eslint-plugin-prettier for HTML
      ],
      "rules": {}
    }
  ]
}
```

With this setup, you have covered the following scenarios:

- ESLint + prettier together work on Components with external templates (and all other source TS files)
- ESLint + prettier together work on the external template HTML files themselves
- ESLint + prettier together work on Components with inline templates

<br>

## Linting HTML files and inline-templates with the VSCode extension for ESLint

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

## Usage without Angular CLI Builder

If you're using this without the Angular CLI Builder don't forget to include `.html` as one of the file extensions when running the eslint CLI, otherwise templates will not be linted, e.g.:

```
eslint --ext .ts,.html .
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

As of v15, we generate the fastest possible lint config for you out of the box (rather than the most _flexible_ lint config), but it is possible that you will need to leverage rules which require type information, and this requires extra consideration.

Please read this dedicated guide to fully understand lint performance and how it is impacted by rules requiring type information: [./docs/RULES_REQUIRING_TYPE_INFORMATION.md](./docs/RULES_REQUIRING_TYPE_INFORMATION.md)

<br>

## Using `eslint-disable` comments in Angular templates

If you want to be able to use `eslint-disable` comments in your Angular templates you just need to ensure you are using:

- `@angular` CLI tooling packages version `11.2.8` or higher
- `@angular-eslint` tooling packages version `2.1.0` or higher

Make sure you are using valid HTML comments, i.e. `<!-- this syntax -->`, not the kind of comments you use in TypeScript code.
