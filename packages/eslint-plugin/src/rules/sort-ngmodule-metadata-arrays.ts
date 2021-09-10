import { ASTUtils, partition, Selectors } from '@angular-eslint/utils';
import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'sortNgmoduleMetadataArrays' | 'suggestFix';
export const RULE_NAME = 'sort-ngmodule-metadata-arrays';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures ASC alphabetical order for `NgModule` metadata arrays for easy visual scanning',
      category: 'Best Practices',
      recommended: false,
      suggestion: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      sortNgmoduleMetadataArrays:
        '`NgModule` metadata arrays should be sorted in ASC alphabetical order',
      suggestFix: 'Sort members (WARNING! comments will probably be messed up)',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      [`${Selectors.MODULE_CLASS_DECORATOR} Property ArrayExpression`]({
        elements,
      }: TSESTree.ArrayExpression) {
        const [expressions, identifiers] = partition(
          elements,
          TSESLintASTUtils.isIdentifier,
        );
        const firstUnorderedNode = getFirstUnderedNode(identifiers);

        if (!firstUnorderedNode) {
          return;
        }

        const hasComments = elements.some((element) =>
          ASTUtils.hasComments(sourceCode, element),
        );
        const fix: TSESLint.ReportFixFunction = (fixer) =>
          getFixes(sourceCode, fixer, elements, expressions, identifiers);
        context.report({
          node: firstUnorderedNode,
          messageId: 'sortNgmoduleMetadataArrays',
          ...(hasComments
            ? { suggest: [{ messageId: 'suggestFix', fix }] }
            : { fix }),
        });
      },
    };
  },
});

function getFirstUnderedNode(identifiers: readonly TSESTree.Identifier[]) {
  return identifiers.find((identifier, index, array) => {
    const previousElement = array[index - 1];
    return (
      previousElement &&
      previousElement.name.localeCompare(identifier.name) === 1
    );
  });
}

function getFixes(
  sourceCode: Readonly<TSESLint.SourceCode>,
  fixer: TSESLint.RuleFixer,
  elements: readonly TSESTree.Expression[],
  expressions: readonly TSESTree.Expression[],
  identifiers: readonly TSESTree.Identifier[],
) {
  const sortedIdentifiers = [...identifiers].sort((one, other) =>
    one.name.localeCompare(other.name),
  );
  const sortedExpressions = [...sortedIdentifiers, ...expressions];
  const text = sortedExpressions.reduce(toText(sourceCode, elements), '');
  return fixer.replaceTextRange(getRangeFromFirstToLast(elements), text);
}

function toText(
  sourceCode: Readonly<TSESLint.SourceCode>,
  elements: readonly TSESTree.Expression[],
) {
  return (
    accumulator: string,
    expression: TSESTree.Expression,
    index: number,
  ) => {
    const isLastElement = index === elements.length - 1;
    const textAfterExpression = isLastElement
      ? ''
      : sourceCode
          .getText()
          .slice(...getRangeBetweenCurrentAndNext(elements, index));
    return `${accumulator}${sourceCode.getText(
      expression,
    )}${textAfterExpression}`;
  };
}

function getRangeBetweenCurrentAndNext(
  elements: readonly TSESTree.Expression[],
  index: number,
): TSESTree.Range {
  return [elements[index].range[1], elements[index + 1].range[0]];
}

function getRangeFromFirstToLast(
  elements: readonly TSESTree.Expression[],
): TSESTree.Range {
  return [elements[0].range[0], elements[elements.length - 1].range[1]];
}
