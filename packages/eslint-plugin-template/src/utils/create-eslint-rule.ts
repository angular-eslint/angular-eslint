import { ESLintUtils, TSESLint } from '@typescript-eslint/experimental-utils';

export const createESLintRule = ESLintUtils.RuleCreator(() => ``);

interface SourceSpan {
  start: { line: number; col: any };
  end: { line: number; col: any };
}

interface ParserServices {
  convertNodeSourceSpanToLoc: (sourceSpan: SourceSpan) => any;
  convertElementSourceSpanToLoc: <TMessageIds extends string>(
    context: TSESLint.RuleContext<TMessageIds, []>,
    node: any,
  ) => any;
}

export function getTemplateParserServices(context: any): ParserServices {
  ensureTemplateParser(context);
  return context.parserServices;
}

/**
 * Utility for rule authors to ensure that their rule is correctly being used with @angular-eslint/template-parser
 * If @angular-eslint/template-parser is not the configured parser when the function is invoked it will throw
 */
export function ensureTemplateParser(
  context: TSESLint.RuleContext<string, []>,
) {
  if (
    !context.parserServices ||
    !(context.parserServices as any).convertNodeSourceSpanToLoc ||
    (!context.parserServices as any).convertElementSourceSpanToLoc
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
