import { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { getAttributeValue } from './get-attribute-value';
import { getNearestNodeFrom } from './get-nearest-node-from';

/**
 * Whether an element content cannot be read by a screen reader. It can happen in the following situations:
 * - It has `display: none` or `visibility: hidden` style;
 * - It has `aria-hidden` or `hidden` attribute;
 * - It's an `<input type="hidden">`;
 * - One of its ancestors met one of the following situations above.
 */
export function isHiddenFromScreenReader(node: TmplAstElement): boolean {
  if (
    getNearestNodeFrom(node, isElementHiddenFromScreenReader) ||
    hasHiddenStaticStyles(node) ||
    hasHiddenStaticNgStyles(node) ||
    hasHiddenDynamicStylesWithLiteralValues(node) ||
    /**
     * We can't know if the element is hidden from screen reader if the value of `aria-hidden` or `hidden`
     * is set dynamically via an Angular property binding, so we just check for raw HTML truthiness here.
     */
    isHtmlTruthy(node, 'aria-hidden') ||
    isHtmlTruthy(node, 'hidden')
  ) {
    return true;
  }

  if (node.name.toUpperCase() !== 'INPUT') {
    return false;
  }

  const typeAttributeValue = getAttributeValue(node, 'type');
  return (
    typeof typeAttributeValue === 'string' &&
    typeAttributeValue.toUpperCase() === 'HIDDEN'
  );
}

/**
 * Whether an element has hidden static styles.
 * @example
 * ```html
 * <div style="display: none;"></div>
 * <div [style]="'visibility: hidden; color: red'"></div>
 * <div ngStyle="{ 'display': 'none' }"></div>
 * ```
 */
function hasHiddenStaticStyles(node: TmplAstElement): boolean {
  const styleAttributeValue = getAttributeValue(node, 'style');

  if (typeof styleAttributeValue !== 'string') {
    return false;
  }

  const rawStyleAttributeValue = styleAttributeValue.replace(/[\s'"]/g, '');
  return (
    rawStyleAttributeValue.includes('display:none') ||
    rawStyleAttributeValue.includes('visibility:hidden')
  );
}

/**
 * Whether an element has hidden dynamic styles with literal values.
 * @example
 * ```html
 * <div [style.display]="'none'"></div>
 * <div [visibility.hidden]="true"></div>
 * ```
 */
function hasHiddenDynamicStylesWithLiteralValues(
  node: TmplAstElement,
): boolean {
  return (
    getAttributeValue(node, 'style.display') === 'none' ||
    String(getAttributeValue(node, 'style.display.none')) === 'true' ||
    getAttributeValue(node, 'style.visibility') === 'hidden' ||
    String(getAttributeValue(node, 'style.visibility.hidden')) === 'true'
  );
}

/**
 * Whether an element has `ngStyle` attribute containing `display: none` or `visibility: hidden`.
 * @example
 * ```html
 * <div [ngStyle]="{ 'display': 'none' }"></div>
 * <div [ngStyle]="{ 'visibility': 'hidden' }"></div>
 * ```
 */
function hasHiddenStaticNgStyles(node: TmplAstElement): boolean {
  const ngStyleAttributeValue = getAttributeValue(node, 'ngStyle');
  return (
    ngStyleAttributeValue instanceof Map &&
    (ngStyleAttributeValue.get('display') === 'none' ||
      ngStyleAttributeValue.get('visibility') === 'hidden')
  );
}

/**
 * Whether an attribute is equals to empty string, `'true'` or `true`.
 * @example
 * ```html
 * <div hidden></div>
 * <div [hidden]="true"></div>
 * <div aria-hidden=""></div>
 * <div aria-hidden="true"></div>
 * ```
 */
function isHtmlTruthy(node: TmplAstElement, attributeName: string) {
  const attributeValue = getAttributeValue(node, attributeName);
  return attributeValue === '' || String(attributeValue) === 'true';
}

function isElementHiddenFromScreenReader(
  node: unknown,
): node is TmplAstElement {
  return node instanceof TmplAstElement && isHiddenFromScreenReader(node);
}
