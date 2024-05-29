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

## Contents

- [Quick Start](#quick-start)
- [Supported Angular CLI Versions](#supported-angular-cli-versions)
- [Supported ESLint Versions](#supported-eslint-versions)
- [Packages included in this project](#packages-included-in-this-project)
- [Package Versions](#package-versions)
- [Adding ESLint configuration to an existing Angular CLI project which _has no existing linter_](#adding-eslint-configuration-to-an-existing-angular-cli-project-which-has-no-existing-linter)
- [Using ESLint by default when generating new Projects within your Workspace](#using-eslint-by-default-when-generating-new-projects-within-your-workspace)
- [Configuring ESLint](#configuring-eslint)
- [Philosophy on lint rules which enforce code formatting concerns](#philosophy-on-lint-rules-which-enforce-code-formatting-concerns)
- [Linting with the VSCode extension for ESLint](#linting-with-the-vscode-extension-for-eslint)
- [Usage without Angular CLI Builder and eslintrc style configs](#usage-without-angular-cli-builder-and-eslintrc-style-configs)
- [Notes on performance](#notes-on-performance)
- [Using `eslint-disable` comments in Angular templates](#using-eslint-disable-comments-in-angular-templates)
- [Migrating an Angular CLI project from Codelyzer and TSLint](#migrating-an-angular-cli-project-from-codelyzer-and-tslint)

<br>

## Quick Start

1. Follow the [**local environment and workspace setup guide**](https://angular.dev/tools/cli/setup-local) in order to install the Angular CLI

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

- `@angular-eslint` packages at `16.x.x` and `@angular/cli@16.x.x` are compatible
- `@angular-eslint` packages at `17.x.x` and `@angular/cli@17.x.x` are compatible
- `@angular-eslint` packages at `18.x.x` and `@angular/cli@18.x.x` are compatible
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
- It does not use the schematics to generate files and config, and is responsible for configuring ESLint via `.eslintrc.json` or `eslint.config.js` files in a way that makes sense for Nx workspaces.

**We strongly recommend that you do not try and hand-craft setups with angular-eslint and Nx**. It is easy to get things wrong.

- **If using Angular CLI**, use the angular-eslint tooling as instructed below
- **If using Nx**, defer to the Nx tooling itself to configure things for you, it has been designed and tested specifically for this purpose.

Issues specific to Nx's support of Angular + ESLint should be filed on the Nx repo: https://github.com/nrwl/nx

<br>

## Packages included in this project

Please follow the links below for the packages you care about.

- [`angular-eslint`](./packages/angular-eslint/README.md) - This is the core package that exposes most of the other packages below for the common use case of using `angular-eslint` with Angular CLI workspaces. It exposes all the tooling you need to work with ESLint v9 and `typescript-eslint` v8 with flat config in v18 of `angular-eslint` onwards. For versions of `angular-eslint` older than v18, or workspaces still using ESLint v8 and `typescript-eslint` v7 or the legacy eslintrc config format, you will use a combination of the packages below directly.

- [`@angular-eslint/builder`](./packages/builder/README.md) - An Angular CLI Builder which is used to execute ESLint on your Angular projects using standard commands such as `ng lint`

- [`@angular-eslint/eslint-plugin`](./packages/eslint-plugin/README.md) - An ESLint-specific plugin that contains rules which are specific to Angular projects. It can be combined with any other ESLint plugins in the normal way.

- [`@angular-eslint/eslint-plugin-template`](./packages/eslint-plugin-template/README.md) - An ESLint-specific plugin which, when used in conjunction with `@angular-eslint/template-parser`, allows for Angular template-specific linting rules to run.

- [`@angular-eslint/schematics`](./packages/schematics/README.md) - Schematics which are used to add and update configuration files which are relevant for running ESLint on an Angular workspace.

- [`@angular-eslint/template-parser`](./packages/template-parser/README.md) - An ESLint-specific parser which leverages the `@angular/compiler` to allow for custom ESLint rules to be written which assert things about your Angular templates.

- [`@angular-eslint/test-utils`](./packages/test-utils/README.md) - Utilities which are helpful when testing custom ESLint rules for Angular workspaces.

- [`@angular-eslint/utils`](./packages/utils/README.md) - Utilities which are helpful when writing custom ESLint rules for Angular workspaces.

<br>

## Package Versions

All of the packages are published with the same version number to make it easier to coordinate both releases and installations.

We publish a canary release on every successful merge to the `main` branch, so **you never need to wait for a new stable version to make use of any updates**.

The latest version under the `latest` tag is:

<a href="https://www.npmjs.com/package/@angular-eslint/schematics"><img src="https://img.shields.io/npm/v/@angular-eslint/schematics/latest.svg?style=flat-square" alt="NPM Version" /></a>

The latest version under the `canary` tag **(latest commit to the `main` branch)** is:

<a href="https://www.npmjs.com/package/@angular-eslint/schematics"><img src="https://img.shields.io/npm/v/@angular-eslint/schematics/canary.svg?style=flat-square" alt="NPM Version" /></a>

(Note: The only exception to the automated publishes described above is when we are in the final phases of creating the next major version of the libraries - e.g. going from `1.x.x` to `2.x.x`. During these periods, we manually publish pre-releases until we are happy with it and promote it to `latest`.)

<br>

## Adding ESLint configuration to an existing Angular CLI project which _has no existing linter_

**NOTE: If you are looking for instructions on how to migrate a project which uses TSLint, please see the bottom of the README.**

If you want to add ESLint configuration (either a `eslint.config.js` file for flat config, or a `.eslintrc.json` file for eslintrc (`angular-eslint` will figure this out for you automatically) and an applicable `"lint"` target in your `angular.json`) to an existing Angular CLI project which does not yet have a linter set up, you can invoke the following schematic:

```sh
ng g @angular-eslint/schematics:add-eslint-to-project {{YOUR_PROJECT_NAME_GOES_HERE}}
```

> If you only have a single project in your Angular CLI workspace, the project name argument is optional

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

<b>

## Configuring ESLint

In version 9 of ESLint, they changed their default configuration format to the so called "flat config" style using exclusively a `eslint.config.js` file as the only way of configuring a project: https://eslint.org/blog/2024/04/eslint-v9.0.0-released/

The legacy so called "eslintrc" style is now deprecated, but still fully supported, and so when it comes to configuring ESLint for your Angular projects you have two options and associated guides:

- flat configs (the default in ESLint v9, strongly recommended for new projects): [./docs/CONFIGURING_FLAT_CONFIG.md](./docs/CONFIGURING_FLAT_CONFIG.md)
- eslintrc style configs (the default in ESLint v8, deprecated in ESLint v9 but still valid for existing projects): [./docs/CONFIGURING_ESLINTRC.md](./docs/CONFIGURING_ESLINTRC.md)

<br>

## Philosophy on lint rules which enforce code formatting concerns

Please see here for our philosophy on using a linter to enforce code formatting concerns: [./docs/FORMATTING_RULES.md](./docs/FORMATTING_RULES.md)

**TL;DR - We will not be maintaining code formatting rules in this project, but you are very welcome to create them yourself using our tooling such as `@angular-eslint/utils` and `@angular-eslint/test-utils`.**

<br>

## Linting with the VSCode extension for ESLint

**We strongly recommend using v3 of the vscode-eslint extension.** At the time of writing (May 2024), this is in prerelease. You can enable it by opening up the extension profile page within VSCode and clicking on the "switch to prerelease" button (if your currently installed version is older than v3).

The extension will now be smart enough to pick up from your configuration files what files you care about linting (from both flat configs and eslintrc (as long as you follow the guidance of using overrides outline in this repo)).

The only configuration option you need to care about is if you are using ESLint v9 and still using eslintrc configuration files (because flat config is the default in ESLint v9). In this case you need to set in your `.vscode/settings.json`:

```jsonc
// ... more config
"eslint.useFlatConfig": false,
// ... more config
```

For full information about the extension see: https://github.com/microsoft/vscode-eslint

<br>

## Usage without Angular CLI Builder and eslintrc style configs

**NOTE: This is only applicable when you are using eslintrc configs. For flat config, no custom `--ext` option is needed.**

If you're using this without the Angular CLI Builder (and eslintrc configs), don't forget to include `.html` as one of the file extensions when running the eslint CLI, otherwise templates will not be linted, e.g.:

```sh
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

**As of v15, we generate the fastest possible lint config for you out of the box** (rather than the most _flexible_ lint config), but it is possible that you will need to leverage rules which require type information, and this requires extra consideration.

Please read this dedicated guide to fully understand lint performance and how it is impacted by rules requiring type information: [./docs/RULES_REQUIRING_TYPE_INFORMATION.md](./docs/RULES_REQUIRING_TYPE_INFORMATION.md)

<br>

## Using `eslint-disable` comments in Angular templates

If you want to be able to use `eslint-disable` comments in your Angular templates you just need to ensure you are using:

- `@angular` CLI tooling packages version `11.2.8` or higher
- `@angular-eslint` tooling packages version `2.1.0` or higher

Make sure you are using valid HTML comments, i.e. `<!-- this syntax -->`, not the kind of comments you use in TypeScript code.

<br>

## Migrating an Angular CLI project from Codelyzer and TSLint

Please see here for the legacy information around converting from Codelyzer and TSLint prior to version 16: [./docs/MIGRATING_FROM_TSLINT.md](./docs/MIGRATING_FROM_TSLINT.md)
