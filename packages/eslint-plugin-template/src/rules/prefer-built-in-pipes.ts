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

const DEFAULT_DISALLOW_LIST = [
  'toLowerCase',
  'toUpperCase',
  'toLocaleLowerCase',
  'toLocaleUpperCase',
] as const;

export type MessageIds = 'preferBuiltInPipes';
export const RULE_NAME = 'prefer-built-in-pipes';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Encourages the use of Angular built-in pipes (e.g. lowercase, uppercase, titlecase) instead of certain JavaScript methods in Angular templates.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          disallowList: {
            items: { type: 'string' },
            type: 'array',
            uniqueItems: true,
            description:
              'Additional method names to disallow (defaults include common case/title casing helpers)',
          },
          allowInOutputHandlers: {
            type: 'boolean',
            description:
              'Whether to allow these method calls inside output event handlers',
          },
        },
        type: 'object',
      },
    ],
    messages: {
      preferBuiltInPipes:
        'Avoid using method "{{ methodName }}" in templates. Prefer the Angular built-in pipes instead (e.g. lowercase, uppercase, titlecase).',
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
        if (!isDisallowedMethod(node.receiver, methodsToDisallow)) {
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
          messageId: 'preferBuiltInPipes',
          data: {
            methodName,
          },
        });
      },
    };
  },
});

function isDisallowedMethod(
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

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Angular provides built-in pipes for common string transformations (lowercase, uppercase, titlecase) that are more efficient than calling JavaScript methods directly in templates. Pipes are pure by default, meaning Angular only recalculates them when inputs change, whereas method calls in templates run on every change detection cycle. For example, {{ name.toLowerCase() }} runs toLowerCase() repeatedly during change detection, while {{ name | lowercase }} only transforms the string when name changes. Using pipes also makes templates more declarative and idiomatic. The rule can be configured to allow method calls in event handlers like (click) where purity is not a concern. By default, the rule flags toLowerCase, toUpperCase, toLocaleLowerCase, and toLocaleUpperCase, but can be extended to other methods.',
};
