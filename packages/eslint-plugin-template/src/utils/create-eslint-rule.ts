import type { ParseSourceSpan, TmplAstElement } from '@angular/compiler';
import type {
  ESLintUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
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
    `https://github.com/angular-eslint/angular-eslint/blob/master/packages/eslint-plugin/docs/rules/${ruleName}.md`,
);

interface ParserServices {
  convertNodeSourceSpanToLoc: (
    sourceSpan: ParseSourceSpan,
  ) => TSESTree.SourceLocation;
  convertElementSourceSpanToLoc: (
    context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
    node: TmplAstElement,
  ) => TSESTree.SourceLocation;
}

export function getTemplateParserServices(
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
): ParserServices {
  ensureTemplateParser(context);
  return context.parserServices as unknown as ParserServices;
}

/**
 * Utility for rule authors to ensure that their rule is correctly being used with @angular-eslint/template-parser
 * If @angular-eslint/template-parser is not the configured parser when the function is invoked it will throw
 */
export function ensureTemplateParser(
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
): void {
  if (
    !(context.parserServices as unknown as ParserServices)
      ?.convertNodeSourceSpanToLoc ||
    !(context.parserServices as unknown as ParserServices)
      ?.convertElementSourceSpanToLoc
  ) {
    /**
     * The user needs to have configured "parser" in their eslint config and set it
     * to @angular-eslint/template-parser
     */
    throw new Error(
      "You have used a rule which requires '@angular-eslint/template-parser' to be used as the 'parser' in your ESLint config.",
    );
  }
}
