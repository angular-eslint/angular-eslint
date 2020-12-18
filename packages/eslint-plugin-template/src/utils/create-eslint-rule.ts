import { ESLintUtils, TSESLint } from '@typescript-eslint/experimental-utils';

export const createESLintRule = ESLintUtils.RuleCreator(() => ``);

interface SourceSpan {
  start: { line: number; col: any };
  end: { line: number; col: any };
}

interface ParserServices {
  defineTemplateBodyVisitor: Function;
  convertNodeSourceSpanToLoc: (sourceSpan: SourceSpan) => any;
  convertElementSourceSpanToLoc: <TMessageIds extends string>(
    context: TSESLint.RuleContext<TMessageIds, []>,
    node: any,
  ) => any;
}

export function getTemplateParserServices(context: any): ParserServices {
  if (
    !context.parserServices ||
    !(context.parserServices as any).defineTemplateBodyVisitor ||
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
  return context.parserServices;
}
