import type {
  TmplAstBlockNode,
  TmplAstForLoopBlock,
  TmplAstForLoopBlockEmpty,
  TmplAstIfBlockBranch,
  TmplAstSwitchBlock,
  ParseLocation,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noEmptyControlFlow';
export const RULE_NAME = 'no-empty-control-flow';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Ensures that control flow blocks are not empty. Empty control flow blocks usually occur due to refactoring that wasn't completed. They can cause confusion when reading code.",
    },
    schema: [],
    messages: {
      noEmptyControlFlow: 'Unexpected empty control flow block.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'ForLoopBlockEmpty,IfBlockBranch'(
        node: TmplAstForLoopBlockEmpty | TmplAstIfBlockBranch,
      ) {
        if (
          node.children.length === 0 ||
          isEmpty(node.startSourceSpan.end, node.endSourceSpan?.start)
        ) {
          report(node);
        }
      },
      ForLoopBlock(node: TmplAstForLoopBlock) {
        if (
          node.children.length === 0 ||
          // Like other block nodes, the start source span covers the opening
          // `@for (...) {` part, but the end source span is the closing `}`
          // at the end of the entire block, which might be after the `@empty {`
          // part. The main block span ends at the `}` that ends the content of
          // the `@for` block before the `@empty` block. Because it includes
          // the closing brace, we need to move it back by one.
          isEmpty(node.startSourceSpan.end, node.mainBlockSpan.end.moveBy(-1))
        ) {
          report(node);
        }
      },
      SwitchBlock(node: TmplAstSwitchBlock) {
        // A switch block is pointless without cases, so
        // if there are no cases, don't bother checking
        // if there's non-whitespace characters within it.
        if (node.groups.length === 0) {
          report(node);
        }
      },
    };

    function isEmpty(
      contentStart: ParseLocation,
      contentEnd: ParseLocation | undefined,
    ): boolean {
      return (
        !!contentEnd &&
        context.sourceCode.text
          .slice(contentStart.offset, contentEnd.offset)
          .trim() === ''
      );
    }

    function report(node: TmplAstBlockNode): void {
      context.report({
        messageId: 'noEmptyControlFlow',
        loc: parserServices.convertNodeSourceSpanToLoc(node.nameSpan),
      });
    }
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Empty control flow blocks (@if, @else, @for, @switch, @case, @empty) usually indicate incomplete refactoring or code that was commented out or deleted but left the block structure behind. These empty blocks add no functionality but create visual noise and confusion when reading templates. Developers may wonder whether the empty block is intentional or a bug. Removing empty blocks keeps templates clean and makes it clear that there is no conditional logic or looping in that location. This rule helps maintain template quality and catches likely mistakes during development.',
};
