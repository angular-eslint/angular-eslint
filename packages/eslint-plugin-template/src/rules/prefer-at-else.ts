import {
  AST,
  ASTWithSource,
  Binary,
  Node,
  PrefixNot,
  TmplAstIfBlock,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { areEquivalentASTs } from '../utils/are-equivalent-asts';
import { ReportFixFunction } from '@typescript-eslint/utils/ts-eslint';
import { isLengthRead, isZero } from '../utils/ast-types';
import { toRange, toZeroLengthRange } from '../utils/to-range';

export type Options = [];
export type MessageIds = 'preferAtElse';
export const RULE_NAME = 'prefer-at-else';

const OPPOSITE_OPERATORS: ReadonlyMap<string, string> = new Map([
  ['', '!'],
  ['!', ''],
  ['<', '>='],
  ['>', '<='],
  ['<=', '>'],
  ['>=', '<'],
  ['==', '!='],
  ['!=', '=='],
  ['===', '!=='],
  ['!==', '==='],
]);

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Prefer using `@else` instead of a second `@if` with the opposite condition to reduce code and make it easier to read.',
    },
    schema: [],
    messages: {
      preferAtElse: 'Prefer using `@else` instead of a second `@if` clause.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const previousNodeStack: (IfNodeInfo | undefined)[] = [undefined];

    function getFix(
      previous: IfNodeInfo,
      current: IfNodeInfo,
    ): ReportFixFunction | null {
      const previousIf = previous.node.branches[0];
      const currentIf = current.node.branches[0];
      const currentElse = current.node.branches.at(1);
      const previousElse = previous.node.branches.at(1);

      // If the current `@if` block uses an alias, then
      // we won't fix it because the alias won't exist
      // in the `@else` block of the previous `@if` block.
      if (currentIf.expressionAlias) {
        return null;
      }

      return function* fix(fixer) {
        if (!previousElse) {
          // The previous `@if` block has no `@else` block,
          // so we can turn the current `@if` block into one.
          yield fixer.replaceTextRange(
            [
              currentIf.sourceSpan.start.offset,
              currentIf.startSourceSpan.end.offset,
            ],
            '@else {',
          );

          if (currentElse && currentIf.endSourceSpan) {
            // The current node has an `@else` block. Since the current
            // `@if` block is the opposite of the previous `@if` block,
            // the `@else` block would be rendered when the previous
            // `@if` is also rendered. We can achieve the same result
            // by putting the contents of the current `@else` block
            // at the end of the previous `@if` block.
            const elseContents = context.sourceCode.text.slice(
              currentElse.startSourceSpan.end.offset,
              currentElse.sourceSpan.end.offset - 1,
            );

            yield fixer.insertTextAfterRange(
              toZeroLengthRange(previousIf.sourceSpan.end.offset - 1),
              elseContents,
            );

            yield fixer.removeRange([
              currentIf.endSourceSpan.end.offset,
              currentElse.sourceSpan.end.offset,
            ]);
          }
        } else {
          // The previous `@if` block already has an `@else` block.
          // Since the current `@if` block is the opposite of the previous
          // `@if` block, the previous `@else` block and the current `@if`
          // block would both be rendered. We can achieve the same result
          // with a single block by putting the contents of the current
          // `@if` block at the end of the previous `@else` block.
          const ifContents = context.sourceCode.text.slice(
            currentIf.startSourceSpan.end.offset,
            currentIf.sourceSpan.end.offset - 1,
          );

          yield fixer.insertTextAfterRange(
            toZeroLengthRange(previousElse.sourceSpan.end.offset - 1),
            ifContents,
          );

          yield fixer.removeRange(toRange(currentIf.sourceSpan));
        }
      };
    }

    return {
      // We need to visit `@if` blocks, but we also
      // need to know if there are any nodes immediately
      // before them, so we need to visit all nodes.
      '*'(node: Node) {
        const current = getIfNodeInfo(node);

        if (current) {
          const previous = previousNodeStack.at(-1);
          if (previous && canCombine(previous, current)) {
            context.report({
              loc: parserServices.convertNodeSourceSpanToLoc(
                current.node.nameSpan,
              ),
              messageId: 'preferAtElse',
              fix: getFix(previous, current),
            });
          }
        }

        // Record this current node as the previous node so that
        // we can get the info when we look at the next sibling.
        previousNodeStack[previousNodeStack.length - 1] = current;

        // We are about to visit the children of this node,
        // so push a new "previous node info" onto the stack.
        // The previous node of the first child is undefined.
        previousNodeStack.push(undefined);
      },
      '*:exit'() {
        // We've finished visiting the children of this node,
        // so pop the "previous node info" off the stack.
        previousNodeStack.pop();
      },
    };
  },
});

function getIfNodeInfo(node: Node): IfNodeInfo | undefined {
  // We only care about `@if` blocks with one or two branches.
  // Any more branches and it would have to contain an
  // `@else if` branch, which we cannot handle.
  if (
    node instanceof TmplAstIfBlock &&
    node.branches.length >= 1 &&
    node.branches[0].expression instanceof ASTWithSource &&
    node.branches.length <= 2
  ) {
    // When there are two branches, the second
    // branch cannot have an expression, otherwise it
    // would be an `@else if` block, which we cannot
    // combine with a previous or next `@if` block.
    if (node.branches.length == 1 || !node.branches[1].expression) {
      const ast = node.branches[0].expression.ast;
      if (ast instanceof Binary) {
        return { node, lhs: ast.left, rhs: ast.right, operator: ast.operation };
      }

      if (ast instanceof PrefixNot) {
        return { node, lhs: ast.expression, rhs: undefined, operator: '!' };
      }

      return { node, lhs: ast, rhs: undefined, operator: '' };
    }
  }

  return undefined;
}

function canCombine(previous: IfNodeInfo, current: IfNodeInfo): boolean {
  if (OPPOSITE_OPERATORS.get(previous.operator) === current.operator) {
    if (areEquivalentASTs(previous.lhs, current.lhs)) {
      if (previous.rhs === undefined && current.rhs === undefined) {
        return true;
      }
      if (
        previous.rhs &&
        current.rhs &&
        areEquivalentASTs(previous.rhs, current.rhs)
      ) {
        return true;
      }
    }
  }

  // Arrays cannot have a length less than zero, so there is
  // a special case we can look for. If the previous node
  // was an "is empty" and the current node is "is not empty"
  // (or vice versa), then we can consider them opposites.
  if (
    (isEmptyLength(previous) && isNonEmptyLength(current)) ||
    (isNonEmptyLength(previous) && isEmptyLength(current))
  ) {
    return true;
  }

  return false;
}

function isEmptyLength(node: IfNodeInfo): boolean {
  if (node.rhs !== undefined) {
    if (node.operator === '==' || node.operator === '===') {
      if (isLengthRead(node.lhs) && isZero(node.rhs)) {
        return true;
      }
      if (isZero(node.lhs) && isLengthRead(node.rhs)) {
        return true;
      }
    }
  }

  return false;
}

function isNonEmptyLength(node: IfNodeInfo): boolean {
  if (node.rhs !== undefined) {
    // We don't need to check for the inequality operators because
    // they would be handled by the standard "are opposite" check.
    if (isLengthRead(node.lhs) && node.operator === '>' && isZero(node.rhs)) {
      return true;
    }
    if (isZero(node.lhs) && node.operator === '<' && isLengthRead(node.rhs)) {
      return true;
    }
  }

  return false;
}

interface IfNodeInfo {
  readonly node: TmplAstIfBlock;
  readonly lhs: AST;
  readonly rhs: AST | undefined;
  readonly operator: string;
}
