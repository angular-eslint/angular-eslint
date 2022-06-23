import type { TSESTree } from '@typescript-eslint/utils';
import {
  ASTUtils,
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
} from '@typescript-eslint/utils';
import { getLast, isNotNullOrUndefined, objectKeys } from '../utils';

export enum AngularClassDecorators {
  Component = 'Component',
  Directive = 'Directive',
  Injectable = 'Injectable',
  NgModule = 'NgModule',
  Pipe = 'Pipe',
}

enum AngularConstructorParameterDecorators {
  Attribute = 'Attribute',
  Host = 'Host',
  Inject = 'Inject',
  Optional = 'Optional',
  Self = 'Self',
  SkipSelf = 'SkipSelf',
}

enum AngularMethodDecorators {
  HostListener = 'HostListener',
}

enum AngularPropertyAccessorDecorators {
  ContentChild = 'ContentChild',
  ContentChildren = 'ContentChildren',
  HostBinding = 'HostBinding',
  Input = 'Input',
  Output = 'Output',
  ViewChild = 'ViewChild',
  ViewChildren = 'ViewChildren',
}

export const AngularInnerClassDecorators = {
  ...AngularConstructorParameterDecorators,
  ...AngularMethodDecorators,
  ...AngularPropertyAccessorDecorators,
};

export enum AngularLifecycleInterfaces {
  AfterContentChecked = 'AfterContentChecked',
  AfterContentInit = 'AfterContentInit',
  AfterViewChecked = 'AfterViewChecked',
  AfterViewInit = 'AfterViewInit',
  DoBootstrap = 'DoBootstrap',
  DoCheck = 'DoCheck',
  OnChanges = 'OnChanges',
  OnDestroy = 'OnDestroy',
  OnInit = 'OnInit',
}

export enum AngularLifecycleMethods {
  ngAfterContentChecked = 'ngAfterContentChecked',
  ngAfterContentInit = 'ngAfterContentInit',
  ngAfterViewChecked = 'ngAfterViewChecked',
  ngAfterViewInit = 'ngAfterViewInit',
  ngDoBootstrap = 'ngDoBootstrap',
  ngDoCheck = 'ngDoCheck',
  ngOnChanges = 'ngOnChanges',
  ngOnDestroy = 'ngOnDestroy',
  ngOnInit = 'ngOnInit',
}

export const OPTION_STYLE_CAMEL_CASE = 'camelCase';
export const OPTION_STYLE_KEBAB_CASE = 'kebab-case';
export type SelectorStyle =
  | typeof OPTION_STYLE_CAMEL_CASE
  | typeof OPTION_STYLE_KEBAB_CASE;

export type AngularClassDecoratorKeys = keyof typeof AngularClassDecorators;
export type AngularInnerClassDecoratorKeys = Exclude<
  keyof typeof AngularInnerClassDecorators,
  number
>;
export type AngularLifecycleInterfaceKeys =
  keyof typeof AngularLifecycleInterfaces;
export type AngularLifecycleMethodKeys = keyof typeof AngularLifecycleMethods;

export const angularClassDecoratorKeys = objectKeys(AngularClassDecorators);
export const angularInnerClassDecoratorKeys = objectKeys(
  AngularInnerClassDecorators,
);
export const angularLifecycleInterfaceKeys = objectKeys(
  AngularLifecycleInterfaces,
);
export const angularLifecycleMethodKeys = objectKeys(AngularLifecycleMethods);

export const ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER: ReadonlyMap<
  AngularClassDecoratorKeys,
  ReadonlySet<AngularLifecycleMethodKeys>
