# Rules requiring type information

**NOTE: This guide only applies to legacy eslintrc config files. If you are using flat config you should leverage the new Project Service from typescript-eslint, it is much simpler and more performant. See https://typescript-eslint.io/blog/announcing-typescript-eslint-v8-beta/#project-service**

ESLint is powerful linter by itself, able to work on the syntax of your source files and assert things about based on the rules you configure. It gets even more powerful, however, when TypeScript type-checker is layered on top of it when analyzing TypeScript files, which is something that `@typescript-eslint` allows us to do.

By default, angular-eslint sets up your ESLint configs with performance in mind - we want your linting to run as fast as possible. Because creating the necessary so called TypeScript `Program`s required to create the type-checker behind the scenes is relatively expensive compared to pure syntax analysis, you should only configure the `parserOptions.project` option in your project's `.eslintrc.json` when you need to use rules requiring type information.

## How to configure `parserOptions.project`

### EXAMPLE 1: Root/Single App Project

Let's take an example of an ESLint config that angular-eslint might generate for you out of the box (in v15 onwards) for single app workspace/the root project in a multi-project workspace:

```json {% fileName=".eslintrc.json" %}
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
        "plugin:@angular-eslint/template/process-inline-templates"
      ],
      "rules": {
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "app",
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "app",
            "style": "kebab-case"
          }
        ]
      }
    },
    {
      "files": ["*.html"],
      "extends": ["plugin:@angular-eslint/template/recommended"],
      "rules": {}
    }
  ]
}
```

Here we do _not_ have `parserOptions.project`, which is appropriate because we are not leveraging any rules which require type information.

If we now come in and add a rule which does require type information, for example `@typescript-eslint/await-thenable`, our config will look as follows:

<!-- prettier-ignore -->
```jsonc {% fileName=".eslintrc.json" %}
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
        "plugin:@angular-eslint/template/process-inline-templates"
      ],
      "rules": {
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "app",
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "app",
            "style": "kebab-case"
          }
        ],
        // This rule requires the TypeScript type checker to be present when it runs
        "@typescript-eslint/await-thenable": "error"
      }
    },
    {
      "files": ["*.html"],
      "extends": ["plugin:@angular-eslint/template/recommended"],
      "rules": {}
    }
  ]
}
```

Now if we try and run `ng lint` we will get an error

```
> ng lint

Linting...

    Error: You have attempted to use a lint rule which requires the full TypeScript type-checker to be available, but you do not have `parserOptions.project`
    configured to point at your project tsconfig.json files in the relevant TypeScript file "overrides" block of your ESLint config `/.eslintrc.json`

    For full guidance on how to resolve this issue, please see https://github.com/angular-eslint/angular-eslint/blob/main/docs/RULES_REQUIRING_TYPE_INFORMATION.md

```

The solution is to update our config once more, this time to set `parserOptions.project` to appropriately point at our various tsconfig.json files which belong to our project:

<!-- prettier-ignore -->
```jsonc {% fileName=".eslintrc.json" %}
{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      // We set parserOptions.project for the project to allow TypeScript to create the type-checker behind the scenes when we run linting
      "parserOptions": {
        "project": ["tsconfig.(app|spec).json"]
      },
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates"
      ],
      "rules": {
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "app",
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "app",
            "style": "kebab-case"
          }
        ],
        // This rule requires the TypeScript type checker to be present when it runs
        "@typescript-eslint/await-thenable": "error"
      }
    },
    {
      "files": ["*.html"],
      "extends": ["plugin:@angular-eslint/template/recommended"],
      "rules": {}
    }
  ]
}
```

And that's it! Now any rules requiring type information will run correctly when we run `ng lint`.

### EXAMPLE 2: Library Project (in `projects/` for example)

Let's take an example of an ESLint config that angular-eslint might generate for you out of the box (in v15 onwards) for a library project called `my-library`:

```json {% fileName="projects/my-library/.eslintrc.json" %}
{
  "extends": "../../.eslintrc.json",
  "ignorePatterns": ["!**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "rules": {
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "lib",
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "lib",
            "style": "kebab-case"
          }
        ]
      }
    },
    {
      "files": ["*.html"],
      "rules": {}
    }
  ]
}
```

Here we do _not_ have `parserOptions.project`, which is appropriate because we are not leveraging any rules which require type information.

If we now come in and add a rule which does require type information, for example `@typescript-eslint/await-thenable`, our config will look as follows:

<!-- prettier-ignore -->
```jsonc {% fileName="projects/my-library/.eslintrc.json" %}
{
  "extends": "../../.eslintrc.json",
  "ignorePatterns": ["!**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "rules": {
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "lib",
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "lib",
            "style": "kebab-case"
          }
        ],
        // This rule requires the TypeScript type checker to be present when it runs
        "@typescript-eslint/await-thenable": "error"
      }
    },
    {
      "files": ["*.html"],
      "rules": {}
    }
  ]
}
```

Now if we try and run `ng lint my-library` we will get an error

```
> ng lint my-library

Linting "my-library"...

    Error: You have attempted to use a lint rule which requires the full TypeScript type-checker to be available, but you do not have `parserOptions.project`
    configured to point at your project tsconfig.json files in the relevant TypeScript file "overrides" block of your ESLint config `projects/my-library/.eslintrc.json`

    For full guidance on how to resolve this issue, please see https://github.com/angular-eslint/angular-eslint/blob/main/docs/RULES_REQUIRING_TYPE_INFORMATION.md

```

The solution is to update our config once more, this time to set `parserOptions.project` to appropriately point at our various tsconfig.json files which belong to our project:

<!-- prettier-ignore -->
```jsonc {% fileName="projects/my-library/.eslintrc.json" %}
{
  "extends": "../../.eslintrc.json",
  "ignorePatterns": ["!**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      // We set parserOptions.project for the project to allow TypeScript to create the type-checker behind the scenes when we run linting
      "parserOptions": {
        "project": ["projects/my-library/tsconfig.(app|lib|spec).json"]
      },
      "rules": {
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "lib",
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "lib",
            "style": "kebab-case"
          }
        ],
        // This rule requires the TypeScript type checker to be present when it runs
        "@typescript-eslint/await-thenable": "error"
      }
    },
    {
      "files": ["*.html"],
      "rules": {}
    }
  ]
}
```

And that's it! Now any rules requiring type information will run correctly when we run `ng lint my-library`.

## Generating new projects and automatically configuring `parserOptions.project`

If your workspace is already leveraging rules requiring type information and you want any newly generated projects to be set up with an appropriate setting for `parserOptions.project` automatically, then you can add the `--set-parser-options-project` flag when generating the new application or library:

E.g.

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

## `parserOptions.project` and performance

Given the increased complexity around configuration, it is possible to end up with non-performant setups if we are not careful.

The first thing is to understand that if you are majorly deviating from the configs that this tooling generates for you automatically, you are greatly increasing the risk of you running into those issues.

If `parserOptions.project` has been configured, by default `typescript-eslint` will take this as a sign that you only want to lint files that are captured within the scope of the TypeScript `Program`s which are created. For example, let's say you have a `tsconfig.json` that contains the following:

<!-- prettier-ignore -->
```jsonc
{
  // ...more config
  "include" [
    "src/**/*.ts"
  ]
}
```

If you provide that file as a reference for `typescript-eslint`, it will conclude that you only want to lint `.ts` files within `src/`. If you attempt to lint a file outside of this pattern, it will error. Seems reasonable, right?

Unfortunately, for us in the context of the Angular CLI, we have an added complication. The Angular CLI prior to v15 generated one or more files which are not included in _any_ tsconfig scopes (such as `environment.prod.ts`). These files are no longer generated by default but are still supported.

To prevent this causing errors for users, we therefore used to enable the `createDefaultProgram` option for `typescript-eslint` when we generated your config (it's `false` by default). This flag tells `typescript-eslint` not to error in the case in finds a file not in a `Program`, and instead create a whole new Program to encapsulate that file and then carry on.

This is not ideal, but it worked. However, can you see what we've now exposed ourselves to by enabling this?

Now if we run linting - _any_ files which are included in the lint run (e.g. by the glob patterns in the builder config in `angular.json`) will be linted, and if they are not in scope of an existing tsconfig a whole new Program will be created for each one of them.

Having patterns which do not makes sense together (files to lint vs provided tsconfigs) is usually how seriously non-performant setups can originate from your config. For small projects creating Programs takes a matter of seconds, for large projects, it can take far longer (depending on the circumstances).

Here are some steps you can take if you're linting process feels "unreasonably" slow:

- Run the process with debug information from `typescript-eslint` enabled:

```sh
DEBUG=typescript-eslint:* ng lint
```

- Full explanation of this command:
  - `ng lint` is being invoked as normal (you would run the full command above in the same way you run `ng lint` normally in whatever terminal you use), but we are also setting an environment variable called `DEBUG`, and giving it a value of `typescript-eslint:*`.
  - `DEBUG` is a relatively common environment variable because it is supported by some common logging/debugging libraries as a way to toggle how verbose the overall output is at runtime.
  - The value of `typescript-eslint:*` will get picked up by the logger within the `typescript-eslint` library and cause it to log very verbosely to the standard output of your terminal as it executes.

You will now see a ton of logs which were not visible before. The two most common issues to look out for are:

- If you see a lot of logs saying that particular files are not being found in existing `Program`s (the scenario we described above) and default `Program`s have to be created
- If you see files included for a project that should not be

If you are still having problems after you have done some digging into these, feel free to open and issue to discuss it further, providing as much context as possible (including the logs from the command above).

<br>

---

<br>

The **ultimate fallback solution** to performance problems caused by the `Program` issues described above is to stop piggybacking on your existing tsconfig files (such as `tsconfig.app.json`, `tsconfig.spec.json` etc), and instead create a laser-focused, dedicated tsconfig file for your ESLint use-case:

- Create a new tsconfig file at the root of the project within the workspace (e.g. a clear name might be `tsconfig.eslint.json`)
- Set the contents of `tsconfig.eslint.json` to:
  - extend from any root/base tsconfig you may have which sets important `compilerOptions`
  - directly include files you care about for linting purposes

For example, it may look like:

**tsconfig.eslint.json**

<!-- prettier-ignore -->
```jsonc
{
  "extends": "./tsconfig.json",
  "include": [
    // adjust "includes" to what makes sense for you and your project
    "src/**/*.ts",
    "e2e/**/*.ts"
  ]
}
```

- Update your project's .eslintrc.json to use the new tsconfig file instead of its existing setting.

For example, the diff might look something like this:

```diff
  "parserOptions": {
    "project": [
-     "tsconfig.app.json",
-     "tsconfig.spec.json",
-     "e2e/tsconfig.json"
+     "tsconfig.eslint.json"
    ],
-   "createDefaultProgram": true
+   "createDefaultProgram": false
  },
```

As you can see, we are also setting `"createDefaultProgram"` to `false` because in this scenario we have full control over what files will be included in the `Program` created behind the scenes for our lint run and we should never need that potentially expensive auto-fallback again. (NOTE: You can also just remove the `"createDefaultProgram"` setting altogether because its default value is `false`).

If you are not sure what `"createDefaultProgram"` does, please reread the section above on `parserOptions.project` and performance.
