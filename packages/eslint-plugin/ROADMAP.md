# Roadmap

This document outlines the progress made so far in migrating Codelyzer rules to Angular ESLint.

## Progress

|                           |
| ------------------------- |
| ✅ = done                 |
| 🚧 = work in progress     |
| 🚨 = has integration test |

### Functionality

| Codelyzer rule                                  |     |     |
| ----------------------------------------------- | :-: | :-: |
| [`contextual-decorator`]                        |     |     |
| [`contextual-lifecycle`]                        | ✅  | 🚨  |
| [`no-attribute-decorator`]                      |     |     |
| [`no-lifecycle-call`]                           | ✅  |     |
| [`no-output-native`]                            | ✅  | 🚨  |
| [`no-pipe-impure`]                              | ✅  |     |
| [`prefer-on-push-component-change-detection`]   | ✅  |     |
| [`template-accessibility-alt-text`]             |     |     |
| [`template-accessibility-elements-content`]     |     |     |
| [`template-accessibility-label-for`]            |     |     |
| [`template-accessibility-tabindex-no-positive`] |     |     |
| [`template-accessibility-table-scope`]          |     |     |
| [`template-accessibility-valid-aria`]           |     |     |
| [`template-banana-in-box`]                      | ✅  | 🚨  |
| [`template-click-events-have-key-events`]       |     |     |
| [`template-mouse-events-have-key-events`]       |     |     |
| [`template-no-any`]                             |     |     |
| [`template-no-autofocus`]                       |     |     |
| [`template-no-distracting-elements`]            |     |     |
| [`template-no-negated-async`]                   | 🚧  |     |
| [`use-injectable-provided-in`]                  | ✅  |     |
| [`use-lifecycle-interface`]                     | ✅  | 🚨  |

### Maintainability

| Codelyzer rule                        |     |     |
| ------------------------------------- | :-: | :-: |
| [`component-max-inline-declarations`] | ✅  |     |
| [`no-conflicting-lifecycle`]          | ✅  | 🚨  |
| [`no-forward-ref`]                    | ✅  |     |
| [`no-input-prefix`]                   |     |     |
| [`no-input-rename`]                   | 🚧  |     |
| [`no-output-on-prefix`]               | ✅  | 🚨  |
| [`no-output-rename`]                  | ✅  | 🚨  |
| [`no-unused-css`]                     |     |     |
| [`prefer-output-readonly`]            | ✅  |     |
| [`relative-url-prefix`]               | ✅  |     |
| [`template-conditional-complexity`]   |     |     |
| [`template-cyclomatic-complexity`]    |     |     |
| [`template-i18n`]                     |     |     |
| [`template-no-call-expression`]       |     |     |
| [`template-use-track-by-function`]    |     |     |
| [`use-component-selector`]            | ✅  |     |
| [`use-component-view-encapsulation`]  | ✅  |     |
| [`use-pipe-decorator`]                | ✅  |     |
| [`use-pipe-transform-interface`]      | ✅  | 🚨  |

### Style

| Codelyzer rule                   |     |     |
| -------------------------------- | :-: | :-: |
| [`angular-whitespace`]           |     |     |
| [`component-class-suffix`]       | ✅  | 🚨  |
| [`component-selector`]           | ✅  | 🚨  |
| [`directive-class-suffix`]       | ✅  |     |
| [`directive-selector`]           | ✅  | 🚨  |
| [`import-destructuring-spacing`] |     |     |
| [`no-host-metadata-property`]    | ✅  | 🚨  |
| [`no-inputs-metadata-property`]  | ✅  | 🚨  |
| [`no-outputs-metadata-property`] | ✅  | 🚨  |
| [`no-queries-metadata-property`] | ✅  |     |
| [`pipe-prefix`]                  |     |     |
| [`prefer-inline-decorator`]      |     |     |

<!-- Relative Links -->

