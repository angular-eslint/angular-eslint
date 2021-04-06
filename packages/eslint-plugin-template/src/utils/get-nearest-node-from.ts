import type { AST } from '@angular/compiler';
import type { Node } from '@angular/compiler/src/render3/r3_ast';

type ASTOrNodeWithParent = (AST | Node) & { parent?: ASTOrNodeWithParent };

function isProgram({ type }: any): boolean {
  return type === 'Program';
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
