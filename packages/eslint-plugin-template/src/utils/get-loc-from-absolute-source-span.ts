import type { AbsoluteSourceSpan } from '@angular/compiler';
import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

export function getLocFromAbsoluteSourceSpan(
  sourceCode: Readonly<TSESLint.SourceCode>,
  { start, end }: AbsoluteSourceSpan,
): TSESTree.SourceLocation {
  return {
    start: sourceCode.getLocFromIndex(start),
    end: sourceCode.getLocFromIndex(end),
  };
}
