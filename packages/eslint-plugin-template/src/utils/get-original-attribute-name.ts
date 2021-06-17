import type {
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstTextAttribute,
} from '@angular/compiler';
import { BindingType, ParsedEventType } from '@angular/compiler';

// TODO: It seems like `TmplAstBoundAttribute.type` is incorrectly typed at https://github.com/angular/angular/blob/2d1347b2ceef8c1e564c0f7cfe3a0a740b915e80/packages/compiler/src/render3/r3_ast.ts#L64.
type BoundAttribute = Omit<TmplAstBoundAttribute, 'type'> &
  Readonly<{
    __originalType: BindingType;
    type: 'BoundAttribute';
  }>;

// TODO: It seems like `TmplAstBoundEvent.type` is incorrectly typed at https://github.com/angular/angular/blob/2d1347b2ceef8c1e564c0f7cfe3a0a740b915e80/packages/compiler/src/render3/r3_ast.ts#L87.
type BoundEvent = Omit<TmplAstBoundEvent, 'type'> &
  Readonly<{
    __originalType: ParsedEventType;
    type: 'BoundEvent';
  }>;

/**
 * Returns the original attribute name, respecting its `__originalType`.
 * @example
 * ```html
 * <!-- The AST returns the name as "display", but we want the original name: "style.display.none" -->
 * <div [style.display.none]="test"></div>
 * ```
 */
export function getOriginalAttributeName(
  attribute:
    | BoundAttribute
    | BoundEvent
    | TmplAstTextAttribute
    | { name: string },
): string {
  if ('type' in attribute) {
    if (attribute.type === 'BoundAttribute') {
      switch (attribute.__originalType) {
        case BindingType.Class:
          return `class.${attribute.name}`;
        case BindingType.Style:
          return `style.${attribute.name}${
            attribute.unit ? '.' + attribute.unit : ''
          }`;
        case BindingType.Animation:
          return `@${attribute.name}`;
      }
    } else if (attribute.type === 'BoundEvent') {
      if (attribute.__originalType === ParsedEventType.Animation) {
        return `@${attribute.name}${
          attribute.phase ? '.' + attribute.phase : ''
        }`;
      }

      if (attribute.target) {
        return `${attribute.target}:${attribute.name}`;
      }
    }
  }

  return attribute.name;
}