> = new Map([
  [
    AngularClassDecorators.Component,
    new Set([
      AngularLifecycleMethods.ngAfterContentChecked,
      AngularLifecycleMethods.ngAfterContentInit,
      AngularLifecycleMethods.ngAfterViewChecked,
      AngularLifecycleMethods.ngAfterViewInit,
      AngularLifecycleMethods.ngOnChanges,
      AngularLifecycleMethods.ngOnDestroy,
      AngularLifecycleMethods.ngOnInit,
      AngularLifecycleMethods.ngDoCheck,
    ]),
  ],
  [
    AngularClassDecorators.Directive,
    new Set([
      AngularLifecycleMethods.ngAfterContentChecked,
      AngularLifecycleMethods.ngAfterContentInit,
      AngularLifecycleMethods.ngAfterViewChecked,
      AngularLifecycleMethods.ngAfterViewInit,
      AngularLifecycleMethods.ngOnChanges,
      AngularLifecycleMethods.ngOnDestroy,
      AngularLifecycleMethods.ngOnInit,
      AngularLifecycleMethods.ngDoCheck,
    ]),
  ],
  [
    AngularClassDecorators.Injectable,
    new Set<AngularLifecycleMethodKeys>([AngularLifecycleMethods.ngOnDestroy]),
  ],
  [
    AngularClassDecorators.NgModule,
    new Set<AngularLifecycleMethodKeys>([
      AngularLifecycleMethods.ngDoBootstrap,
    ]),
  ],
  [
    AngularClassDecorators.Pipe,
    new Set<AngularLifecycleMethodKeys>([AngularLifecycleMethods.ngOnDestroy]),
  ],
]);

export const ANGULAR_INNER_CLASS_DECORATORS: ReadonlySet<AngularInnerClassDecoratorKeys> =
  new Set(angularInnerClassDecoratorKeys);

export const ANGULAR_CLASS_DECORATORS: ReadonlySet<AngularClassDecoratorKeys> =
  new Set(angularClassDecoratorKeys);

export const ANGULAR_CLASS_DECORATOR_MAPPER: ReadonlyMap<
  AngularClassDecoratorKeys,
  ReadonlySet<AngularInnerClassDecoratorKeys>
> = new Map([
  [AngularClassDecorators.Component, ANGULAR_INNER_CLASS_DECORATORS],
  [AngularClassDecorators.Directive, ANGULAR_INNER_CLASS_DECORATORS],
  [
    AngularClassDecorators.Injectable,
    new Set([
      AngularInnerClassDecorators.Host,
      AngularInnerClassDecorators.Inject,
      AngularInnerClassDecorators.Optional,
      AngularInnerClassDecorators.Self,
      AngularInnerClassDecorators.SkipSelf,
    ]),
  ],
  [
    AngularClassDecorators.NgModule,
    new Set([
      AngularInnerClassDecorators.Host,
      AngularInnerClassDecorators.Inject,
      AngularInnerClassDecorators.Optional,
      AngularInnerClassDecorators.Self,
      AngularInnerClassDecorators.SkipSelf,
    ]),
  ],
  [
    AngularClassDecorators.Pipe,
    new Set([
      AngularInnerClassDecorators.Host,
      AngularInnerClassDecorators.Inject,
      AngularInnerClassDecorators.Optional,
      AngularInnerClassDecorators.Self,
      AngularInnerClassDecorators.SkipSelf,
    ]),
  ],
]);

export function getCorrespondentImportClause(
  importDeclarations: readonly TSESTree.ImportDeclaration[],
  compatibleWithTypeOnlyImport = false,
): TSESTree.ImportClause | undefined {
  let importClause: TSESTree.ImportClause | undefined;

  for (const { importKind, specifiers } of importDeclarations) {
    const lastImportSpecifier = getLast(specifiers);

    if (
      (!compatibleWithTypeOnlyImport && importKind === 'type') ||
      isImportNamespaceSpecifier(lastImportSpecifier)
    ) {
      continue;
    }

    importClause = lastImportSpecifier;
  }

  return importClause;
}

export function getImportDeclarations(
  node: TSESTree.Node,
  moduleName: string,
): readonly TSESTree.ImportDeclaration[] | undefined {
  let parentNode: TSESTree.Node | undefined = node;

  while ((parentNode = parentNode.parent)) {
    if (!isProgram(parentNode)) continue;

    return parentNode.body.filter(
      (node): node is TSESTree.ImportDeclaration =>
        isImportDeclaration(node) && node.source.value === moduleName,
    );
  }

  return parentNode;
}

export function getImportDeclarationSpecifier(
  importDeclarations: readonly TSESTree.ImportDeclaration[],
  importName: string,
):
  | {
      importSpecifier: TSESTree.ImportSpecifier;
      importDeclaration: TSESTree.ImportDeclaration;
    }
  | undefined {
  for (const importDeclaration of importDeclarations) {
    const importSpecifier = importDeclaration.specifiers.find(
      (importClause): importClause is TSESTree.ImportSpecifier => {
        return (
          isImportSpecifier(importClause) &&
          importClause.imported.name === importName
        );
      },
    );

    if (importSpecifier) {
      return { importDeclaration, importSpecifier } as const;
    }
  }

  return undefined;
}

