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
import { getLast } from '../utils';

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

export function getImplementsSchemaFixer(
  { id, implements: classImplements }: TSESTree.ClassDeclaration,
  interfaceName: string,
): {
  readonly implementsNodeReplace:
    | TSESTree.TSClassImplements
    | TSESTree.Identifier;
  readonly implementsTextReplace: string;
} {
  const [implementsNodeReplace, implementsTextReplace] = classImplements
    ? [getLast(classImplements), `, ${interfaceName}`]
    : [id as TSESTree.Identifier, ` implements ${interfaceName}`];

  return { implementsNodeReplace, implementsTextReplace } as const;
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

  // `@Component({...})` => `@Component({changeDetection: ChangeDetectionStrategy.OnPush, ...})`
  return fixer.insertTextBefore(properties[0], `${text},`);
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

export function getNodeToCommaRemoveFix(
  sourceCode: Readonly<TSESLint.SourceCode>,
  node: TSESTree.Node,
  fixer: TSESLint.RuleFixer,
): TSESLint.RuleFix {
  const tokenAfterNode = sourceCode.getTokenAfter(node);

  return tokenAfterNode && ASTUtils.isCommaToken(tokenAfterNode)
    ? fixer.removeRange([node.range[0], tokenAfterNode.range[1]])
    : fixer.remove(node);
}
