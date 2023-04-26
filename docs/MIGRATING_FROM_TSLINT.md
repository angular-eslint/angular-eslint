# Migrating from TSLint: Current Status as of angular-eslint v16

TSLint was deprecated by its creators all the way back in 2019: https://github.com/palantir/tslint/issues/4534

The Angular CLI stopped supporting their TSLint builder implementation (to power `ng lint`) as of version 13, which is now 3 (or maybe more depending on when you are reading this) major versions ago, meaning it is at least 1.5 years ago.

During the initial couple of years angular-eslint was delighted to be able to provide valuable tooling to help with a mostly automated transition from TSLint to ESLint for Angular CLI projects.

As a community project we need to focus on what adds the most value to the majority of our users, and so, in version 16, this conversion tooling was removed.

If you want to leverage it, you can of course use it on a major version of Angular + angular-eslint prior to version 16, or you can feel free to take the implementation from our git history and leverage the schematics inline in your own projects.

If you are looking for general help in migrating specific rules from TSLint to ESLint, you can check out this incredible project that we depended on in our conversion schematic: https://github.com/typescript-eslint/tslint-to-eslint-config

Our original guide and Codelyzer equivalence table, both of which **correspond to angular-eslint version 15**, can be found below, in addition to the legacy `ng-cli-compat` and `ng-cli-compat-formatting-add-on` configs.

<br>

---

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

If you just have a single project in your workspace you can just run:

```sh
ng g @angular-eslint/schematics:convert-tslint-to-eslint
```

If you have a `projects/` directory or similar in your workspace, you will have multiple entries in your `projects` configuration and you will need to chose which one you want to migrate using the `convert-tslint-to-eslint` schematic:

```sh
ng g @angular-eslint/schematics:convert-tslint-to-eslint {{YOUR_PROJECT_NAME_GOES_HERE}}
```

The schematic will do the following for you:

- Read your chosen project's `tslint.json` and use it to CREATE a `.eslintrc.json` at the root of the specific project which extends from the root config (if you do not already have a root config, it will also add one automatically for you).
  - The contents of this `.eslintrc.json` will be the closest possible equivalent to your `tslint.json` that the tooling can figure out.
  - You will want to pay close attention to the terminal output of the schematic as it runs, because it will let you know if it couldn't find an appropriate converter for a TSLint rule, or if it has installed any additional ESLint plugins to help you match up your new setup with your old one.
- UPDATE the project's `architect` configuration in the `angular.json` to such that the `lint` "target" will invoke ESLint instead of TSLint.
- UPDATE any instances of `tslint:disable` comments that are located within your TypeScript source files to their ESLint equivalent.
- If you choose YES (the default) for the `--remove-tslint-if-no-more-tslint-targets` option, it will also automatically remove TSLint and Codelyzer from your workspace if you have no more usage of them left.

Now when you run:

```sh
npx ng lint {{YOUR_PROJECT_NAME_GOES_HERE}}
```

...you are running ESLint on your project! 🎉

<br>

## Status of Codelyzer Rules Conversion

The table below shows the status of each Codelyzer Rule in terms of whether or not an equivalent for it has been created within `@angular-eslint`.

If you see a rule below that has **no status** against it, then please feel free to open a PR with an appropriate implementation. You can look at the Codelyzer repo and the existing plugins within this repo for inspiration.

<!-- begin rule list -->

| Explanation of Statuses                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| :white_check_mark: = We have created an ESLint equivalent of this TSLint rule                                                                                      |
| :construction: = There is an open PR to provide an ESLint equivalent of this TSLint rule                                                                           |
| :no_good: = This TSLint rule has been replaced by functionality within the Angular compiler, or should be replaced by a dedicated code formatter, such as Prettier |

#### Functionality

