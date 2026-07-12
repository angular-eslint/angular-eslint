import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { ASTUtils } from '@typescript-eslint/utils';
import {
  getCorrespondentImportClause,
  getImportDeclarations,
  getImportDeclarationSpecifier,
  getInterface,
  isCallExpression,
  isImplementsToken,
  isImportDefaultSpecifier,
  isObjectExpression,
} from './ast-utils';
import { getLast, isNotNullOrUndefined } from '../utils';

export function getImportAddFix({
  compatibleWithTypeOnlyImport = false,
  fixer,
  importName,
  moduleName,
  node,
}: {
  compatibleWithTypeOnlyImport?: boolean;
  fixer: TSESLint.RuleFixer;
  importName: string;
  moduleName: string;
  node: TSESTree.Node;
}): TSESLint.RuleFix | undefined {
  const fullImport = `import { ${importName} } from '${moduleName}';\n`;
  const importDeclarations = getImportDeclarations(node, moduleName);

  if (!importDeclarations?.length) {
    return fixer.insertTextAfterRange([0, 0], fullImport);
  }

  const importDeclarationSpecifier = getImportDeclarationSpecifier(
    importDeclarations,
    importName,
  );

  if (importDeclarationSpecifier) {
    return undefined;
  }

  const importClause = getCorrespondentImportClause(
    importDeclarations,
    compatibleWithTypeOnlyImport,
  );

  if (!importClause) {
    return fixer.insertTextAfterRange([0, 0], fullImport);
  }

  const replacementText = isImportDefaultSpecifier(importClause)
    ? `, { ${importName} }`
    : `, ${importName}`;
  return fixer.insertTextAfter(importClause, replacementText);
}

export function getImportRemoveFix(
  sourceCode: Readonly<TSESLint.SourceCode>,
  importDeclarations: readonly TSESTree.ImportDeclaration[],
  importName: string,
  fixer: TSESLint.RuleFixer,
): TSESLint.RuleFix | undefined {
  const { importDeclaration, importSpecifier } =
    getImportDeclarationSpecifier(importDeclarations, importName) ?? {};

  if (!importDeclaration || !importSpecifier) return undefined;

  const isFirstImportSpecifier =
    importDeclaration.specifiers[0] === importSpecifier;
  const isLastImportSpecifier =
    getLast(importDeclaration.specifiers) === importSpecifier;
  const isSingleImportSpecifier =
    isFirstImportSpecifier && isLastImportSpecifier;

  if (isSingleImportSpecifier) {
    return fixer.remove(importDeclaration);
  }

  const tokenAfterImportSpecifier = sourceCode.getTokenAfter(importSpecifier);

  if (isFirstImportSpecifier && tokenAfterImportSpecifier) {
    return fixer.removeRange([
      importSpecifier.range[0],
      tokenAfterImportSpecifier.range[1],
    ]);
  }

  const tokenBeforeImportSpecifier = sourceCode.getTokenBefore(importSpecifier);

  if (!tokenBeforeImportSpecifier) return undefined;

  return fixer.removeRange([
    tokenBeforeImportSpecifier.range[0],
    importSpecifier.range[1],
  ]);
}

/**
 * Migrates a named import from `fromName` to `toName` for the given module:
 * renames the specifier in place when possible, otherwise adds `toName` and
 * removes `fromName` once it is no longer used.
 */
export function getImportReplaceFix({
  fixer,
  fromName,
  moduleName,
  node,
  sourceCode,
  toName,
}: {
  fixer: TSESLint.RuleFixer;
  fromName: string;
  moduleName: string;
  node: TSESTree.Node;
  sourceCode: Readonly<TSESLint.SourceCode>;
  toName: string;
}): (TSESLint.RuleFix | undefined)[] {
  const importDeclarations = getImportDeclarations(node, moduleName);
  const toAlreadyImported = Boolean(
    importDeclarations &&
    getImportDeclarationSpecifier(importDeclarations, toName),
  );
  const fromSpecifier = importDeclarations
    ? getImportDeclarationSpecifier(importDeclarations, fromName)
    : undefined;
  const fromUsedOnce =
    ASTUtils.findVariable(sourceCode.getScope(node), fromName)?.references
      .length === 1;

  if (fromUsedOnce && !toAlreadyImported && fromSpecifier) {
    return [fixer.replaceText(fromSpecifier.importSpecifier, toName)];
  }

  const addFix = toAlreadyImported
    ? undefined
    : getImportAddFix({ fixer, importName: toName, moduleName, node });
  const removeFix =
    fromUsedOnce && importDeclarations
      ? getImportRemoveFix(sourceCode, importDeclarations, fromName, fixer)
      : undefined;

  return [addFix, removeFix];
}

