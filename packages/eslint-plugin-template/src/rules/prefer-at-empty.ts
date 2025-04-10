import {
  AST,
  ASTWithSource,
  Binary,
  LiteralPrimitive,
  Node,
  ParseSourceSpan,
  PrefixNot,
  PropertyRead,
  TmplAstForLoopBlock,
  TmplAstIfBlock,
  TmplAstIfBlockBranch,
  TmplAstText,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { areEquivalentASTs } from '../utils/are-equivalent-asts';

export type Options = [];
export type MessageIds = 'preferAtEmpty';
export const RULE_NAME = 'prefer-at-empty';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Prefer using `@empty` with `@for` loops instead of a separate `@if` or `@else` block.',
    },
    schema: [],
    messages: {
      preferAtEmpty: 'Prefer using `@for (...) {...} @empty {...}`.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const previousNodeStack: (NodeInfo | undefined)[] = [undefined];

    function getOnlyForBlock(
      node: TmplAstIfBlockBranch,
    ): TmplAstForLoopBlock | undefined {
      let forBlock: TmplAstForLoopBlock | undefined;

      // Find the only `@for` block in the children,
      // ignoring any text nodes that are only whitespace.
      for (const child of node.children) {
        if (child instanceof TmplAstForLoopBlock) {
          if (forBlock) {
            return undefined;
          }
          forBlock = child;
        } else if (child instanceof TmplAstText) {
          // The `value` property contains the HTML-decoded
          // value, so we need to look at the raw source code
          // to see if the content is only whitespace.
          if (
            context.sourceCode.text
              .slice(child.sourceSpan.start.offset, child.sourceSpan.end.offset)
              .trim() !== ''
          ) {
            return undefined;
          }
        } else {
          return undefined;
        }
      }

      return forBlock;
    }

    function checkFor(
      forInfo: ForNodeInfo,
      previous: NodeInfo | undefined,
    ): void {
      // If the `@for` block is immediately preceded by an "if empty"
      // block for the same collection, then that `@if` block can
      // be moved into the `@empty` block.
      if (previous?.kind === 'if-empty') {
        if (areEquivalentASTs(forInfo.collection, previous.collection)) {
          const branch = previous.node.branches[0];
          const branchEnd = branch.endSourceSpan;
          context.report({
            loc: parserServices.convertNodeSourceSpanToLoc(
              previous.node.nameSpan,
            ),
            messageId: 'preferAtEmpty',
            fix: branchEnd
              ? function* (fixer) {
                  // Remove the entire `@if` block.
                  yield fixer.removeRange(toRange(previous.node.sourceSpan));

                  if (forInfo.node.empty) {
                    // There is already an `@empty` block. The contents of the
                    // `@if` block and the contents of the `@empty` block would
                    // both be shown in the collection is empty, so we need to
                    // combine the two blocks. The `@if` block would be rendered
                    // first, so it needs to be inserted before the existing
                    // contents of the `@empty` block.
                    yield fixer.insertTextAfterRange(
                      [
                        forInfo.node.empty.nameSpan.end.offset,
                        forInfo.node.empty.startSourceSpan.end.offset,
                      ],
                      context.sourceCode.text.slice(
                        branch.startSourceSpan.end.offset,
                        // The end offset is after the closing `}`, so we
                        // need to subtract one to ensure it's not included.
                        branchEnd.end.offset - 1,
                      ),
                    );
                  } else {
                    // Take the contents of the `@if` block and move
                    // it into an `@empty` block after the `@for` block.
                    yield fixer.insertTextAfterRange(
                      toRange(forInfo.node.sourceSpan),
                      ` @empty {${context.sourceCode.text.slice(
                        branch.startSourceSpan.end.offset,
                        branchEnd.end.offset,
                      )}`,
                    );
                  }
                }
              : undefined,
          });
        }
      }
    }

    function checkIfEmpty(
      ifInfo: IfNodeInfo,
      previous: NodeInfo | undefined,
    ): void {
      if (!previous) {
        return;
      }

      // If the `@if` block is immediately preceded by a `@for`
      // block for the same collection, then that `@if` block
      // can be moved into the `@empty` block.
      switch (previous.kind) {
        case 'for':
          if (areEquivalentASTs(ifInfo.collection, previous.collection)) {
            // The `@if` block can be moved into the `@for` block,
            // so report the problem on the `@if` block.
            context.report({
              loc: parserServices.convertNodeSourceSpanToLoc(
                ifInfo.node.nameSpan,
              ),
              messageId: 'preferAtEmpty',
              fix: function* (fixer) {
                if (previous.node.empty?.endSourceSpan) {
                  // There is already an `@empty` block. The contents of
                  // the `@empty` block and the `@if` block would both be
                  // rendered. The `@empty` block would appear first, so
                  // we need to move the contents of the `@if` block after
                  // the existing contents of the `@empty` block. This can
                  // easily be achieved by removing the closing brace of the
                  // `@empty` block and removing the `@if` statement.
                  yield fixer.removeRange(
                    toRange(previous.node.empty.endSourceSpan),
                  );
                  yield fixer.removeRange(toRange(ifInfo.node.startSourceSpan));
                } else {
                  // There is not already an `@empty` block, so
                  // we can create one by replacing the entire
                  // `@if (...) {` segment with `@empty {`.
                  yield fixer.replaceTextRange(
                    toRange(ifInfo.node.startSourceSpan),
                    '@empty {',
                  );
                }
              },
            });
          }
          break;

        case 'if-not-empty':
          if (areEquivalentASTs(ifInfo.collection, previous.collection)) {
            const forBlock = getOnlyForBlock(previous.node.branches[0]);
            if (
              forBlock &&
              areEquivalentASTs(ifInfo.collection, forBlock.expression.ast)
            ) {
              const previousIfBlockEnd = previous.node.endSourceSpan;

              // The previous `@if` block can be removed and the current `@if`
              // block moved into the `@for` block's `@empty` block, so report
              // the problem on the previous `@if` block.
              context.report({
                loc: parserServices.convertNodeSourceSpanToLoc(
                  previous.node.nameSpan,
                ),
                messageId: 'preferAtEmpty',
                fix: previousIfBlockEnd
                  ? (fixer) => [
                      // Remove the previous `@if` statement.
                      fixer.removeRange(toRange(previous.node.startSourceSpan)),

                      // Remove the closing brace from the previous `@if` block.
                      fixer.removeRange(toRange(previousIfBlockEnd)),

                      // Take the contents of the current `@if` block and move
                      // it into the `@empty` block of the previous `@for` block.
                      fixer.insertTextAfterRange(
                        toRange(forBlock.sourceSpan),
                        ` @empty {${context.sourceCode.text.slice(
                          ifInfo.node.startSourceSpan.end.offset,
                          // The end offset includes the closing brace.
                          ifInfo.node.sourceSpan.end.offset,
                        )}`,
                      ),

                      // Remove the entirety of the current `@if` block.
                      fixer.removeRange(toRange(ifInfo.node.sourceSpan)),
                    ]
                  : undefined,
              });
            }
          }
      }
    }

    function checkIfEmptyElse(info: IfNodeInfo): void {
      // Look for an `@for` block in the `@else` branch.
      const forBlock = getOnlyForBlock(info.node.branches[1]);
      if (
        forBlock &&
        areEquivalentASTs(info.collection, forBlock.expression.ast)
      ) {
        const ifBranchEnd = info.node.branches[0].endSourceSpan;

        // The contents of the `@if` block can be moved into an
        // `@empty` block, so report the problem on the `@if` block.
        context.report({
          loc: parserServices.convertNodeSourceSpanToLoc(info.node.nameSpan),
          messageId: 'preferAtEmpty',
          fix: ifBranchEnd
            ? function* (fixer) {
                // Remove the entire `@if` branch through to the
                // start of the body of the `@else` block.
                yield fixer.removeRange([
                  info.node.sourceSpan.start.offset,
                  info.node.branches[1].startSourceSpan.end.offset,
                ]);

                // Take the contents of the `@if` branch and move
                // it into an `@empty` block after the `@for` block.
                const empty = context.sourceCode.text.slice(
                  info.node.startSourceSpan.end.offset,
                  ifBranchEnd.start.offset,
                );
                if (forBlock.empty?.endSourceSpan) {
                  // There is already an `@empty` block, but because the `@for`
                  // block was inside an `@else` block, the `@empty` block
                  // would never have be rendered, so we can replace its contents.
                  yield fixer.replaceTextRange(
                    [
                      forBlock.empty.startSourceSpan.end.offset,
                      forBlock.empty.endSourceSpan.start.offset,
                    ],
                    empty,
                  );
                } else {
                  // There isn't an existing `@empty` block, so we can create
                  // one. We don't need to include a closing brace, because
                  // we can reuse the one from the end of the @`if` block.
                  yield fixer.insertTextAfterRange(
                    toRange(forBlock.sourceSpan),
                    ` @empty {${empty}`,
                  );
                }
              }
            : undefined,
        });
      }
    }

    function checkIfNotEmpty(
      ifNotInfo: IfNodeInfo,
      previous: NodeInfo | undefined,
    ): void {
      if (previous?.kind === 'if-empty') {
        if (areEquivalentASTs(ifNotInfo.collection, previous.collection)) {
          const forBlock = getOnlyForBlock(ifNotInfo.node.branches[0]);
          if (
            forBlock &&
            areEquivalentASTs(ifNotInfo.collection, forBlock.expression.ast)
          ) {
            // The `@if` block can be removed and the contents of
            // the `@else` block moved into an `@empty` block,
            // so report the problem on the `@if` block.
            context.report({
              loc: parserServices.convertNodeSourceSpanToLoc(
                ifNotInfo.node.nameSpan,
              ),
              messageId: 'preferAtEmpty',
              fix: (fixer) => [
                // Remove the entire previous `@if` block.
                fixer.removeRange(toRange(previous.node.sourceSpan)),

                // Remove the current `@if` statement.
                fixer.removeRange(toRange(ifNotInfo.node.startSourceSpan)),

                // Take the contents of the previous `@if` block and move
                // it into the `@empty` block after the `@for` block.
                fixer.insertTextAfterRange(
                  toRange(forBlock.sourceSpan),
                  ` @empty {${context.sourceCode.text.slice(
                    previous.node.startSourceSpan.end.offset,
                    // The end offset is after the closing `}`, so we
                    // need to subtract one to ensure it gets removed.
                    previous.node.sourceSpan.end.offset - 1,
                  )}`,
                ),
              ],
            });
          }
        }
      }
    }

    function checkIfNotEmptyElse(info: IfNodeInfo): void {
      const forBlock = getOnlyForBlock(info.node.branches[0]);
      if (
        forBlock &&
        areEquivalentASTs(info.collection, forBlock.expression.ast)
      ) {
        const ifBranchEnd = info.node.branches[0].endSourceSpan;
        const ifEnd = info.node.endSourceSpan;

        // The `@if` block can be removed and the contents of
        // the `@else` block moved into an `@empty` block,
        // so report the problem on the `@if` block.
        context.report({
          loc: parserServices.convertNodeSourceSpanToLoc(info.node.nameSpan),
          messageId: 'preferAtEmpty',
          fix:
            ifBranchEnd && ifEnd
              ? function* (fixer) {
                  if (forBlock.empty) {
                    // Because the `@for` block was inside an `@if`
                    // block, the `@empty` block would never be rendered,
                    // so we can remove it. We could try to replace it,
                    // but it's easier to remove it and create a new one.
                    yield fixer.removeRange(toRange(forBlock.empty.sourceSpan));
                  }

                  // Remove the entire `@if (...) {` segment.
                  yield fixer.removeRange(toRange(info.node.startSourceSpan));

                  const elseBranch = info.node.branches[1];
                  if (elseBranch.expression) {
                    // The second branch is an `@else if` branch. We
                    // need to turn it into its own `@if` block. Replace
                    // the `@else if` text with the start of the `@empty`
                    // block and the start of the `@if` block, then put
                    // a closing brace after the original `@if` block
                    // to close the `@empty` block.
                    yield fixer.replaceTextRange(
                      [
                        ifBranchEnd.end.offset - 1,
                        elseBranch.nameSpan.end.offset,
                      ],
                      '@empty { @if ',
                    );
                    yield fixer.insertTextAfterRange(toRange(ifEnd), '}');
                  } else {
                    // The second branch is just an `@else` branch, so we
                    // can replace from end of the `@if` branch through to
                    // the end of the `@else` statement with `@empty {`.
                    // The children of the `@else` branch, and the closing
                    //  `}`, will become part of the `@empty` block.
                    yield fixer.replaceTextRange(
                      [
                        // The end offset is after the closing `}`, so we
                        // need to subtract one to ensure it gets removed.
                        ifBranchEnd.end.offset - 1,
                        elseBranch.startSourceSpan.end.offset,
                      ],
                      '@empty {',
                    );
                  }
                }
              : undefined,
        });
      }
    }

    return {
      // We need to visit `@for` and `@if` blocks, but we
      // also need to know if there are any nodes immediately
      // before them, so we need to visit all nodes.
      '*'(node: Node) {
        const current = getNodeInfo(node);

        if (current !== undefined) {
          switch (current.kind) {
            case 'for':
              checkFor(current, previousNodeStack.at(-1));
              break;

            case 'if-empty':
              checkIfEmpty(current, previousNodeStack.at(-1));
              break;

            case 'if-empty-else':
              checkIfEmptyElse(current);
              break;

            case 'if-not-empty':
              checkIfNotEmpty(current, previousNodeStack.at(-1));
              break;

            case 'if-not-empty-else':
              checkIfNotEmptyElse(current);
              break;
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

function getNodeInfo(node: Node): NodeInfo | undefined {
  if (node instanceof TmplAstForLoopBlock) {
    return {
      node,
      kind: 'for',
      collection: node.expression.ast,
    };
  }

  if (node instanceof TmplAstIfBlock) {
    if (node.branches.length === 0) {
      return undefined;
    }

    if (!node.branches[0].expression) {
      return undefined;
    }

    let collection = getNotEmptyTestCollection(node.branches[0].expression);
    if (collection) {
      // The block is either:
      //
      //   @if (collection.length > 0) {
      //   }
      //
      // or:
      //
      //   @if (collection.length > 0) {
      //   } @else {
      //   }
      //
      // or:
      //
      //   @if (collection.length > 0) {
      //   } @else if (condition){
      //   }
      //
      // or:
      //
      //   @if (collection.length > 0) {
      //   } @else if (condition) {
      //   } @else {
      //   }
      //
      // In any case, we treat this as one of the "if not empty"
      // nodes, because if there is an `@for` block in the `@if`
      // branch, then whatever is in the `@else if` or @else`
      // branches, could be moved into the `@empty` block.
      return {
        node,
        kind: node.branches.length === 1 ? 'if-not-empty' : 'if-not-empty-else',
        collection,
      };
    }

    collection = getEmptyTestCollection(node.branches[0].expression);
    if (collection) {
      // Unlike the "if not empty" cases, there are only two cases
      // that could be considered an "if empty" case:
      //
      //   @if (collection.length === 0) {
      //   }
      //
      // or:
      //
      //   @if (collection.length > 0) {
      //   } @else {
      //   }
      //
      // If there is an `@else if`, then whatever is in the `@if`
      // branch could not safely be moved into an `@empty` block
      // because of the condition in the `@else if` branch.
      if (node.branches.length === 1) {
        return {
          node,
          kind: 'if-empty',
          collection,
        };
      } else if (node.branches.length === 2 && !node.branches[1].expression) {
        return {
          node,
          kind: 'if-empty-else',
          collection,
        };
      }
    }
  }

  return undefined;
}

function getNotEmptyTestCollection(node: AST): AST | undefined {
  if (node instanceof ASTWithSource) {
    node = node.ast;
  }

  if (isLengthRead(node)) {
    // @if (collection.length)
    return node.receiver;
  }

  if (node instanceof Binary) {
    if (isLengthRead(node.left)) {
      if (
        node.operation === '!==' ||
        node.operation === '>' ||
        node.operation === '!='
      ) {
        if (isZero(node.right)) {
          // @if (collection.length !== 0)
          // @if (collection.length > 0)
          // @if (collection.length != 0)
          return node.left.receiver;
        }
      }
    } else if (isZero(node.left)) {
      if (
        node.operation === '!==' ||
        node.operation === '<' ||
        node.operation === '!='
      ) {
        if (isLengthRead(node.right)) {
          // @if (0 !== collection.length)
          // @if (0 < collection.length)
          // @if (0 != collection.length)
          return node.right.receiver;
        }
      }
    }
  }

  return undefined;
}

function getEmptyTestCollection(node: AST): AST | undefined {
  if (node instanceof ASTWithSource) {
    node = node.ast;
  }

  if (node instanceof PrefixNot) {
    if (isLengthRead(node.expression)) {
      // @if (!collection.length)
      return node.expression.receiver;
    }
  } else if (node instanceof Binary) {
    if (isLengthRead(node.left)) {
      if (node.operation === '===' || node.operation === '==') {
        if (isZero(node.right)) {
          // @if (collection.length === 0)
          // @if (collection.length == 0)
          return node.left.receiver;
        }
      }
    } else if (isZero(node.left)) {
      if (node.operation === '===' || node.operation === '==') {
        if (isLengthRead(node.right)) {
          // @if (0 === collection.length)
          // @if (0 == collection.length)
          return node.right.receiver;
        }
      }
    }
  }

  return undefined;
}

function isLengthRead(node: AST): node is PropertyRead {
  return node instanceof PropertyRead && node.name === 'length';
}

function isZero(node: AST): boolean {
  return node instanceof LiteralPrimitive && node.value === 0;
}

function toRange(span: ParseSourceSpan): [number, number] {
  return [span.start.offset, span.end.offset];
}

interface ForNodeInfo {
  readonly node: TmplAstForLoopBlock;
  readonly kind: 'for';
  readonly collection: AST;
}

interface IfNodeInfo {
  readonly node: TmplAstIfBlock;
  readonly kind:
    | 'if-empty'
    | 'if-empty-else'
    | 'if-not-empty'
    | 'if-not-empty-else';
  readonly collection: AST;
}

type NodeInfo = ForNodeInfo | IfNodeInfo;