| Codelyzer Rule                                  |                     ESLint Equivalent                     | Status             |
| ----------------------------------------------- | :-------------------------------------------------------: | ------------------ |
| [`contextual-decorator`]                        |           @angular-eslint/contextual-decorator            | :white_check_mark: |
| [`contextual-lifecycle`]                        |           @angular-eslint/contextual-lifecycle            | :white_check_mark: |
| [`no-attribute-decorator`]                      |          @angular-eslint/no-attribute-decorator           | :white_check_mark: |
| [`no-lifecycle-call`]                           |             @angular-eslint/no-lifecycle-call             | :white_check_mark: |
| [`no-output-native`]                            |             @angular-eslint/no-output-native              | :white_check_mark: |
| [`no-pipe-impure`]                              |              @angular-eslint/no-pipe-impure               | :white_check_mark: |
| [`prefer-on-push-component-change-detection`]   | @angular-eslint/prefer-on-push-component-change-detection | :white_check_mark: |
| [`template-accessibility-alt-text`]             |      @angular-eslint/template/accessibility-alt-text      | :white_check_mark: |
| [`template-accessibility-elements-content`]     |  @angular-eslint/template/accessibility-elements-content  | :white_check_mark: |
| [`template-accessibility-label-for`]            |     @angular-eslint/template/accessibility-label-for      | :white_check_mark: |
| [`template-accessibility-tabindex-no-positive`] |       @angular-eslint/template/no-positive-tabindex       | :white_check_mark: |
| [`template-accessibility-table-scope`]          |    @angular-eslint/template/accessibility-table-scope     | :white_check_mark: |
| [`template-accessibility-valid-aria`]           |     @angular-eslint/template/accessibility-valid-aria     | :white_check_mark: |
| [`template-banana-in-box`]                      |          @angular-eslint/template/banana-in-box           | :white_check_mark: |
| [`template-click-events-have-key-events`]       |   @angular-eslint/template/click-events-have-key-events   | :white_check_mark: |
| [`template-mouse-events-have-key-events`]       |   @angular-eslint/template/mouse-events-have-key-events   | :white_check_mark: |
| [`template-no-any`]                             |              @angular-eslint/template/no-any              | :white_check_mark: |
| [`template-no-autofocus`]                       |           @angular-eslint/template/no-autofocus           | :white_check_mark: |
| [`template-no-distracting-elements`]            |     @angular-eslint/template/no-distracting-elements      | :white_check_mark: |
| [`template-no-negated-async`]                   |         @angular-eslint/template/no-negated-async         | :white_check_mark: |
| [`use-injectable-provided-in`]                  |        @angular-eslint/use-injectable-provided-in         | :white_check_mark: |
| [`use-lifecycle-interface`]                     |          @angular-eslint/use-lifecycle-interface          | :white_check_mark: |

#### Maintainability

| Codelyzer Rule                        |                 ESLint Equivalent                 | Status             |
| ------------------------------------- | :-----------------------------------------------: | ------------------ |
| [`component-max-inline-declarations`] | @angular-eslint/component-max-inline-declarations | :white_check_mark: |
| [`no-conflicting-lifecycle`]          |     @angular-eslint/no-conflicting-lifecycle      | :white_check_mark: |
| [`no-forward-ref`]                    |          @angular-eslint/no-forward-ref           | :white_check_mark: |
| [`no-input-prefix`]                   |          @angular-eslint/no-input-prefix          | :white_check_mark: |
| [`no-input-rename`]                   |          @angular-eslint/no-input-rename          | :white_check_mark: |
| [`no-output-on-prefix`]               |        @angular-eslint/no-output-on-prefix        | :white_check_mark: |
| [`no-output-rename`]                  |         @angular-eslint/no-output-rename          | :white_check_mark: |
| [`no-unused-css`]                     |                                                   |                    |
| [`prefer-output-readonly`]            |      @angular-eslint/prefer-output-readonly       | :white_check_mark: |
| [`relative-url-prefix`]               |        @angular-eslint/relative-url-prefix        | :white_check_mark: |
| [`template-conditional-complexity`]   |  @angular-eslint/template/conditional-complexity  | :white_check_mark: |
| [`template-cyclomatic-complexity`]    |  @angular-eslint/template/cyclomatic-complexity   | :white_check_mark: |
| [`template-i18n`]                     |           @angular-eslint/template/i18n           | :white_check_mark: |
| [`template-no-call-expression`]       |    @angular-eslint/template/no-call-expression    | :white_check_mark: |
| [`template-use-track-by-function`]    |  @angular-eslint/template/use-track-by-function   | :white_check_mark: |
| [`use-component-selector`]            |      @angular-eslint/use-component-selector       | :white_check_mark: |
| [`use-component-view-encapsulation`]  | @angular-eslint/use-component-view-encapsulation  | :white_check_mark: |
| [`use-pipe-decorator`]                |            N/A, see explanation above             | :no_good:          |
| [`use-pipe-transform-interface`]      |   @angular-eslint/use-pipe-transform-interface    | :white_check_mark: |

#### Style