export function getInterface(
  node: TSESTree.ClassDeclaration,
  interfaceName: string,
): TSESTree.Identifier | TSESTree.MemberExpression | undefined {
  return getInterfaces(node).find(
    (interfaceMember) => getInterfaceName(interfaceMember) === interfaceName,
  );
}

export function getInterfaceName(
  interfaceMember: TSESTree.Identifier | TSESTree.MemberExpression,
): string | undefined {
  if (ASTUtils.isIdentifier(interfaceMember)) {
    return interfaceMember.name;
  }

  return ASTUtils.isIdentifier(interfaceMember.property)
    ? interfaceMember.property.name
    : undefined;
}

export const getPipeDecorator = (
  node: TSESTree.ClassDeclaration,
): TSESTree.Decorator | undefined => getDecorator(node, 'Pipe');

export function getInterfaces(
  node: TSESTree.ClassDeclaration,
): readonly (TSESTree.Identifier | TSESTree.MemberExpression)[] {
  return (node.implements ?? [])
    .map(({ expression }) => expression)
    .filter(isIdentifierOrMemberExpression);
}

export function getDeclaredInterfaceNames(
  node: TSESTree.ClassDeclaration,
): readonly string[] {
  return getInterfaces(node).map(getInterfaceName).filter(isNotNullOrUndefined);
}

export const getDeclaredAngularLifecycleInterfaces = (
  node: TSESTree.ClassDeclaration,
): readonly AngularLifecycleInterfaceKeys[] =>
  getDeclaredInterfaceNames(node).filter(
    isAngularLifecycleInterface,
  ) as readonly AngularLifecycleInterfaceKeys[];

export const getDeclaredAngularLifecycleMethods = (
  node: TSESTree.ClassDeclaration,
): readonly AngularLifecycleMethodKeys[] =>
  getDeclaredMethods(node)
    .map(getMethodName)
    .filter(isNotNullOrUndefined)
    .filter(isAngularLifecycleMethod) as readonly AngularLifecycleMethodKeys[];

export function getNearestNodeFrom<T extends TSESTree.Node>(
  { parent }: TSESTree.Node,
  predicate: (parent: TSESTree.Node) => parent is T,
): T | null {
  while (parent && !isProgram(parent)) {
    if (predicate(parent)) {
      return parent;
    }

    parent = parent.parent;
  }

  return null;
}

export const getClassName = (node: TSESTree.Node): string | undefined => {
  if (isClassDeclaration(node)) {
    return node.id?.name;
  }
  if (node.parent) {
    return getClassName(node.parent);
  }
  return undefined;
};

export const getDecorator = (
  node:
    | TSESTree.ClassDeclaration
    | TSESTree.PropertyDefinition
    | TSESTree.Identifier
    | TSESTree.MethodDefinition,
  decoratorName: string,
): TSESTree.Decorator | undefined => {
  return node.decorators?.find(
    (decorator) => getDecoratorName(decorator) === decoratorName,
  );
};

export const getAngularClassDecorator = ({
  decorators,
}: TSESTree.ClassDeclaration): AngularClassDecoratorKeys | undefined => {
  return decorators
    ?.map(getDecoratorName)
    .filter(isNotNullOrUndefined)
    .find(isAngularClassDecorator);
};

export const getDecoratorArgument = ({
  expression,
}: TSESTree.Decorator): TSESTree.ObjectExpression | undefined => {
  if (!isCallExpression(expression) || expression.arguments.length === 0) {
    return undefined;
  }
  const [arg] = expression.arguments;
  return isObjectExpression(arg) && arg.properties ? arg : undefined;
};

export const getDecoratorName = ({
  expression,
}: TSESTree.Decorator): string | undefined => {
  if (ASTUtils.isIdentifier(expression)) return expression.name;

  return isCallExpression(expression) &&
    ASTUtils.isIdentifier(expression.callee)
    ? expression.callee.name
    : undefined;
};

