import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import ts from 'typescript';
import * as tsutils from 'ts-api-utils';

export type CallLikeNode =
  | TSESTree.CallExpression
  | TSESTree.NewExpression
  | TSESTree.TaggedTemplateExpression;

export function getCallLikeNode(node: TSESTree.Node): CallLikeNode | undefined {
  let callee = node;

  while (
    callee.parent?.type === AST_NODE_TYPES.MemberExpression &&
    callee.parent.property === callee
  ) {
    callee = callee.parent;
  }

  return isNodeCalleeOfParent(callee) ? callee : undefined;
}

export function getSymbol(
  node: TSESTree.Identifier,
  services: ParserServicesWithTypeInformation,
  checker: ts.TypeChecker,
): ts.Symbol | undefined {
  const callLikeNode = getCallLikeNode(node);
  if (callLikeNode) {
    return getCallLikeNodeSymbol(callLikeNode, services, checker);
  } else if (node.parent.type === AST_NODE_TYPES.Property) {
    return services
      .getTypeAtLocation(node.parent.parent)
      .getProperty(node.name);
  } else {
    return services.getSymbolAtLocation(node);
  }
}

export function isNodeCalleeOfParent(
  node: TSESTree.Node,
): node is CallLikeNode {
  switch (node.parent?.type) {
    case AST_NODE_TYPES.NewExpression:
    case AST_NODE_TYPES.CallExpression:
      return node.parent.callee === node;

    case AST_NODE_TYPES.TaggedTemplateExpression:
      return node.parent.tag === node;

    default:
      return false;
  }
}

export function hasJsDocTag(
  symbol: ts.Signature | ts.Symbol | undefined,
  tagName: string,
): boolean {
  return !!symbol?.getJsDocTags().find((tag) => tag.name === tagName);
}

export function getCallLikeNodeSymbol(
  node: CallLikeNode,
  services: ParserServicesWithTypeInformation,
  checker: ts.TypeChecker,
): ts.Symbol | undefined {
  const symbol = services.getSymbolAtLocation(node);
  return symbol !== undefined &&
    tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)
    ? checker.getAliasedSymbol(symbol)
    : symbol;
}

export function isDeclaration(node: TSESTree.Identifier): boolean {
  const { parent } = node;

  switch (parent.type) {
    case AST_NODE_TYPES.ClassDeclaration:
    case AST_NODE_TYPES.VariableDeclarator:
    case AST_NODE_TYPES.TSEnumMember:
      return parent.id === node;

    case AST_NODE_TYPES.MethodDefinition:
    case AST_NODE_TYPES.PropertyDefinition:
      return parent.key === node;

    case AST_NODE_TYPES.Property:
      return (
        (parent.shorthand && parent.value === node) ||
        parent.parent.type === AST_NODE_TYPES.ObjectExpression
      );

    case AST_NODE_TYPES.AssignmentPattern:
      return parent.left === node;

    case AST_NODE_TYPES.FunctionDeclaration:
    case AST_NODE_TYPES.FunctionExpression:
    case AST_NODE_TYPES.TSDeclareFunction:
    case AST_NODE_TYPES.TSEmptyBodyFunctionExpression:
    case AST_NODE_TYPES.TSEnumDeclaration:
    case AST_NODE_TYPES.TSInterfaceDeclaration:
    case AST_NODE_TYPES.TSMethodSignature:
    case AST_NODE_TYPES.TSModuleDeclaration:
    case AST_NODE_TYPES.TSParameterProperty:
    case AST_NODE_TYPES.TSPropertySignature:
    case AST_NODE_TYPES.TSTypeAliasDeclaration:
    case AST_NODE_TYPES.TSTypeParameter:
      return true;

    default:
      return false;
  }
}

export function isInsideExportOrImport(node: TSESTree.Node): boolean {
  let current = node;

  while (true) {
    switch (current.type) {
      case AST_NODE_TYPES.ExportAllDeclaration:
      case AST_NODE_TYPES.ExportDefaultDeclaration:
      case AST_NODE_TYPES.ExportNamedDeclaration:
      case AST_NODE_TYPES.ImportDeclaration:
      case AST_NODE_TYPES.ImportExpression:
        return true;

      case AST_NODE_TYPES.ArrowFunctionExpression:
      case AST_NODE_TYPES.BlockStatement:
      case AST_NODE_TYPES.ClassBody:
      case AST_NODE_TYPES.TSInterfaceDeclaration:
      case AST_NODE_TYPES.FunctionDeclaration:
      case AST_NODE_TYPES.FunctionExpression:
      case AST_NODE_TYPES.Program:
      case AST_NODE_TYPES.TSUnionType:
      case AST_NODE_TYPES.VariableDeclarator:
        return false;

      default:
        current = current.parent;
    }
  }
}
