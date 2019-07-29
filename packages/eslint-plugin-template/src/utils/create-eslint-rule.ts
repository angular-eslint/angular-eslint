import {
  ESLintUtils,
  TSESLint,
  ParserServices,
} from '@typescript-eslint/experimental-utils';

export const createESLintRule = ESLintUtils.RuleCreator(() => ``);

interface SourceSpan {
  start: { line: number; col: any };
  end: { line: number; col: any };
}

declare module '@typescript-eslint/experimental-utils' {
  export interface ParserServices {
    defineTemplateBodyVisitor: Function;
    convertNodeSourceSpanToLoc: (sourceSpan: SourceSpan) => any;
  }
}

export function getTemplateParserServices<
  TMessageIds extends string,
  TOptions extends any[]
>(context: TSESLint.RuleContext<TMessageIds, TOptions>): ParserServices {
  if (
    !context.parserServices ||
    !(context.parserServices as any).defineTemplateBodyVisitor
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