export function getImplementsSchemaFixer(
  {
    id,
    superClass,
    implements: classImplements,
    typeParameters,
  }: TSESTree.ClassDeclaration,
  interfaceName: string,
): {
  readonly implementsNodeReplace:
    | TSESTree.TSClassImplements
    | TSESTree.Identifier
    | TSESTree.TSTypeParameterDeclaration;
  readonly implementsTextReplace: string;
} {
  if (Array.isArray(classImplements) && classImplements.length > 0) {
    return {
      implementsNodeReplace: getLast(classImplements),
      implementsTextReplace: `, ${interfaceName}`,
    };
  }

  const implementsTextReplace = ` implements ${interfaceName}`;
  if (isNotNullOrUndefined(superClass)) {
    return {
      implementsNodeReplace: superClass as TSESTree.Identifier,
      implementsTextReplace,
    };
  }

  if (isNotNullOrUndefined(typeParameters)) {
    return {
      implementsNodeReplace: typeParameters,
      implementsTextReplace,
    };
  }

  return {
    implementsNodeReplace: id as TSESTree.Identifier,
    implementsTextReplace,
  };
}

export function getDecoratorPropertyAddFix(
  { expression }: TSESTree.Decorator,
  fixer: TSESLint.RuleFixer,
  text: string,
): TSESLint.RuleFix | undefined {
  if (!isCallExpression(expression)) {
    return undefined;
  }

  const [firstArgument] = expression.arguments;

  if (!firstArgument || !isObjectExpression(firstArgument)) {
    // `@Component()` => `@Component({changeDetection: ChangeDetectionStrategy.OnPush})`
    const [initialRange, endRange] = expression.range;
    return fixer.insertTextAfterRange(
      [initialRange + 1, endRange - 1],
      `{${text}}`,
    );
  }

  const { properties } = firstArgument;

  if (properties.length === 0) {
    //` @Component({})` => `@Component({changeDetection: ChangeDetectionStrategy.OnPush})`
    const [initialRange, endRange] = firstArgument.range;
    return fixer.insertTextAfterRange([initialRange + 1, endRange - 1], text);
  }

  // `@Component({...})` => `@Component({..., changeDetection: ChangeDetectionStrategy.OnPush})`
  return fixer.insertTextAfter(getLast(properties), `, ${text}`);
}

export function getImplementsRemoveFix(
  sourceCode: Readonly<TSESLint.SourceCode>,
  classDeclaration: TSESTree.ClassDeclaration,
  interfaceName: string,
  fixer: TSESLint.RuleFixer,
): TSESLint.RuleFix | undefined {
  const { implements: classImplements } = classDeclaration;

  if (!classImplements) return undefined;

  const identifier = getInterface(classDeclaration, interfaceName);

  if (!identifier) return undefined;

  const isFirstInterface = classImplements[0].expression === identifier;
  const isLastInterface = getLast(classImplements).expression === identifier;
  const hasSingleInterfaceImplemented = isFirstInterface && isLastInterface;
  const tokenBeforeInterface = sourceCode.getTokenBefore(identifier);

  if (hasSingleInterfaceImplemented) {
    return !tokenBeforeInterface || !isImplementsToken(tokenBeforeInterface)
      ? undefined
      : fixer.removeRange([
          tokenBeforeInterface.range[0],
          classImplements[0].range[1],
        ]);
  }

  if (isFirstInterface) {
    const tokenAfterInterface = sourceCode.getTokenAfter(identifier);

    return !tokenAfterInterface
      ? undefined
      : fixer.removeRange([identifier.range[0], tokenAfterInterface.range[1]]);
  }

  return !tokenBeforeInterface
    ? undefined
    : fixer.removeRange([tokenBeforeInterface.range[0], identifier.range[1]]);
}

function isClosingDelimiterToken(token: TSESTree.Token): boolean {
  return (
    ASTUtils.isClosingBraceToken(token) ||
    ASTUtils.isClosingBracketToken(token) ||
    ASTUtils.isClosingParenToken(token)
  );
}

/**
 * Removes an element of a comma-separated list (object property, array element,
 * call argument) along with its own trailing comma and surrounding whitespace.
 * The preceding comma is kept so an existing trailing-comma style is preserved.
 */
export function getNodeToCommaRemoveFix(
  sourceCode: Readonly<TSESLint.SourceCode>,
  node: TSESTree.Node,
  fixer: TSESLint.RuleFixer,
): TSESLint.RuleFix {
  const tokenAfterNode = sourceCode.getTokenAfter(node);
  const commaAfterNode =
    tokenAfterNode && ASTUtils.isCommaToken(tokenAfterNode)
      ? tokenAfterNode
      : undefined;

  // When another element follows, remove up to it so it keeps its indentation.
  if (commaAfterNode) {
    const tokenAfterComma = sourceCode.getTokenAfter(commaAfterNode);
    if (tokenAfterComma && !isClosingDelimiterToken(tokenAfterComma)) {
      return fixer.removeRange([node.range[0], tokenAfterComma.range[0]]);
    }
  }

  // Last element: also remove the whitespace before it, but keep the preceding
  // comma.
  const tokenBeforeNode = sourceCode.getTokenBefore(node);
  const start =
    tokenBeforeNode && ASTUtils.isCommaToken(tokenBeforeNode)
      ? tokenBeforeNode.range[1]
      : node.range[0];

  return fixer.removeRange([start, commaAfterNode?.range[1] ?? node.range[1]]);
}