| Codelyzer Rule                   |              ESLint Equivalent               | Status             |
| -------------------------------- | :------------------------------------------: | ------------------ |
| [`angular-whitespace`]           |          N/A, see explanation above          | :no_good:          |
| [`component-class-suffix`]       |    @angular-eslint/component-class-suffix    | :white_check_mark: |
| [`component-selector`]           |      @angular-eslint/component-selector      | :white_check_mark: |
| [`directive-class-suffix`]       |    @angular-eslint/directive-class-suffix    | :white_check_mark: |
| [`directive-selector`]           |      @angular-eslint/directive-selector      | :white_check_mark: |
| [`import-destructuring-spacing`] |          N/A, see explanation above          | :no_good:          |
| [`no-host-metadata-property`]    |  @angular-eslint/no-host-metadata-property   | :white_check_mark: |
| [`no-inputs-metadata-property`]  | @angular-eslint/no-inputs-metadata-property  | :white_check_mark: |
| [`no-outputs-metadata-property`] | @angular-eslint/no-outputs-metadata-property | :white_check_mark: |
| [`no-queries-metadata-property`] | @angular-eslint/no-queries-metadata-property | :white_check_mark: |
| [`pipe-prefix`]                  |         @angular-eslint/pipe-prefix          | :white_check_mark: |
| [`prefer-inline-decorator`]      |          N/A, see explanation above          | :no_good:          |

<!-- Codelyzer Links -->

[`angular-whitespace`]: http://codelyzer.com/rules/angular-whitespace
[`component-class-suffix`]: http://codelyzer.com/rules/component-class-suffix
[`component-max-inline-declarations`]: http://codelyzer.com/rules/component-max-inline-declarations
[`component-selector`]: http://codelyzer.com/rules/component-selector
[`contextual-decorator`]: http://codelyzer.com/rules/contextual-decorator
[`contextual-lifecycle`]: http://codelyzer.com/rules/contextual-lifecycle
[`directive-class-suffix`]: http://codelyzer.com/rules/directive-class-suffix
[`directive-selector`]: http://codelyzer.com/rules/directive-selector
[`import-destructuring-spacing`]: http://codelyzer.com/rules/import-destructuring-spacing
[`no-attribute-decorator`]: http://codelyzer.com/rules/no-attribute-decorator
[`no-conflicting-lifecycle`]: http://codelyzer.com/rules/no-conflicting-lifecycle
[`no-forward-ref`]: http://codelyzer.com/rules/no-forward-ref
[`no-host-metadata-property`]: http://codelyzer.com/rules/no-host-metadata-property
[`no-input-prefix`]: http://codelyzer.com/rules/no-input-prefix
[`no-input-rename`]: http://codelyzer.com/rules/no-input-rename
[`no-inputs-metadata-property`]: http://codelyzer.com/rules/no-inputs-metadata-property
[`no-lifecycle-call`]: http://codelyzer.com/rules/no-lifecycle-call
[`no-output-native`]: http://codelyzer.com/rules/no-output-native
[`no-output-on-prefix`]: http://codelyzer.com/rules/no-output-on-prefix
[`no-output-rename`]: http://codelyzer.com/rules/no-output-rename
[`no-outputs-metadata-property`]: http://codelyzer.com/rules/no-outputs-metadata-property
[`no-pipe-impure`]: http://codelyzer.com/rules/no-pipe-impure
[`no-queries-metadata-property`]: http://codelyzer.com/rules/no-queries-metadata-property
[`no-unused-css`]: http://codelyzer.com/rules/no-unused-css
[`pipe-prefix`]: http://codelyzer.com/rules/pipe-prefix
[`prefer-inline-decorator`]: http://codelyzer.com/rules/prefer-inline-decorator
[`prefer-on-push-component-change-detection`]: http://codelyzer.com/rules/prefer-on-push-component-change-detection
[`prefer-output-readonly`]: http://codelyzer.com/rules/prefer-output-readonly
[`relative-url-prefix`]: http://codelyzer.com/rules/relative-url-prefix
[`template-accessibility-alt-text`]: http://codelyzer.com/rules/template-accessibility-alt-text
[`template-accessibility-elements-content`]: http://codelyzer.com/rules/template-accessibility-elements-content
[`template-accessibility-label-for`]: http://codelyzer.com/rules/template-accessibility-label-for
[`template-accessibility-tabindex-no-positive`]: http://codelyzer.com/rules/template-accessibility-tabindex-no-positive
[`template-accessibility-table-scope`]: http://codelyzer.com/rules/template-accessibility-table-scope
[`template-accessibility-valid-aria`]: http://codelyzer.com/rules/template-accessibility-valid-aria
[`template-banana-in-box`]: http://codelyzer.com/rules/template-banana-in-box
[`template-click-events-have-key-events`]: http://codelyzer.com/rules/template-click-events-have-key-events
[`template-conditional-complexity`]: http://codelyzer.com/rules/template-conditional-complexity
[`template-cyclomatic-complexity`]: http://codelyzer.com/rules/template-cyclomatic-complexity
[`template-i18n`]: http://codelyzer.com/rules/template-i18n
[`template-mouse-events-have-key-events`]: http://codelyzer.com/rules/template-mouse-events-have-key-events
[`template-no-any`]: http://codelyzer.com/rules/template-no-any
[`template-no-autofocus`]: http://codelyzer.com/rules/template-no-autofocus
[`template-no-call-expression`]: http://codelyzer.com/rules/template-no-call-expression
[`template-no-distracting-elements`]: http://codelyzer.com/rules/template-no-distracting-elements
[`template-no-negated-async`]: http://codelyzer.com/rules/template-no-negated-async
[`template-use-track-by-function`]: http://codelyzer.com/rules/template-use-track-by-function
[`use-component-selector`]: http://codelyzer.com/rules/use-component-selector
[`use-component-view-encapsulation`]: http://codelyzer.com/rules/use-component-view-encapsulation
[`use-injectable-provided-in`]: http://codelyzer.com/rules/use-injectable-provided-in
[`use-lifecycle-interface`]: http://codelyzer.com/rules/use-lifecycle-interface
[`use-pipe-decorator`]: http://codelyzer.com/rules/use-pipe-decorator
[`use-pipe-transform-interface`]: http://codelyzer.com/rules/use-pipe-transform-interface

