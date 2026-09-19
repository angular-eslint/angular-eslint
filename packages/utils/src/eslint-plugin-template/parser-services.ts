import type {
  ParseSourceSpan,
  TmplAstElement,
} from '@angular-eslint/bundled-angular-compiler';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

export interface TemplateParserServices {
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
): TemplateParserServices {
  ensureTemplateParser(context);
  return context.sourceCode.parserServices as unknown as TemplateParserServices;
}

/**
 * Utility for rule authors to ensure that their rule is correctly being used with @angular-eslint/template-parser
 * If @angular-eslint/template-parser is not the configured parser when the function is invoked it will throw
 */
export function ensureTemplateParser(
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
): void {
  const parserServices = context.sourceCode
    .parserServices as unknown as TemplateParserServices;

  if (
    !parserServices?.convertNodeSourceSpanToLoc ||
    !parserServices?.convertElementSourceSpanToLoc
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
