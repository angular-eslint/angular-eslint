import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

export interface PropInfo {
  name: string;
  leadingComments: string[];
  value: string;
  trailingComments: string[];
}

export function extractPropertyComments(
  sourceCode: Readonly<TSESLint.SourceCode>,
  properties: TSESTree.Property[],
  objectExpression: TSESTree.Expression,
  indentation: string,
): Map<string, PropInfo> {
  const allComments = sourceCode.getAllComments();
  const processedCommentRanges = new Set<string>();
  const propInfoMap = new Map<string, PropInfo>();
  const commentLineMap = new Map<number, TSESTree.Comment[]>();

  for (const comment of allComments) {
    const line = sourceCode.getLocFromIndex(comment.range[0]).line;
    if (!commentLineMap.has(line)) {
      commentLineMap.set(line, []);
    }
    commentLineMap.get(line)?.push(comment);
  }

  const makeRangeKey = (start: number, end: number) => `${start}-${end}`;

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const name = (prop.key as TSESTree.Identifier).name;
    const propRange = prop.range;
    const leadingComments: string[] = [];
    const prevPropEnd =
      i > 0 ? properties[i - 1].range[1] : objectExpression.range[0] + 1;

    for (const comment of allComments) {
      const rangeKey = makeRangeKey(comment.range[0], comment.range[1]);
      if (
        comment.range[0] > prevPropEnd &&
        comment.range[0] < propRange[0] &&
        !processedCommentRanges.has(rangeKey)
      ) {
        leadingComments.push(indentation + sourceCode.getText(comment));
        processedCommentRanges.add(rangeKey);
      }
    }

    const propText = sourceCode.getText(prop).replace(/,\s*$/, '');
    const trailingComments: string[] = [];
    const propEndLine = sourceCode.getLocFromIndex(propRange[1]).line;

    if (commentLineMap.has(propEndLine)) {
      const commentsOnLine = commentLineMap.get(propEndLine) || [];
      for (const comment of commentsOnLine) {
        const rangeKey = makeRangeKey(comment.range[0], comment.range[1]);
        if (
          comment.range[0] > propRange[1] &&
          !processedCommentRanges.has(rangeKey)
        ) {
          const spaceBefore = sourceCode
            .getText()
            .substring(propRange[1], comment.range[0])
            .replace(/,/g, '');

          trailingComments.push(spaceBefore + sourceCode.getText(comment));
          processedCommentRanges.add(rangeKey);
        }
      }
    }

    propInfoMap.set(name, {
      name,
      leadingComments,
      value: propText,
      trailingComments,
    });
  }

  return propInfoMap;
}

export function buildSortedPropertiesWithComments(
  filteredOrder: string[],
  propInfoMap: Map<string, PropInfo>,
  indentation: string,
): string {
  const sortedParts: string[] = [];

  for (let i = 0; i < filteredOrder.length; i++) {
    const propName = filteredOrder[i];
    const info = propInfoMap.get(propName);

    if (info) {
      if (info.leadingComments.length > 0) {
        sortedParts.push(...info.leadingComments);
      }

      const isLast = i === filteredOrder.length - 1;
      let finalPropText = indentation + info.value;

      if (!isLast) {
        finalPropText += ',';
      }

      if (info.trailingComments.length > 0) {
        info.trailingComments.forEach((comment) => {
          finalPropText += comment;
        });
      }

      sortedParts.push(finalPropText);
    }
  }

  return sortedParts.join('\n');
}

export function getObjectIndentation(
  sourceCode: Readonly<TSESLint.SourceCode>,
  objectExpression: TSESTree.Expression,
): string {
  const objectExpressionText = sourceCode.getText(objectExpression);
  const lines = objectExpressionText.split('\n');
  return lines[1] ? lines[1].match(/^\s*/)?.[0] || '' : '';
}
