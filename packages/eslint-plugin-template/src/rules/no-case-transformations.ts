import {
  PropertyRead,
  type AST,
  type Call,
} from '@angular-eslint/bundled-angular-compiler';
import { ensureTemplateParser } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getNearestNodeFrom } from '../utils/get-nearest-node-from';
import { isBoundEvent } from '../utils/is-bound-event';
import { isASTWithName } from '../utils/is-ast-with-name';

export type Options = [
  {
    readonly disallowList?: readonly string[];
    readonly allowInOutputHandlers?: boolean;
  },
];
export type MessageIds = 'noCaseTransformations';
export const RULE_NAME = 'no-case-transformations';

const DEFAULT_DISALLOW_LIST = [
  'toLowerCase',
  'toUpperCase',
  'toLocaleLowerCase',
  'toLocaleUpperCase',
] as const;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows the use of case transformation methods in Angular templates',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          disallowList: {
            items: { type: 'string' },
            type: 'array',
            uniqueItems: true,
            description: 'List of case transformation methods to disallow',
          },
          allowInOutputHandlers: {
            type: 'boolean',
            description:
              'Whether to allow case transformation methods in output event handlers',
          },
        },
        type: 'object',
      },
    ],
    messages: {
      noCaseTransformations:
        'Avoid using case transformation method "{{ methodName }}" in templates. Consider using Angular pipes like "uppercase" or "lowercase" instead.',
    },
  },
  defaultOptions: [
    {
      disallowList: [...DEFAULT_DISALLOW_LIST],
      allowInOutputHandlers: true,
    },
  ],
  create(context, [{ disallowList, allowInOutputHandlers }]) {
    ensureTemplateParser(context);
    const sourceCode = context.sourceCode;
    const methodsToDisallow = disallowList || [...DEFAULT_DISALLOW_LIST];

    return {
      Call(node: Call) {
        if (!isDisallowedCaseTransformation(node.receiver, methodsToDisallow)) {
          return;
        }

        if (allowInOutputHandlers) {
          const isChildOfBoundEvent = Boolean(
            getNearestNodeFrom(node, isBoundEvent),
          );
          if (isChildOfBoundEvent) {
            return;
          }
        }

        const methodName = getMethodName(node.receiver);
        const {
          sourceSpan: { start, end },
        } = node.receiver;

        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
          messageId: 'noCaseTransformations',
          data: {
            methodName,
          },
        });
      },
    };
  },
});

function isDisallowedCaseTransformation(
  ast: AST & { name?: string },
  disallowList: readonly string[],
): boolean {
  return (
    isASTWithName(ast) &&
    ast instanceof PropertyRead &&
    disallowList.includes(ast.name)
  );
}

function getMethodName(ast: AST & { name?: string }): string {
  return isASTWithName(ast) ? ast.name : 'unknown';
}
