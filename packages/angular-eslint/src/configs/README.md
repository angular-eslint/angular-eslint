# Premade flat configs

These flat configs exist for your convenience. They contain configuration intended to save you time and effort when configuring your project by disabling rules known to conflict with this repository, or cause issues in Angular codebases.

## `angular-eslint/ts-all` and `angular-eslint/template-all`

Quite simply, these enable all the possible rules from `@angular-eslint/eslint-plugin` and `@angular-eslint/eslint-plugin-template` respectively. It is unlikely they will be applicable in real-world projects, but some folks find them useful to have as a reference.

## `angular-eslint/ts-recommended` and `angular-eslint/template-recommended`

The recommended sets from `@angular-eslint/eslint-plugin` and `@angular-eslint/eslint-plugin-template` are **_opinionated_** sets of Angular-specific rules that we think you should use because:

1. They help you adhere to Angular best practices.
2. They help catch probable issue vectors in your code.

That being said, it is not the only way to use `@angular-eslint/eslint-plugin` or `@angular-eslint/eslint-plugin-template`, nor is it the way that will necessarily work 100% for your project/company. It has been built based off of two main things:

1. Angular best practices collected and collated from places like:
   - [Angular repo](https://github.com/angular/angular).
   - [Angular documentation](https://angular.dev).
   - Advice from the Angular Team at Google.
2. The combined state of community contributed rulesets at the time of creation.

It is strongly encouraged to combine the recommended Angular rules with the recommended configs from `typescript-eslint` (https://typescript-eslint.io/linting/configs/#recommended-configurations), and this is what our schematics will generate for you automatically.

We will not change/add new rules to the recommended set unless we release a major package version (i.e. it is seen as a breaking change).

### Altering the recommended set to suit your project

If you disagree with a rule (or it disagrees with your codebase), consider using your local config to change the rule config so it works for your project.

For example, if you want to turn off the `@angular-eslint/no-input-rename` TS rule, and turn off the '@angular-eslint/template/no-negated-async' template rule, you can add them to the applicable sections of the config and set them to "off" like this:

**eslint.config.js**

```js
// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.createProcessor(),
    rules: {
      // our project thinks using renaming inputs is ok
      '@angular-eslint/no-input-rename': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      // our project thinks using negated async pipes is ok
      '@angular-eslint/template/no-negated-async': 'off',
    },
  },
);
```

## `angular.createProcessor`

`angular.createProcessor()` extracts inline templates by default. Set
`inlineStyles: { inlineStyleLanguage: 'css' }` to also lint static component
`styles` and `style` attributes. Copy the language from `angular.json`: supported
values are `css`, `scss`, `sass`, and `less`. The factory emits virtual files for
your style configurations; it does not configure style parsers or rules itself.

Use the same factory configuration for TypeScript and HTML blocks. Inline-template
attributes are extracted by the TS block only; the HTML processor covers external
template attributes. `inlineTemplates` defaults to `true` and has no effect on
external HTML files, which are linted directly. `inlineStyles` defaults to `false`.
Set `inlineTemplates: false` for styles-only extraction.

Only static values are linted: `styles` entries must be string literals (or
template literals without `${}` substitutions), and `style` attributes must not
contain `{{ }}` interpolations. Inline templates containing `${}` substitutions
are not style-linted, including static attributes within them. `[style]` and
`[style.x]` bindings are never linted. `style` attributes are linted as the
declarations of a CSS rule; problems reported on the wrapper rule itself are
ignored. Parse errors are retained. See [Configuring ESLint for Inline Styles](https://github.com/angular-eslint/angular-eslint/blob/main/docs/CONFIGURING_ESLINT.md#configuring-eslint-for-inline-styles)
for details, including which autofixes can be applied.

Enabling styles requires an explicit language, with no `true` shorthand. Angular's
default is `css`, but the factory does not infer it: SCSS inline styles are common,
and CSS fallback would cause `$variables`/`@include` parse errors with no suitable
place for disable comments. `inlineStyles: {}` throws
`inlineStyles requires inlineStyleLanguage (copy it from angular.json; Angular's default is 'css')`.
Disabling both features also throws. Component `styles` use the chosen extension;
`style` attributes are always `.css`. For example:

**eslint.config.js**

```js
// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const css = require('@eslint/css').default;

const processor = angular.createProcessor({
  inlineStyles: { inlineStyleLanguage: 'css' },
});

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor,
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    processor,
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    rules: {
      'css/prefer-logical-properties': 'error',
    },
  },
);
```

If your project sets `inlineStyleLanguage` to `scss` (or `sass`/`less`), pass
the same value to `createProcessor()` so component `styles` are emitted with that
extension, and lint them with a matching configuration:

```js
// @ts-check
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const css = require('@eslint/css').default;
const { scss } = require('@humanwhocodes/scsstree');

const processor = angular.createProcessor({
  inlineStyles: { inlineStyleLanguage: 'scss' },
});

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [...angular.configs.tsRecommended],
    processor,
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
    processor,
  },
  {
    // `style` attributes
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    rules: {
      'css/prefer-logical-properties': 'error',
    },
  },
  {
    // component `styles`
    files: ['**/*.scss'],
    plugins: { css },
    language: 'css/css',
    languageOptions: { customSyntax: scss },
    rules: {
      'css/prefer-logical-properties': 'error',
    },
  },
);
```

`angular.processInlineTemplates` is deprecated but remains identical to
`angular.createProcessor()`, including its behavior and legacy cache name.
`'@angular-eslint/template/extract-inline-html'` string references remain supported.

## `angular-eslint/template-accessibility`

These are all the rules within `@angular-eslint/eslint-plugin-template` which deal with things impacting the accessibility of your Angular apps.

The rules are based on a number of best practice recommendations and resources including:

- [W3C - Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/)
- [Mozilla Developer Network - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Google Chrome - Audit Rules](https://github.com/GoogleChrome/accessibility-developer-tools/wiki/Audit-Rules)

### Suggesting changes to the recommended set

If you feel _very_, **very**, **_very_** strongly that a specific rule should (or should not) be in the recommended ruleset, please feel free to file an issue along with a **detailed** argument explaining your reasoning. We expect to see you citing concrete evidence supporting why (or why not) a rule is considered best practice. **Please note that if your reasoning is along the lines of "it's what my project/company does", or "I don't like the rule", then we will likely close the request without discussion.**
