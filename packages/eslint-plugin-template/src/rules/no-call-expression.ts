import type { AST, Call } from '@angular-eslint/bundled-angular-compiler';
import { TmplAstBoundEvent } from '@angular-eslint/bundled-angular-compiler';
import { ensureTemplateParser } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getNearestNodeFrom } from '../utils/get-nearest-node-from';

type Options = [
  {
    readonly allowList?: readonly string[];
    readonly allowPrefix?: string;
    readonly allowSuffix?: string;
  },
];
export type MessageIds = 'noCallExpression';
export const RULE_NAME = 'no-call-expression';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows calling expressions in templates, except for output handlers',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowList: {
            items: { type: 'string' },
            type: 'array',
            uniqueItems: true,
          },
          allowPrefix: { type: 'string' },
          allowSuffix: { type: 'string' },
        },
        type: 'object',
      },
    ],
    messages: {
      noCallExpression: 'Avoid calling expressions in templates',
    },
  },
  defaultOptions: [
    { allowList: [], allowPrefix: undefined, allowSuffix: undefined },
  ],
  create(context, [{ allowList, allowPrefix, allowSuffix }]) {
    ensureTemplateParser(context);
    const sourceCode = context.sourceCode;

    return {
      'Call[receiver.name!="$any"]'(node: Call) {
        const isChildOfBoundEvent = Boolean(
          getNearestNodeFrom(node, isBoundEvent),
        );

        if (
          isChildOfBoundEvent ||
          isCallNameInAllowList(node.receiver, allowList)
        ) {
          return;
        }

        if (
          allowPrefix &&
          isASTWithName(node.receiver) &&
          node.receiver.name.startsWith(allowPrefix)
        ) {
          return;
        }

        if (
          allowSuffix &&
          isASTWithName(node.receiver) &&
          node.receiver.name.endsWith(allowSuffix)
        ) {
          return;
        }

        const {
          sourceSpan: { start, end },
        } = node;
        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
          messageId: 'noCallExpression',
        });
      },
    };
  },
});

function isBoundEvent(node: unknown): node is TmplAstBoundEvent {
  return node instanceof TmplAstBoundEvent;
}

function isASTWithName(
  ast: AST & { name?: string },
): ast is AST & { name: string } {
  return !!ast.name;
}

function isCallNameInAllowList(
  ast: AST & { name?: string },
  allowList?: readonly string[],
): boolean | undefined {
  return (
    allowList &&
    allowList.length > 0 &&
    isASTWithName(ast) &&
    allowList.indexOf(ast.name) > -1
  );
}