<!-- PR Links -->

<!-- end rule list -->

<br>

---

<br>

## Legacy premade ESLint configs

> We strongly encourage migrating to extend from the recommended configs from both `typescript-eslint` and `angular-eslint` as soon as possible.

### `ng-cli-compat` and `ng-cli-compat--formatting-add-on`

If you ever used the `convert-tslint-to-eslint` schematic in the past, you might have noticed that it generated a config which extended from `ng-cli-compat` and `ng-cli-compat--formatting-add-on`.

As you might infer from the names, these configs existed to most closely match what the Angular CLI used to configure for TSLint and help us reduce a lot of the boilerplate config as part of the TSLint -> ESLint conversion.

You are free to remove them or customize them in any way you wish. Over time, we will encourage people more and more to move towards the `recommended` config instead, because this will not be static, it will evolve as recommendations from the Angular Team and community do.

Note: The equivalent TSLint config from the Angular CLI = both `ng-cli-compat` + `ng-cli-compat--formatting-add-on`.

> The reason for separating out the formatting related rules was that we fundamentally believe you should not use a linter for formatting concerns (you should use a dedicated code formatting tool like Prettier instead), and having them in a separate config that is extended from makes it super easy to remove if you choose to.

We strongly encourage migrating to extend from the recommended configs from both `typescript-eslint` and `angular-eslint` as soon as possible. These configs are kept up to date as recommendations across the various ecosystems evolve.

If you would like to recreate the `ng-cli-compat` and `ng-cli-compat--formatting-add-on` configs as they exists in v15 and earlier, then you can use the following:

**ng-cli-compat**

