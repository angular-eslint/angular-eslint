import type { AST } from '@angular-eslint/bundled-angular-compiler';

/**
 * Type guard to check if an AST node has a name property
 */
export function isASTWithName(
  ast: AST & { name?: string },
): ast is AST & { name: string } {
  return !!ast.name;
}
