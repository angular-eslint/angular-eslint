# Premade configs

These configs exist for your convenience. They contain configuration intended to save you time and effort when configuring your project by disabling rules known to conflict with this repository, or cause issues in Angular codebases.

## `all`

Quite simply, this enables all the possible rules from `@angular-eslint/eslint-plugin`. It is unlikely this will be applicable in real-world projects, but some folks find this useful to have as a reference.

## `recommended`

The recommended set is an **_opinionated_** set of Angular-specific rules that we think you should use because:

1. They help you adhere to Angular best practices.
2. They help catch probable issue vectors in your code.

That being said, it is not the only way to use `@angular-eslint/eslint-plugin`, nor is it the way that will necessarily work 100% for your project/company. It has been built based off of two main things:

1. Angular best practices collected and collated from places like:
   - [Angular repo](https://github.com/angular/angular).
   - [Angular documentation](https://angular.io).
   - Advice from the Angular Team at Google.
2. The combined state of community contributed rulesets at the time of creation.

It is strongly encouraged to combine the recommended Angular rules with the recommended configs from `typescript-eslint` (https://typescript-eslint.io/linting/configs/#recommended-configurations), and this is what our schematics will generate for you automatically.

We will not change/add new rules to the recommended set unless we release a major package version (i.e. it is seen as a breaking change).

### Altering the recommended set to suit your project

If you disagree with a rule (or it disagrees with your codebase), consider using your local config to change the rule config so it works for your project.

```cjson
{
  "extends": ["plugin:@angular-eslint/recommended"],
  "rules": {
    // our project thinks using renaming inputs is ok
    "@angular-eslint/no-input-rename": "off"
  }
}
```

### Suggesting changes to the recommended set

If you feel _very_, **very**, **_very_** strongly that a specific rule should (or should not) be in the recommended ruleset, please feel free to file an issue along with a **detailed** argument explaining your reasoning. We expect to see you citing concrete evidence supporting why (or why not) a rule is considered best practice. **Please note that if your reasoning is along the lines of "it's what my project/company does", or "I don't like the rule", then we will likely close the request without discussion.**
