# @angular-eslint/eslint-plugin

## Premade configs

- [Premade configs](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/src/configs)

## Rules

<!-- begin problems rule list -->

### Possible problems

**Key**

- :white_check_mark: = recommended
- :wrench: = fixable
- :bulb: = has suggestions

<!-- prettier-ignore-start -->
| Rule | Description | :white_check_mark: | :wrench: | :bulb: |
| --- | --- | --- | --- | --- |
| [`contextual-lifecycle`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/contextual-lifecycle.md) | Ensures that lifecycle methods are used in a correct context | :white_check_mark: |  |  |
| [`no-attribute-decorator`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-attribute-decorator.md) | The @Attribute decorator is used to obtain a single value for an attribute. This is a much less common use-case than getting a stream of values (using @Input), so often the @Attribute decorator is mistakenly used when @Input was what was intended. This rule disallows usage of @Attribute decorator altogether in order to prevent these mistakes. |  |  |  |
| [`sort-lifecycle-methods`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/sort-lifecycle-methods.md) | Ensures that lifecycle methods are declared in order of execution |  |  |  |
<!-- prettier-ignore-end -->

<!-- end problems rule list -->

<!-- begin suggestions rule list -->

### Suggestions

**Key**

- :white_check_mark: = recommended
- :wrench: = fixable
- :bulb: = has suggestions

<!-- prettier-ignore-start -->
| Rule | Description | :white_check_mark: | :wrench: | :bulb: |
| --- | --- | --- | --- | --- |
| [`component-class-suffix`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/component-class-suffix.md) | Classes decorated with @Component must have suffix "Component" (or custom) in their name. See more at https://angular.io/styleguide#style-02-03 | :white_check_mark: |  |  |
| [`component-max-inline-declarations`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/component-max-inline-declarations.md) | Enforces a maximum number of lines in inline template, styles and animations. See more at https://angular.io/guide/styleguide#style-05-04 |  |  |  |
| [`component-selector`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/component-selector.md) | Component selectors should follow given naming rules. See more at https://angular.io/guide/styleguide#style-02-07, https://angular.io/guide/styleguide#style-05-02 and https://angular.io/guide/styleguide#style-05-03. |  |  |  |
| [`contextual-decorator`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/contextual-decorator.md) | Ensures that classes use contextual decorators in its body |  |  |  |
| [`directive-class-suffix`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/directive-class-suffix.md) | Classes decorated with @Directive must have suffix "Directive" (or custom) in their name. See more at https://angular.io/styleguide#style-02-03 | :white_check_mark: |  |  |
| [`directive-selector`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/directive-selector.md) | Directive selectors should follow given naming rules. See more at https://angular.io/guide/styleguide#style-02-06 and https://angular.io/guide/styleguide#style-02-08. |  |  |  |
| [`no-conflicting-lifecycle`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-conflicting-lifecycle.md) | Ensures that directives not implement conflicting lifecycle interfaces. |  |  |  |
| [`no-empty-lifecycle-method`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-empty-lifecycle-method.md) | Disallows declaring empty lifecycle methods | :white_check_mark: |  | :bulb: |
| [`no-forward-ref`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-forward-ref.md) | Disallows usage of `forwardRef` references for DI |  |  |  |
| [`no-host-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-host-metadata-property.md) | Disallows usage of the `host` metadata property. See more at https://angular.io/styleguide#style-06-03 | :white_check_mark: |  |  |
| [`no-input-prefix`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-input-prefix.md) | Ensures that input bindings, including aliases, are not named or prefixed by the configured disallowed prefixes |  |  |  |
| [`no-input-rename`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-input-rename.md) | Ensures that input bindings are not aliased | :white_check_mark: | :wrench: | :bulb: |
| [`no-inputs-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-inputs-metadata-property.md) | Disallows usage of the `inputs` metadata property. See more at https://angular.io/styleguide#style-05-12 | :white_check_mark: |  |  |
| [`no-lifecycle-call`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-lifecycle-call.md) | Disallows explicit calls to lifecycle methods |  |  |  |
| [`no-output-native`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-output-native.md) | Ensures that output bindings, including aliases, are not named as standard DOM events | :white_check_mark: |  |  |
| [`no-output-on-prefix`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-output-on-prefix.md) | Ensures that output bindings, including aliases, are not named "on", nor prefixed with it. See more at https://angular.io/guide/styleguide#style-05-16 | :white_check_mark: |  |  |
| [`no-output-rename`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-output-rename.md) | Ensures that output bindings are not aliased | :white_check_mark: | :wrench: | :bulb: |
| [`no-outputs-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-outputs-metadata-property.md) | Disallows usage of the `outputs` metadata property. See more at https://angular.io/styleguide#style-05-12 | :white_check_mark: |  |  |
| [`no-pipe-impure`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-pipe-impure.md) | Disallows the declaration of impure pipes |  |  | :bulb: |
| [`no-queries-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-queries-metadata-property.md) | Disallows usage of the `queries` metadata property. See more at https://angular.io/styleguide#style-05-12. |  |  |  |
| [`pipe-prefix`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/pipe-prefix.md) | Enforce consistent prefix for pipes. |  |  |  |
| [`prefer-on-push-component-change-detection`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-on-push-component-change-detection.md) | Ensures component's `changeDetection` is set to `ChangeDetectionStrategy.OnPush` |  |  | :bulb: |
| [`prefer-output-readonly`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-output-readonly.md) | Prefer to declare `@Output` as `readonly` since they are not supposed to be reassigned |  |  | :bulb: |
| [`prefer-standalone-component`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-standalone-component.md) | Ensures component `standalone` property is set to `true` in the component decorator |  | :wrench: |  |
| [`relative-url-prefix`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/relative-url-prefix.md) | The ./ and ../ prefix is standard syntax for relative URLs; don't depend on Angular's current ability to do without that prefix. See more at https://angular.io/styleguide#style-05-04 |  |  |  |
| [`require-localize-metadata`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/require-localize-metadata.md) | Ensures that $localize tagged messages contain helpful metadata to aid with translations. |  |  |  |
| [`sort-ngmodule-metadata-arrays`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/sort-ngmodule-metadata-arrays.md) | Ensures ASC alphabetical order for `NgModule` metadata arrays for easy visual scanning |  | :wrench: |  |
| [`use-component-selector`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-component-selector.md) | Component selector must be declared |  |  |  |
| [`use-component-view-encapsulation`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-component-view-encapsulation.md) | Disallows using `ViewEncapsulation.None` |  |  | :bulb: |
| [`use-injectable-provided-in`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-injectable-provided-in.md) | Using the `providedIn` property makes `Injectables` tree-shakable |  |  | :bulb: |
| [`use-lifecycle-interface`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-lifecycle-interface.md) | Ensures that classes implement lifecycle interfaces corresponding to the declared lifecycle methods. See more at https://angular.io/styleguide#style-09-01 |  |  |  |
| [`use-pipe-transform-interface`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-pipe-transform-interface.md) | Ensures that `Pipes` implement `PipeTransform` interface | :white_check_mark: | :wrench: |  |
<!-- prettier-ignore-end -->

<!-- end suggestions rule list -->

<!-- begin layout rule list -->

<!-- end layout rule list -->

<!-- begin deprecated rule list -->

<!-- end deprecated rule list -->
