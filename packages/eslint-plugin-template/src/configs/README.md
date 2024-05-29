# Premade configs

These configs exist for your convenience. They contain configuration intended to save you time and effort when configuring your project by disabling rules known to conflict with this repository, or cause issues in Angular codebases.

## `accessibility`

These are all the rules within `@angular-eslint/eslint-plugin-template` which deal with things impacting the accessibility of your Angular apps.

The rules are based on a number of best practice recommendations and resources including:

- [W3C - Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/)
- [Mozilla Developer Network - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Google Chrome - Audit Rules](https://github.com/GoogleChrome/accessibility-developer-tools/wiki/Audit-Rules)

## `recommended`

The recommended set is an **_opinionated_** set of rules that we think you should use because:

1. They help you adhere to Angular template best practices.
2. They help catch probable issue vectors in your code.

That being said, it is not the only way to use `@angular-eslint/eslint-plugin-template`, nor is it the way that will necessarily work 100% for your project/company. It has been built based off of two main things:

1. Angular best practices collected and collated from places like:
   - [Angular repo](https://github.com/angular/angular).
   - [Angular documentation](https://angular.dev).
   - Advice from the Angular Team at Google.
2. The combined state of community contributed rulesets at the time of creation.

We will not add new rules to the recommended set unless we release a major package version (i.e. it is seen as a breaking change).

### Altering the recommended set to suit your project

If you disagree with a rule (or it disagrees with your codebase), consider using your local config to change the rule config so it works for your project.

```cjson
{
  "extends": ["plugin:@angular-eslint/template/recommended"],
  "rules": {
    // our project thinks using negated async pipes is ok
    "@angular-eslint/template/no-negated-async": "off"
  }
}
```

### Suggesting changes to the recommended set

If you feel _very_, **very**, **_very_** strongly that a specific rule should (or should not) be in the recommended ruleset, please feel free to file an issue along with a **detailed** argument explaining your reasoning. We expect to see you citing concrete evidence supporting why (or why not) a rule is considered best practice. **Please note that if your reasoning is along the lines of "it's what my project/company does", or "I don't like the rule", then we will likely close the request without discussion.**