export const ANGULAR_LIFECYCLE_INTERFACES: ReadonlySet<AngularLifecycleInterfaceKeys> =
  new Set(angularLifecycleInterfaceKeys);

export const ANGULAR_LIFECYCLE_METHODS: ReadonlySet<AngularLifecycleMethodKeys> =
  new Set(angularLifecycleMethodKeys);

export const isAngularLifecycleInterface = (
  value: string,
): value is AngularLifecycleInterfaceKeys =>
  ANGULAR_LIFECYCLE_INTERFACES.has(value as AngularLifecycleInterfaceKeys);

export const isAngularLifecycleMethod = (
  value: string,
): value is AngularLifecycleMethodKeys =>
  ANGULAR_LIFECYCLE_METHODS.has(value as AngularLifecycleMethodKeys);

export const isAngularClassDecorator = (
  value: string,
): value is AngularClassDecoratorKeys =>
  ANGULAR_CLASS_DECORATORS.has(value as AngularClassDecoratorKeys);

export const isAngularInnerClassDecorator = (
  value: string,
): value is AngularInnerClassDecoratorKeys =>
  ANGULAR_INNER_CLASS_DECORATORS.has(value as AngularInnerClassDecoratorKeys);

/**
 * `PropertyDefinition` nodes can have different types of `key`s
 *
 * E.g.
 *
 * class Foo {
 *  a // Identifier
 * 'b' // Literal
 *  ['c'] // Literal
 * }
 */
export function getPropertyDefinitionName({
  computed,
  key,
}: TSESTree.PropertyDefinition): string {
  if (ASTUtils.isIdentifier(key) && !computed) {
    return key.name;
  }

  if (isLiteral(key)) {
    return key.raw;
  }

  throw new Error(
    `Unexpected "PropertyDefinition.key.type" provided: ${key.type}`,
  );
}

export const getDecoratorProperty = (
  decorator: TSESTree.Decorator,
  name: string,
): TSESTree.Property | undefined => {
  return getDecoratorArgument(decorator)
    ?.properties.filter(isProperty)
    .find(({ key }) => ASTUtils.isIdentifier(key) && key.name === name);
};

export const getDecoratorPropertyValue = (
  decorator: TSESTree.Decorator,
  name: string,
): TSESTree.Property['value'] | undefined => {
  return getDecoratorProperty(decorator, name)?.value;
};

export const getDeclaredMethods = ({
  body: { body },
}: TSESTree.ClassDeclaration): readonly TSESTree.MethodDefinition[] => {
  return body.filter(isMethodDefinition);
};

export const getMethodName = ({
  computed,
  key,
}: TSESTree.MethodDefinition): string | undefined => {
  if (isStringLiteral(key)) {
    return key.value;
  }

  return ASTUtils.isIdentifier(key) && !computed ? key.name : undefined;
};

export const getLifecycleInterfaceByMethodName = (
  methodName: AngularLifecycleMethodKeys,
): AngularLifecycleInterfaceKeys =>
  methodName.slice(2) as AngularLifecycleInterfaceKeys;

export function isImportedFrom(
  identifier: TSESTree.Identifier,
  moduleName: string,
): boolean {
  const importDeclarations = getImportDeclarations(identifier, moduleName);

  return Boolean(
    importDeclarations?.some((importDeclaration) =>
      importDeclaration.specifiers.some(
        (specifier) =>
          isImportSpecifier(specifier) &&
          specifier.imported.name === identifier.name &&
          specifier.local.name === identifier.name,
      ),
    ),
  );
}

export function getRawText(node: TSESTree.Node): string {
  if (ASTUtils.isIdentifier(node)) {
    return node.name;
  }

  if (
    isPropertyDefinition(node) ||
    isMethodDefinition(node) ||
    isProperty(node)
  ) {
    return getRawText(node.key);
  }

  if (isLiteral(node)) {
    return String(node.value);
  }

  if (isTemplateElement(node)) {
    return node.value.raw;
  }

  if (isTemplateLiteral(node)) {
    return node.quasis[0].value.raw;
  }

  throw Error(`Unexpected \`node.type\` provided: ${node.type}`);
}

export function getReplacementText(
  node: TSESTree.Literal | TSESTree.TemplateElement | TSESTree.TemplateLiteral,
  text: string,
): string {
  return isLiteral(node) ? `'${text}'` : `\`${text}\``;
}

