import type {
  AST,
  R3_Node as Node,
} from '@angular-eslint/bundled-angular-compiler';
import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

type ASTOrNodeWithParent = (AST | Node) & { parent?: ASTOrNodeWithParent };

function isProgram(node: unknown): node is TSESTree.Program {
  return (node as { type?: string }).type === AST_NODE_TYPES.Program;
}

export function getNearestNodeFrom<T extends ASTOrNodeWithParent>(
  { parent }: ASTOrNodeWithParent,
  predicate: (parent: ASTOrNodeWithParent) => parent is T,
): T | null {
  while (parent && !isProgram(parent)) {
    if (predicate(parent)) {
      return parent;
    }

    parent = parent.parent;
  }

  return null;
}
