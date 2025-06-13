/* eslint-disable */

export function regularFunction() {}
/** @experimental */
export function experimentalFunction() {}

export class RegularClass {}
/** @experimental */
export class ExperimentalClass {}

export const regularConst = 'regular';
/** @experimental */
export const experimentalConst = 'experimental';

export interface SomeInterface {
  regularItem?: string;
  /** @experimental */
  experimentalItem?: string;
}