```jsonc
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "@angular-eslint"],
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "plugins": [
    "eslint-plugin-import",
    "eslint-plugin-jsdoc",
    "eslint-plugin-prefer-arrow"
  ],
  "rules": {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-member-accessibility": "off",
    "sort-keys": "off",
    "@angular-eslint/component-class-suffix": "error",
    "@angular-eslint/component-selector": [
      "error",
      {
        "type": "element",
        "prefix": "app",
        "style": "kebab-case"
      }
    ],
    "@angular-eslint/contextual-lifecycle": "error",
    "@angular-eslint/directive-class-suffix": "error",
    "@angular-eslint/directive-selector": [
      "error",
      {
        "type": "attribute",
        "prefix": "app",
        "style": "camelCase"
      }
    ],
    "@angular-eslint/no-conflicting-lifecycle": "error",
    "@angular-eslint/no-host-metadata-property": "error",
    "@angular-eslint/no-input-rename": "error",
    "@angular-eslint/no-inputs-metadata-property": "error",
    "@angular-eslint/no-output-native": "error",
    "@angular-eslint/no-output-on-prefix": "error",
    "@angular-eslint/no-output-rename": "error",
    "@angular-eslint/no-outputs-metadata-property": "error",
    "@angular-eslint/use-lifecycle-interface": "error",
    "@angular-eslint/use-pipe-transform-interface": "error",
    "@typescript-eslint/adjacent-overload-signatures": "error",
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/ban-types": [
      "error",
      {
        "types": {
          "Object": {
            "message": "Avoid using the `Object` type. Did you mean `object`?"
          },
          "Function": {
            "message": "Avoid using the `Function` type. Prefer a specific function type, like `() => void`."
          },
          "Boolean": {
            "message": "Avoid using the `Boolean` type. Did you mean `boolean`?"
          },
          "Number": {
            "message": "Avoid using the `Number` type. Did you mean `number`?"
          },
          "String": {
            "message": "Avoid using the `String` type. Did you mean `string`?"
          },
          "Symbol": {
            "message": "Avoid using the `Symbol` type. Did you mean `symbol`?"
          }
        }
      }
    ],
    "@typescript-eslint/consistent-type-assertions": "error",
    "@typescript-eslint/dot-notation": "error",
    "@typescript-eslint/member-ordering": "error",
    "@typescript-eslint/naming-convention": "error",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-empty-interface": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": [
      "error",
      {
        "ignoreParameters": true
      }
    ],
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/no-unused-expressions": "error",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/prefer-function-type": "error",
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@typescript-eslint/triple-slash-reference": [
      "error",
      {
        "path": "always",
        "types": "prefer-import",
        "lib": "always"
      }
    ],
    "@typescript-eslint/unified-signatures": "error",
    "complexity": "off",
    "constructor-super": "error",
    "eqeqeq": ["error", "smart"],
    "guard-for-in": "error",
    "id-blacklist": [
      "error",
      "any",
      "Number",
      "number",
      "String",
      "string",
      "Boolean",
      "boolean",
      "Undefined",
      "undefined"
    ],
    "id-match": "error",
    "import/no-deprecated": "warn",
    "jsdoc/newline-after-description": "error",
    "jsdoc/no-types": "error",
    "max-classes-per-file": "off",
    "no-bitwise": "error",
    "no-caller": "error",
    "no-cond-assign": "error",
    "no-console": [
      "error",
      {
        "allow": [
          "log",
          "warn",
          "dir",
          "timeLog",
          "assert",
          "clear",
          "count",
          "countReset",
          "group",
          "groupEnd",
          "table",
          "dirxml",
          "error",
          "groupCollapsed",
          "Console",
          "profile",
          "profileEnd",
          "timeStamp",
          "context"
        ]
      }
    ],
    "no-debugger": "error",
    "no-empty": "off",
    "no-eval": "error",
    "no-fallthrough": "error",
    "no-invalid-this": "off",
    "no-new-wrappers": "error",
    "no-restricted-imports": [
      "error",
      {
        "name": "rxjs/Rx",
        "message": "Please import directly from 'rxjs' instead"
      }
    ],
    "@typescript-eslint/no-shadow": [
      "error",
      {
        "hoist": "all"
      }
    ],
    "no-throw-literal": "error",
    "no-undef-init": "error",
    "no-underscore-dangle": "error",
    "no-unsafe-finally": "error",
    "no-unused-labels": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "one-var": ["error", "never"],
    "prefer-arrow/prefer-arrow-functions": "error",
    "prefer-const": "error",
    "radix": "error",
    "use-isnan": "error",
    "valid-typeof": "off"
  }
}
```

**ng-cli-compat--formatting-add-on**

```jsonc
{
  "plugins": ["eslint-plugin-jsdoc"],
  "rules": {
    "arrow-body-style": "error",
    "arrow-parens": "off",
    "comma-dangle": "off",
    "curly": "error",
    "eol-last": "error",
    "jsdoc/check-alignment": "error",
    "max-len": [
      "error",
      {
        "code": 140
      }
    ],
    "new-parens": "error",
    "no-multiple-empty-lines": "off",
    "no-trailing-spaces": "error",
    "quote-props": ["error", "as-needed"],
    "space-before-function-paren": [
      "error",
      {
        "anonymous": "never",
        "asyncArrow": "always",
        "named": "never"
      }
    ],
    "@typescript-eslint/member-delimiter-style": [
      "error",
      {
        "multiline": {
          "delimiter": "semi",
          "requireLast": true
        },
        "singleline": {
          "delimiter": "semi",
          "requireLast": false
        }
      }
    ],
    "quotes": "off",
    "@typescript-eslint/quotes": [
      "error",
      "single",
      { "allowTemplateLiterals": true }
    ],
    "@typescript-eslint/semi": ["error", "always"],
    "@typescript-eslint/type-annotation-spacing": "error"
  }
}
```
