import type {
  ParserServices,
  TSESLint,
} from '@typescript-eslint/experimental-utils';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';

export const createESLintRule = ESLintUtils.RuleCreator(
  (_ruleName) => `https://github.com/angular-eslint/angular-eslint`,
);

type RequiredParserServices = {
  [k in keyof ParserServices]: Exclude<ParserServices[k], undefined>;
};

/**
 * TODO: Expose via @typescript-eslint/experimental-utils
 */
export function getParserServices<
  TMessageIds extends string,
  TOptions extends any[]
>(
  context: TSESLint.RuleContext<TMessageIds, TOptions>,
): RequiredParserServices {
  if (
    !context.parserServices ||
    !context.parserServices.program ||
    !context.parserServices.esTreeNodeToTSNodeMap
  ) {
    /**
     * The user needs to have configured "project" in their parserOptions
     * for @typescript-eslint/parser
     */
    throw new Error(
      'You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.',
    );
  }
  return context.parserServices as RequiredParserServices;
}

type NodeMaps = {
  [k in keyof Pick<
    ParserServices,
    'esTreeNodeToTSNodeMap' | 'tsNodeToESTreeNodeMap'
  >]: NonNullable<ParserServices[k]>;
};

/**
 * TODO: Expose via @typescript-eslint/experimental-utils
 */
export function getNodeMaps<
  _TMessageIds extends string,
  _TOptions extends any[]
>(
  context: any, // RuleContext<TMessageIds, TOptions>
): NodeMaps {
  if (
    !context.parserServices ||
    !context.parserServices.esTreeNodeToTSNodeMap ||
    !context.parserServices.tsNodeToESTreeNodeMap
  ) {
    /**
     * The user needs to have either configured "project" or "preserveNodeMaps" in their parserOptions
     * for @typescript-eslint/parser
     */
    throw new Error(
      'You have used a rule which requires AST node maps to be preserved during conversion. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser, or set "parserOptions.preserveNodeMaps" to `true`.',
    );
  }
  return {
    esTreeNodeToTSNodeMap: context.parserServices.esTreeNodeToTSNodeMap,
    tsNodeToESTreeNodeMap: context.parserServices.tsNodeToESTreeNodeMap,
  };
}
