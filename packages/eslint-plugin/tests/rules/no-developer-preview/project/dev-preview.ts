/* eslint-disable */

export function regularFunction() {}
/** @developerPreview */
export function developerPreviewFunction() {}

export class RegularClass {}
/** @developerPreview */
export class DeveloperPreviewClass {}

export const regularConst = 'regular';
/** @developerPreview */
export const developerPreviewConst = 'developerPreview';

export interface SomeInterface {
  regularItem?: string;
  /** @developerPreview */
  developerPreviewItem?: string;
}
