import type { AST } from '@angular/compiler';
import type { Node } from '@angular/compiler/src/render3/r3_ast';
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
      return (parent as unknown) as T;
    }

    parent = parent.parent as ASTOrNodeWithParent | undefined;
  }

  return null;
}
