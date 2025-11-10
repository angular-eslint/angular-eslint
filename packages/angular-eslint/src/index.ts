import tsPluginBase from '@angular-eslint/eslint-plugin';
import templatePluginBase from '@angular-eslint/eslint-plugin-template';
import * as templateParserBase from '@angular-eslint/template-parser';
import type { Plugin as ESLintPlugin } from '@eslint/core';
import type { TSESLint } from '@typescript-eslint/utils';
import { parser } from 'typescript-eslint';

import templateAccessibilityConfig from './configs/template-accessibility';
import templateAllConfig from './configs/template-all';
import templateRecommendedConfig from './configs/template-recommended';
import tsAllConfig from './configs/ts-all';
import tsRecommendedConfig from './configs/ts-recommended';

const templateParser: TSESLint.FlatConfig.Parser = {
  meta: templateParserBase.meta,
  parseForESLint: templateParserBase.parseForESLint,
};

/*
NOTE: Comment and approach taken from typescript-eslint:

We could build a plugin object here without the `configs` key - but if we do
that then we create a situation in which
```
require('angular-eslint').tsPlugin !== require('@angular-eslint/eslint-plugin')
```

This is bad because it means that 3rd party configs would be required to use
`angular-eslint` or else they would break a user's config if the user either
used `angular.configs.recommended` et al. or
```
{
  plugins: {
    '@angular-eslint': angular.tsPlugin,
  },
}
```

This might be something we could consider okay (e.g. 3rd party flat configs must
use our new package); however legacy configs consumed via `@eslint/eslintrc`
would never be able to satisfy this constraint and thus users would be blocked
from using them.
*/

/**
 * Make the plugins compatible with both ESLint's Plugin type and typescript-eslint's
 * FlatConfig.Plugin type through type assertion.
 *
 * This is covered by a type compatibility test in tests/type-compatibility.test.ts
 */
type CompatiblePlugin = Omit<ESLintPlugin, 'configs'> & {
  configs?: never;
};
const tsPlugin = tsPluginBase as unknown as CompatiblePlugin;
const templatePlugin = templatePluginBase as unknown as CompatiblePlugin;

const configs = {
  tsAll: tsAllConfig(tsPlugin, parser),
  tsRecommended: tsRecommendedConfig(tsPlugin, parser),
  templateAll: templateAllConfig(templatePlugin, templateParser),
  templateRecommended: templateRecommendedConfig(
    templatePlugin,
    templateParser,
  ),
  templateAccessibility: templateAccessibilityConfig(
    templatePlugin,
    templateParser,
  ),
};

// Export more succinct alias for us in user flat config files
const processInlineTemplates =
  templatePlugin.processors?.['extract-inline-html'];

/*
// eslint-disable-next-line import/no-default-export --
we do both a default and named exports to allow people to use this package from
both CJS and ESM in very natural ways.
*/
export default {
  configs,
  tsPlugin,
  templateParser,
  templatePlugin,
  processInlineTemplates,
};
export {
  configs,
  templateParser,
  templatePlugin,
  tsPlugin,
  processInlineTemplates,
};
