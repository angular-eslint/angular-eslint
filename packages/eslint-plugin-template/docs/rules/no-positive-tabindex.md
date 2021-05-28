# Ensures that the `tabindex` attribute is not positive (no-positive-tabindex)

## Rule Details

It is recommended to avoid positive values for the tabindex attribute because it is brittle (any focusable elements added to the page without an explicit tabindex value greater than zero will come last in the tab order) and can easily result in a page which is extremely difficult to navigate, causing accessibility problems.

Examples of **incorrect** code for this rule:

```html
<span tabindex="4">foo</span>
<span tabindex="3">bar</span>
<span [attr.tabindex]="2">baz</span>
<span [tabindex]="1">test</span>
```

Examples of **correct** code for this rule:

```html
<span tabindex="0">baz</span>
<span tabindex="-1">test</span>
<span [attr.tabindex]="0">foo</span>
<span [tabindex]="-1">bar</span>
```

## Accessibility guidelines

- [WCAG 2.4.3](https://www.w3.org/WAI/WCAG21/Understanding/focus-order)

### Resources

- [Chrome Audit Rules, AX_FOCUS_03](https://github.com/GoogleChrome/accessibility-developer-tools/wiki/Audit-Rules#ax_focus_03)
