# Configuring `angular-eslint` for use in ESLint's legacy "eslintrc" format

In version 9 of ESLint, they changed their default configuration format to the so called "flat config" style using exclusively a `eslint.config.js` file as the only way of configuring a project: https://eslint.org/blog/2024/04/eslint-v9.0.0-released/

**If you are using ESLint v9 or later and the flat config format, do not use this guide, you should reference these docs instead: [CONFIGURING_FLAT_CONFIG.md](./CONFIGURING_FLAT_CONFIG.md).**

If you are still using ESLint v8, or opting to continue using the deprecated eslintrc config style in ESLint v9 or later, then the following guidance is for you.

It should be used in conjunction with the official ESLint documentation on eslintrc, which can be found here: https://eslint.org/docs/latest/use/configure/configuration-files-deprecated

---

<br>

## Notes on Supported ESLint Configuration File Types

**We strongly recommend you stick to using `.eslintrc.json`.**

This is not a constraint we force upon you, and you are more than welcome to use any of ESLint's supported file types for your eslintrc style ESLint config files, e.g. `.eslintrc.js`, `.eslintrc.yml` **however** please note that you will not receive any automated updates to your config from this toolset if you choose to use something other than `.eslintrc.json`. We will also only generate `.eslintrc.json` files from our code generators (which you could then convert yourself if you wanted to).

The reason for this is very simple - JSON is a format which is very easy to statically analyze and write transformations for and it is beyond the scope of this community-run project to provide multiple implementations of every possible migration for every possible ESLint configuration file type for every version we release.

<br>

## Notes on ESLint Configuration Itself

It's important to understand up front that **using Angular with ESLint is actually a more advanced use-case** because of the nature of the files involved:

- Angular projects use **TypeScript files** for source code
- Angular projects use a **custom/extended form of HTML** for templates (be they inline or external HTML files)

The thing is: **ESLint understands neither of these things out of the box.**

Fortunately, however, ESLint has clearly defined points of extensibility that we can leverage to make this all work.

> For detailed information about ESLint plugins, parsers etc please review the official ESLint eslintrc config documentation: https://eslint.org/docs/latest/use/configure/configuration-files-deprecated

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

> We have been completely vindicated in this approach in eslintrc configs, because in the new ESLint flat config style that is the default in v9 and onwards, effectively the whole config is an array of overrides, they just aren't called that any more. But each block in the config array is identified by which files it targets, just like eslintrc overrides. So this eslintrc approach also sets you up well conceptually for the future when you migrate to flat config.

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
      "extends": [
        "plugin:@angular-eslint/template/recommended",
        "plugin:@angular-eslint/template/accessibility"
      ],
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
