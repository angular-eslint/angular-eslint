import type { AST, Call } from '@angular-eslint/bundled-angular-compiler';
import { ensureTemplateParser } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getNearestNodeFrom } from '../utils/get-nearest-node-from';
import { isBoundEvent } from '../utils/is-bound-event';
import { isASTWithName } from '../utils/is-ast-with-name';

export type Options = [
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

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Calling functions or methods in Angular templates (like {{ formatDate(date) }} or *ngIf="isValid()") causes those functions to execute on every change detection cycle. In a typical application, change detection runs very frequently—on every user interaction, HTTP request, or timer event. If a function is called in a template that renders a list of 100 items, it might execute 100 times per change detection cycle, potentially thousands of times per second. This can cause severe performance problems. Instead, use component properties, pipes (which cache results), or computed signals (in modern Angular). For example, instead of {{ formatDate(date) }}, use {{ date | date }} or create a computed signal or getter that calculates the value once per change detection cycle.',
};
