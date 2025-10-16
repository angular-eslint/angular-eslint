# @angular-eslint/eslint-plugin-template

Please see https://github.com/angular-eslint/angular-eslint for full usage instructions and guidance.

## Premade configs

- [Premade configs](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/src/configs)

## Rules

<!-- begin problems rule list -->

### Possible problems

**Key**

- :white_check_mark: = recommended
- :wrench: = fixable
- :bulb: = has suggestions
- :accessibility: = included in accessibility preset

<!-- prettier-ignore-start -->
| Rule | Description | :white_check_mark: | :wrench: | :bulb: | :accessibility: |
| --- | --- | --- | --- | --- | --- |
| [`no-duplicate-attributes`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-duplicate-attributes.md) | Ensures that there are no duplicate input properties or output event listeners |  |  | :bulb: |  |
| [`no-nested-tags`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-nested-tags.md) | Denies nesting of <p> and <a> tags. |  |  |  |  |
<!-- prettier-ignore-end -->

<!-- end problems rule list -->

<!-- begin suggestions rule list -->

### Suggestions

**Key**

- :white_check_mark: = recommended
- :wrench: = fixable
- :bulb: = has suggestions
- :accessibility: = included in accessibility preset

<!-- prettier-ignore-start -->
| Rule | Description | :white_check_mark: | :wrench: | :bulb: | :accessibility: |
| --- | --- | --- | --- | --- | --- |
| [`alt-text`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/alt-text.md) | [Accessibility] Enforces alternate text for elements which require the alt, aria-label, aria-labelledby attributes. |  |  |  | :accessibility: |
| [`banana-in-box`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/banana-in-box.md) | Ensures that the two-way data binding syntax is correct | :white_check_mark: | :wrench: |  |  |
| [`button-has-type`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/button-has-type.md) | Ensures that a button has a valid type specified |  |  |  |  |
| [`click-events-have-key-events`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/click-events-have-key-events.md) | [Accessibility] Ensures that the click event is accompanied with at least one key event keyup, keydown or keypress. |  |  |  | :accessibility: |
| [`conditional-complexity`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/conditional-complexity.md) | The conditional complexity should not exceed a rational limit |  |  |  |  |
| [`cyclomatic-complexity`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/cyclomatic-complexity.md) | Checks cyclomatic complexity against a specified limit. It is a quantitative measure of the number of linearly independent paths through a program's source code |  |  |  |  |
| [`elements-content`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/elements-content.md) | [Accessibility] Ensures that the heading, anchor and button elements have content in it |  |  |  | :accessibility: |
| [`eqeqeq`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/eqeqeq.md) | Requires `===` and `!==` in place of `==` and `!=` | :white_check_mark: | :wrench: | :bulb: |  |
| [`i18n`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/i18n.md) | Ensures following best practices for i18n. Checks for missing i18n attributes on elements and attributes containing texts. Can also check for texts without i18n attribute, elements that do not use custom ID (@@) feature and duplicate custom IDs |  | :wrench: | :bulb: |  |
| [`interactive-supports-focus`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/interactive-supports-focus.md) | [Accessibility] Ensures that elements with interactive handlers like `(click)` are focusable. |  |  |  | :accessibility: |
| [`label-has-associated-control`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/label-has-associated-control.md) | [Accessibility] Ensures that a label element/component is associated with a form element |  |  |  | :accessibility: |
| [`mouse-events-have-key-events`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/mouse-events-have-key-events.md) | [Accessibility] Ensures that the mouse events `mouseout` and `mouseover` are accompanied by `focus` and `blur` events respectively. Coding for the keyboard is important for users with physical disabilities who cannot use a mouse, AT compatibility, and screenreader users. See more at https://www.w3.org/WAI/WCAG21/Understanding/keyboard |  |  |  | :accessibility: |
| [`no-any`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-any.md) | The use of "$any" nullifies the compile-time benefits of Angular's type system |  |  | :bulb: |  |
| [`no-autofocus`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-autofocus.md) | [Accessibility] Ensures that the `autofocus` attribute is not used |  | :wrench: |  | :accessibility: |
| [`no-call-expression`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-call-expression.md) | Disallows calling expressions in templates, except for output handlers |  |  |  |  |
| [`no-distracting-elements`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-distracting-elements.md) | [Accessibility] Enforces that no distracting elements are used |  | :wrench: |  | :accessibility: |
| [`no-empty-control-flow`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-empty-control-flow.md) | Ensures that control flow blocks are not empty. Empty control flow blocks usually occur due to refactoring that wasn't completed. They can cause confusion when reading code. |  |  |  |  |
| [`no-inline-styles`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-inline-styles.md) | Disallows the use of inline styles in HTML templates |  |  |  |  |
| [`no-interpolation-in-attributes`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-interpolation-in-attributes.md) | Ensures that property-binding is used instead of interpolation in attributes. |  | :wrench: |  |  |
| [`no-negated-async`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-negated-async.md) | Ensures that async pipe results, as well as values used with the async pipe, are not negated | :white_check_mark: |  | :bulb: |  |
| [`no-positive-tabindex`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-positive-tabindex.md) | Ensures that the `tabindex` attribute is not positive |  |  | :bulb: |  |
| [`prefer-at-else`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-at-else.md) | Prefer using `@else` instead of a second `@if` with the opposite condition to reduce code and make it easier to read. |  | :wrench: |  |  |
| [`prefer-at-empty`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-at-empty.md) | Prefer using `@empty` with `@for` loops instead of a separate `@if` or `@else` block to reduce code and make it easier to read. |  | :wrench: |  |  |
| [`prefer-built-in-pipes`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-built-in-pipes.md) | Encourages the use of Angular built-in pipes (e.g. lowercase, uppercase, titlecase) instead of certain JavaScript methods in Angular templates. |  |  |  |  |
| [`prefer-contextual-for-variables`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-contextual-for-variables.md) | Ensures that contextual variables are used in @for blocks where possible instead of aliasing them. |  | :wrench: |  |  |
| [`prefer-control-flow`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-control-flow.md) | Ensures that the built-in control flow is used. |  |  |  |  |
| [`prefer-ngsrc`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-ngsrc.md) | Ensures ngSrc is used instead of src for img elements |  |  |  |  |
| [`prefer-template-literal`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-template-literal.md) | Ensure that template literals are used instead of concatenating strings or expressions. |  | :wrench: |  |  |
| [`role-has-required-aria`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/role-has-required-aria.md) | [Accessibility] Ensures elements with ARIA roles have all required properties for that role. |  |  | :bulb: | :accessibility: |
| [`table-scope`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/table-scope.md) | [Accessibility] Ensures that the `scope` attribute is only used on the `<th>` element |  | :wrench: |  | :accessibility: |
| [`use-track-by-function`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/use-track-by-function.md) | Ensures trackBy function is used |  |  |  |  |
| [`valid-aria`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/valid-aria.md) | [Accessibility] Ensures that correct ARIA attributes and respective values are used |  |  | :bulb: | :accessibility: |
<!-- prettier-ignore-end -->

<!-- end suggestions rule list -->

<!-- begin layout rule list -->

### Layout

**Key**

- :white_check_mark: = recommended
- :wrench: = fixable
- :bulb: = has suggestions
- :accessibility: = included in accessibility preset

<!-- prettier-ignore-start -->
| Rule | Description | :white_check_mark: | :wrench: | :bulb: | :accessibility: |
| --- | --- | --- | --- | --- | --- |
| [`attributes-order`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/attributes-order.md) | Ensures that HTML attributes and Angular bindings are sorted based on an expected order |  | :wrench: |  |  |
| [`prefer-self-closing-tags`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-self-closing-tags.md) | Ensures that self-closing tags are used for elements with a closing tag but no content. |  | :wrench: |  |  |
| [`prefer-static-string-properties`](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-static-string-properties.md) | Ensures that static string values use property assignment instead of property binding. |  | :wrench: |  |  |
<!-- prettier-ignore-end -->

<!-- end layout rule list -->

<!-- begin deprecated rule list -->

<!-- end deprecated rule list -->
