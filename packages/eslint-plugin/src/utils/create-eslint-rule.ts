import type { ESLintUtils } from '@typescript-eslint/experimental-utils';
import { applyDefault } from '@typescript-eslint/experimental-utils/dist/eslint-utils';

/**
 * We need to patch the RuleCreator in order to preserve the defaultOptions
 * to use as part of documentation generation.
 */
const patchedRuleCreator: typeof ESLintUtils.RuleCreator = (urlCreator) => {
  return function createRule({ name, meta, defaultOptions, create }) {
    return {
      meta: Object.assign(Object.assign({}, meta), {
        docs: Object.assign(Object.assign({}, meta.docs), {
          url: urlCreator(name),
        }),
      }),
      defaultOptions,
      create(context) {
        const optionsWithDefault = applyDefault(
          defaultOptions,
          context.options,
        );
        return create(context, optionsWithDefault);
      },
    };
  };
};

export const createESLintRule = patchedRuleCreator(
  (ruleName) =>
    `https://github.com/angular-eslint/angular-eslint/blob/master/packages/eslint-plugin-template/docs/rules/${ruleName}.md`,
);