[`contextual-decorator`]: http://codelyzer.com/rules/contextual-decorator
[`contextual-lifecycle`]: http://codelyzer.com/rules/contextual-lifecycle
[`no-attribute-decorator`]: http://codelyzer.com/rules/no-attribute-decorator
[`no-lifecycle-call`]: http://codelyzer.com/rules/no-lifecycle-call
[`no-output-native`]: http://codelyzer.com/rules/no-output-native
[`no-pipe-impure`]: http://codelyzer.com/rules/no-pipe-impure
[`prefer-on-push-component-change-detection`]: http://codelyzer.com/rules/prefer-on-push-component-change-detection
[`template-accessibility-alt-text`]: http://codelyzer.com/rules/template-accessibility-alt-text
[`template-accessibility-elements-content`]: http://codelyzer.com/rules/template-accessibility-elements-content
[`template-accessibility-label-for`]: http://codelyzer.com/rules/template-accessibility-label-for
[`template-accessibility-tabindex-no-positive`]: http://codelyzer.com/rules/template-accessibility-tabindex-no-positive
[`template-accessibility-table-scope`]: http://codelyzer.com/rules/template-accessibility-table-scope
[`template-accessibility-valid-aria`]: http://codelyzer.com/rules/template-accessibility-valid-aria
[`template-banana-in-box`]: http://codelyzer.com/rules/template-banana-in-box
[`template-click-events-have-key-events`]: http:/codelyzer.com/rules/template-click-events-have-key-events
[`template-mouse-events-have-key-events`]: http:/codelyzer.com/rules/template-mouse-events-have-key-events
[`template-no-any`]: http://codelyzer.com/rules/template-no-any
[`template-no-autofocus`]: http://codelyzer.com/rules/template-no-autofocus
[`template-no-distracting-elements`]: http://codelyzer.com/rules/template-no-distracting-elements
[`template-no-negated-async`]: http://codelyzer.com/rules/template-no-negated-async
[`use-injectable-provided-in`]: http://codelyzer.com/rules/use-injectable-provided-in
[`use-lifecycle-interface`]: http://codelyzer.com/rules/use-lifecycle-interface
[`component-max-inline-declarations`]: http://codelyzer.com/rules/component-max-inline-declarations
[`no-conflicting-lifecycle`]: http://codelyzer.com/rules/no-conflicting-lifecycle
[`no-forward-ref`]: http://codelyzer.com/rules/no-forward-ref
[`no-input-prefix`]: http://codelyzer.com/rules/no-input-prefix
[`no-input-rename`]: http://codelyzer.com/rules/no-input-rename
[`no-output-on-prefix`]: http://codelyzer.com/rules/no-output-on-prefix
[`no-output-rename`]: http://codelyzer.com/rules/no-output-rename
[`no-unused-css`]: http://codelyzer.com/rules/no-unused-css
[`prefer-output-readonly`]: http://codelyzer.com/rules/prefer-output-readonly
[`relative-url-prefix`]: http://codelyzer.com/rules/relative-url-prefix
[`template-conditional-complexity`]: http://codelyzer.com/rules/template-conditional-complexity
[`template-cyclomatic-complexity`]: http://codelyzer.com/rules/template-cyclomatic-complexity
[`template-i18n`]: http://codelyzer.com/rules/template-i18n
[`template-no-call-expression`]: http://codelyzer.com/rules/template-no-call-expression
[`template-use-track-by-function`]: http://codelyzer.com/rules/template-use-track-by-function
[`use-component-selector`]: http://codelyzer.com/rules/use-component-selector
[`use-component-view-encapsulation`]: http://codelyzer.com/rules/use-component-view-encapsulation
[`use-pipe-decorator`]: http://codelyzer.com/rules/use-pipe-decorator
[`use-pipe-transform-interface`]: http://codelyzer.com/rules/use-pipe-transform-interface
[`angular-whitespace`]: http://codelyzer.com/rules/angular-whitespace
[`component-class-suffix`]: http://codelyzer.com/rules/component-class-suffix
[`component-selector`]: http://codelyzer.com/rules/component-selector
[`directive-class-suffix`]: http://codelyzer.com/rules/directive-class-suffix
[`directive-selector`]: http://codelyzer.com/rules/directive-selector
[`import-destructuring-spacing`]: http://codelyzer.com/rules/import-destructuring-spacing
[`no-host-metadata-property`]: http://codelyzer.com/rules/no-host-metadata-property
[`no-inputs-metadata-property`]: http://codelyzer.com/rules/no-inputs-metadata-property
[`no-outputs-metadata-property`]: http://codelyzer.com/rules/no-outputs-metadata-property
[`no-queries-metadata-property`]: http://codelyzer.com/rules/no-queries-metadata-property
[`pipe-prefix`]: http://codelyzer.com/rules/pipe-prefix
[`prefer-inline-decorator`]: http://codelyzer.com/rules/prefer-inline-decorator
