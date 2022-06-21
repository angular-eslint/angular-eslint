import type {
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import { TmplAstBoundEvent } from '@angular-eslint/bundled-angular-compiler';

/**
 * Returns the original attribute name.
 * @example
 * ```html
 * <div [style.display.none]="test"></div> <!-- Instead of "display", "style.display.none" -->
 * <div [attr.role]="'none'"></div> <!-- Instead of "attr.role", "role" -->
 * <div ([ngModel])="test"></div> <!-- Instead of "ngModel", "ngModelChange" -->
 * <div (@fade.start)="handle()"></div> <!-- Instead of "fade", "@fade.start" -->
 * ```
 */
export function getOriginalAttributeName(
  attribute: TmplAstBoundAttribute | TmplAstBoundEvent | TmplAstTextAttribute,
): string {
  const { details } = attribute.keySpan ?? {};

  if (!details) {
    return attribute.name;
  }

  if (attribute instanceof TmplAstBoundEvent) {
    return isTwoWayDataBinding(attribute) ? attribute.name : details;
  }

  return details.replace('attr.', '');
}

function isTwoWayDataBinding({
  keySpan: { details },
  name,
}: TmplAstBoundEvent): boolean {
  return name === `${details}Change`;
}
