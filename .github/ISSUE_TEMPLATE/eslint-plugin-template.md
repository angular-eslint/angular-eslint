---
name: '@angular-eslint/eslint-plugin-template'
about: Report an issue with the '@angular-eslint/eslint-plugin-template' package
title: '[rulename] issue title'
labels: 'package: eslint-plugin-template, triage'
assignees: ''
---

<!--
If you have a problem with a specific rule, please begin your issue title with [rulename] to make it easier to search for.
I.e. "[banana-in-box] False positive when fooing the bar"

Please don't ignore this template.

If you ignore it, we're just going to respond asking you to fill it out, which wastes everyone's time.
The more relevant information you can include, the faster we can find the issue and fix it without asking you for more info.
-->

<!--
Are you opening an issue because the rule you're trying to use is not found?
🚨 STOP 🚨 𝗦𝗧𝗢𝗣 🚨 𝑺𝑻𝑶𝑷 🚨
1) Check the releases log: https://github.com/angular-eslint/angular-eslint/releases
    -  If the rule isn't listed there, then chances are it hasn't been released to the main npm tag yet.
2) Try installing the `canary` tag: `npm i @angular-eslint/eslint-plugin-template@canary`.
    - The canary tag is built for every commit to master, so it contains the bleeding edge build.
3) If ESLint still can't find the rule, then consider reporting an issue.
-->

**Description and reproduction of the issue**

<!--
Please consider creating an isolated reproduction repo to make it easy for the volunteer maintainers debug your issue.
-->

```JSON
{
  "rules": {
    "@angular-eslint/template/<rule>": ["<setting>"]
  }
}
```

```HTML
// your repro code case
```

**Versions**

| package                                   | version |
| ----------------------------------        | ------- |
| `@angular-eslint/eslint-plugin-template`  | `X.Y.Z` |
| `@angular-eslint/template-parser`         | `X.Y.Z` |
| `@typescript-eslint/parser`               | `X.Y.Z` |
| `ESLint`                                  | `X.Y.Z` |
| `node`                                    | `X.Y.Z` |

```sh
# Please run `npx ng version` in your project and paste the full output here:


```

<!--
^ **Before submitting the issue** please check that output from `ng version` carefully.

Is there any inconsistency between your major version numbers? E.g. if you see `@angular-devkit/core` at version `7.x.x` but your `@angular/cli` is a version `11.x.x` it makes sense that you would be experiencing issues.

It's not clear how workspaces can end up in this state, but fixing it is just a case of installing the correct versions that are intended to work together and verifying the `ng version` output once again.
-->

- [ ] I have tried restarting my IDE and the issue persists.
- [ ] I have updated to the latest supported version of the packages and checked my `ng version` output per the instructions given here.
