import { TmplAstElement } from '@angular/compiler';

export function isChildNodeOf(
  ast: TmplAstElement,
  childNodeName: string,
): boolean {
  function traverseChildNodes({ children }: TmplAstElement): boolean {
    return children.some(
      (child) =>
        child instanceof TmplAstElement &&
        (child.name === childNodeName || traverseChildNodes(child)),
    );
  }

  return traverseChildNodes(ast);
}
