# Rules requiring type information

ESLint is powerful linter by itself, able to work on the syntax of your source files and assert things about based on the rules you configure. It gets even more powerful, however, when TypeScript type-checker is layered on top of it when analyzing TypeScript files, which is something that `@typescript-eslint` allows us to do.

By default, angular-eslint sets up your ESLint configs with performance in mind - we want your linting to run as fast as possible. Because creating the necessary so called TypeScript `Program`s required to create the type-checker behind the scenes is relatively expensive compared to pure syntax analysis, you should only configure the `parserOptions.project` option in your project's `.eslintrc.json` when you need to use rules requiring type information.

## How to configure `parserOptions.project`

### EXAMPLE 1: Root/Single App Project

Let's take an example of an ESLint config that angular-eslint might generate for you out of the box (in v15 onwards) for single app workspace/the root project in a multi-project workspace:

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
