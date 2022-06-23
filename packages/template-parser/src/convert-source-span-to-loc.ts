import type {
  Node,
  ParseSourceSpan,
  TmplAstElement,
} from '@angular-eslint/bundled-angular-compiler';
import {
  Element,
  getHtmlTagDefinition,
  HtmlParser,
} from '@angular-eslint/bundled-angular-compiler';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

export function convertNodeSourceSpanToLoc(
  sourceSpan: ParseSourceSpan,
): TSESTree.SourceLocation {
  return {
    start: {
      line: sourceSpan.start.line + 1,
      column: sourceSpan.start.col,
    },
    end: {
      line: sourceSpan.end.line + 1,
      column: sourceSpan.end.col,
    },
  };
}

export function convertElementSourceSpanToLoc(
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
  node: TmplAstElement & { type: string },
): TSESTree.SourceLocation {
  if (node.type !== 'Element$1') {
    // We explicitly throw an exception since this function should not be used
    // with non-element nodes, e.g. `TextAttribute` or `MethodDefinition`, etc.
    throw new Error(
      'convertElementSourceSpanToLoc is intented to be used only with elements.',
    );
  }

  // Void elements are "self-closed" elements, e.g. `<img />` or `<area />`.
  // The Angular compiler explicitly doesn't set the end source span for void
  // elements, but we still have to find its location to be able to report failures.
  if (getHtmlTagDefinition(node.name).isVoid) {
    // Fallback to the original `node` if the
    // `tryToFindTheVoidNodeThatMatchesTheSourceSpan` returns nothing.
    node = (tryToFindTheVoidNodeThatMatchesTheSourceSpan(context, node) ||
      node) as typeof node;
  }

  return convertNodeSourceSpanToLoc(node.sourceSpan);
}

function tryToFindTheVoidNodeThatMatchesTheSourceSpan(
  context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>,
  node: TmplAstElement,
): Node | null {
  // Previously, `codelyzer` used `TemplateParser` to parse a template into an AST tree.
  // The `TemplateParser` used `HtmlParser`, because `HtmlParser` still sets the end span
  // for void elements.
  const { rootNodes } = getHtmlParser().parse(
    context.getSourceCode().getText(),
    context.getFilename(),
  );

  return lookupTheVoidNode(rootNodes, node.sourceSpan);
}

function lookupTheVoidNode(
  rootNodes: Node[],
  sourceSpan: ParseSourceSpan,
): Node | null {
  for (const node of rootNodes) {
    if (
      // We can't compare by `node.sourceSpan == sourceSpan` since references
      // will differ. But comparing `line` and` offset` is the
      // correct way, because they will not differ.
      node.sourceSpan.start.line === sourceSpan.start.line &&
      node.sourceSpan.start.offset === sourceSpan.start.offset
    ) {
      return node;
    }

    // `HtmlParser` will return a list of root nodes, these nodes
    // can be either text or elements. Elements might have child elements.
    if (node instanceof Element) {
      const voidNodeBeingLookedUp = lookupTheVoidNode(
        node.children,
        sourceSpan,
      );

      if (voidNodeBeingLookedUp !== null) {
        return voidNodeBeingLookedUp;
      }
    }
  }

  return null;
}

let htmlParser: HtmlParser | null = null;
// Initialize the `HtmlParser` class lazily only when the function is
// invoked for the first time.
function getHtmlParser(): HtmlParser {
  return htmlParser || (htmlParser = new HtmlParser());
}
