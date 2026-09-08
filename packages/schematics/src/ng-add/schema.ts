import type { TseslintPreset } from '../utils';

/**
 * Options available to the ng-add schematic.
 */
export interface Schema {
  /**
   * Skip installing dependencies after modifying package.json.
   */
  skipInstall?: boolean;
  /**
   * Enable rules that require type information by configuring
   * `parserOptions.projectService`. Implied by type-checked tseslintPreset values.
   */
  setParserOptionsProject?: boolean;
  /**
   * typescript-eslint shared config preset to extend in the generated ESLint config.
   */
  tseslintPreset?: TseslintPreset;
}
