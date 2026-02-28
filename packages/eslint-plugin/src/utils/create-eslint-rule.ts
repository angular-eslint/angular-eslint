import { ESLintUtils } from '@typescript-eslint/utils';

export interface RuleDocs {
  recommended?: string;
}

/**
 * We need to patch the RuleCreator in order to preserve the defaultOptions
 * to use as part of documentation generation.
 */
const patchedRuleCreator: typeof ESLintUtils.RuleCreator = (urlCreator) => {
  return function createRule({ name, meta, defaultOptions, create }) {
    const resolvedDefaultOptions = (defaultOptions ?? []) as NonNullable<
      typeof defaultOptions
    >;

    return {
      name,
      meta: Object.assign(Object.assign({}, meta), {
        docs: Object.assign(Object.assign({}, meta.docs), {
          url: urlCreator(name),
        }),
      }),
      defaultOptions: resolvedDefaultOptions,
      create(context) {
        const optionsWithDefault = ESLintUtils.applyDefault(
          resolvedDefaultOptions,
          context.options,
        );
        return create(context, optionsWithDefault);
      },
    };
  };
};

patchedRuleCreator.withoutDocs = ESLintUtils.RuleCreator.withoutDocs;

export const createESLintRule = patchedRuleCreator<RuleDocs>(
  (ruleName) =>
    `https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/${ruleName}.md`,
);
