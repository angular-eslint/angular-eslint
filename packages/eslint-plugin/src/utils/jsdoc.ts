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

export function getSymbols(
  node: TSESTree.Identifier,
  services: ParserServicesWithTypeInformation,
  checker: ts.TypeChecker,
): (ts.Symbol | undefined)[] {
  const callLikeNode = getCallLikeNode(node);
  if (callLikeNode) {
    return [getCallLikeNodeSymbol(callLikeNode, services, checker)];
  } else if (node.parent.type === AST_NODE_TYPES.Property) {
    const property = services
      .getTypeAtLocation(node.parent.parent)
      .getProperty(node.name);
    const propertySymbol = services.getSymbolAtLocation(node);
    const valueSymbol = checker.getShorthandAssignmentValueSymbol(
      propertySymbol?.valueDeclaration,
    );
    return [
      ...getSymbolsInAliasesChain(propertySymbol, checker),
      property,
      propertySymbol,
      valueSymbol,
    ];
  }

  return getSymbolsInAliasesChain(services.getSymbolAtLocation(node), checker);
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
  symbols: (ts.Symbol | undefined)[],
  tagName: string,
): boolean {
  return symbols.some((symbol) =>
    symbol?.getJsDocTags().some((tag) => tag.name === tagName),
  );
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
    case AST_NODE_TYPES.AccessorProperty:
      return parent.key === node;

    case AST_NODE_TYPES.Property:
      if (parent.shorthand && parent.value === node) {
        return parent.parent.type === AST_NODE_TYPES.ObjectPattern;
      }
      if (parent.value === node) {
        return false;
      }
      return parent.parent.type === AST_NODE_TYPES.ObjectExpression;

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
      case AST_NODE_TYPES.ExportNamedDeclaration:
      case AST_NODE_TYPES.ImportDeclaration:
        return true;

      case AST_NODE_TYPES.BlockStatement:
      case AST_NODE_TYPES.ClassDeclaration:
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

function getSymbolsInAliasesChain(
  symbol: ts.Symbol | undefined,
  checker: ts.TypeChecker,
): (ts.Symbol | undefined)[] {
  const symbols = [symbol];
  if (!symbol || !tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)) {
    return symbols;
  }
  const targetSymbol = checker.getAliasedSymbol(symbol);
  while (tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)) {
    const immediateAliasedSymbol: ts.Symbol | undefined =
      symbol.getDeclarations() && checker.getImmediateAliasedSymbol(symbol);
    if (!immediateAliasedSymbol) {
      break;
    }
    symbol = immediateAliasedSymbol;
    if (symbol === targetSymbol) {
      symbols.push(symbol);
    }
  }
  return symbols;
}