// SECTION START:
// Equivalents of utils exported by TypeScript itself for its own AST

export function isCallExpression(
  node: TSESTree.Node,
): node is TSESTree.CallExpression {
  return node.type === AST_NODE_TYPES.CallExpression;
}

export function isMemberExpression(
  node: TSESTree.Node,
): node is TSESTree.MemberExpression {
  return node.type === AST_NODE_TYPES.MemberExpression;
}

export function isIdentifierOrMemberExpression(
  node: TSESTree.Node,
): node is TSESTree.Identifier | TSESTree.MemberExpression {
  return ASTUtils.isIdentifier(node) || isMemberExpression(node);
}

export function isClassDeclaration(
  node: TSESTree.Node,
): node is TSESTree.ClassDeclaration {
  return node.type === AST_NODE_TYPES.ClassDeclaration;
}

export function isPropertyDefinition(
  node: TSESTree.Node,
): node is TSESTree.PropertyDefinition {
  return node.type === AST_NODE_TYPES.PropertyDefinition;
}

export function isPropertyOrMethodDefinition(
  node: TSESTree.Node,
): node is TSESTree.PropertyDefinition | TSESTree.MethodDefinition {
  return isPropertyDefinition(node) || isMethodDefinition(node);
}

export function isImportDefaultSpecifier(
  node: TSESTree.Node,
): node is TSESTree.ImportDefaultSpecifier {
  return node.type === AST_NODE_TYPES.ImportDefaultSpecifier;
}

export function isImportNamespaceSpecifier(
  node: TSESTree.Node,
): node is TSESTree.ImportNamespaceSpecifier {
  return node.type === AST_NODE_TYPES.ImportNamespaceSpecifier;
}

export function isObjectExpression(
  node: TSESTree.Node,
): node is TSESTree.ObjectExpression {
  return node.type === AST_NODE_TYPES.ObjectExpression;
}

export function isArrayExpression(
  node: TSESTree.Node,
): node is TSESTree.ArrayExpression {
  return node.type === AST_NODE_TYPES.ArrayExpression;
}

export function isProperty(node: TSESTree.Node): node is TSESTree.Property {
  return node.type === AST_NODE_TYPES.Property;
}

function isProgram(node: TSESTree.Node): node is TSESTree.Program {
  return node.type === AST_NODE_TYPES.Program;
}

export function isLiteral(node: TSESTree.Node): node is TSESTree.Literal {
  return node.type === AST_NODE_TYPES.Literal;
}

export function isTemplateElement(
  node: TSESTree.Node,
): node is TSESTree.TemplateElement {
  return node.type === AST_NODE_TYPES.TemplateElement;
}

export function isTemplateLiteral(
  node: TSESTree.Node,
): node is TSESTree.TemplateLiteral {
  return node.type === AST_NODE_TYPES.TemplateLiteral;
}

export function isImportDeclaration(
  node: TSESTree.Node,
): node is TSESTree.ImportDeclaration {
  return node.type === AST_NODE_TYPES.ImportDeclaration;
}

export function isImportSpecifier(
  node: TSESTree.Node,
): node is TSESTree.ImportSpecifier {
  return node.type === AST_NODE_TYPES.ImportSpecifier;
}

/**
 * `ESTree` does not differentiate between different types of `Literals` at the `AST` level,
 * but it is a common thing to need to do, so this utility are here to
 * avoid repeated `typeof` checks on the node's value.
 */
export function isStringLiteral(
  node: TSESTree.Node,
): node is TSESTree.StringLiteral {
  return isLiteral(node) && typeof node.value === 'string';
}

export function isMethodDefinition(
  node: TSESTree.Node,
): node is TSESTree.MethodDefinition {
  return node.type === AST_NODE_TYPES.MethodDefinition;
}

export function isSuper(node: TSESTree.Node): node is TSESTree.Super {
  return node.type === AST_NODE_TYPES.Super;
}

export function isImplementsToken(
  token: TSESTree.Token,
): token is TSESTree.KeywordToken & { value: 'implements' } {
  return token.type === AST_TOKEN_TYPES.Keyword && token.value === 'implements';
}

// SECTION END:
// Equivalents of utils exported by TypeScript itself for its own AST
