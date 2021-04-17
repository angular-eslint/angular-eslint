import type { AST } from '@angular/compiler';
import {
  Conditional,
  MethodCall,
  SafeMethodCall,
  TmplAstBoundEvent,
} from '@angular/compiler';
import { getNearestNodeFrom } from '../utils/get-nearest-node-from';
import {
  createESLintRule,
  ensureTemplateParser,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noCallExpression';
export const RULE_NAME = 'no-call-expression';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows calling expressions in templates, except for output handlers',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noCallExpression: 'Avoid calling expressions in templates',
    },
  },
  defaultOptions: [],
  create(context) {
    ensureTemplateParser(context);
    const sourceCode = context.getSourceCode();

    function report({ sourceSpan: { end, start } }: AST) {
      context.report({
        messageId: 'noCallExpression',
        loc: {
          start: sourceCode.getLocFromIndex(start),
          end: sourceCode.getLocFromIndex(end),
        },
      });
    }

    return {
      'Conditional, MethodCall[name!="$any"], SafeMethodCall'(
        conditionalOrMethodCall: Conditional | MethodCall | SafeMethodCall,
      ) {
        const isChildOfBoundEvent = !!getNearestNodeFrom(
          conditionalOrMethodCall,
          isBoundEvent,
        );

        if (isChildOfBoundEvent) return;

        if (!(conditionalOrMethodCall instanceof Conditional)) {
          report(conditionalOrMethodCall);

          return;
        }

        const { falseExp, trueExp } = conditionalOrMethodCall;

        if (isMethodCall(falseExp)) report(falseExp);

        if (isMethodCall(trueExp)) report(trueExp);
      },
    };
  },
});

function isBoundEvent(node: unknown): node is TmplAstBoundEvent {
  return node instanceof TmplAstBoundEvent;
}

function isMethodCall(node: unknown): node is MethodCall | SafeMethodCall {
  return node instanceof MethodCall || node instanceof SafeMethodCall;
}
