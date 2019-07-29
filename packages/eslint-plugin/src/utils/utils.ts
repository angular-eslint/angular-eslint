import { TSESTree } from '@typescript-eslint/experimental-utils';

export const objectKeys = Object.keys as <T>(
  o: T,
) => ReadonlyArray<Extract<keyof T, string>>;

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
  OnChanges = 'OnChanges',
  OnDestroy = 'OnDestroy',
  OnInit = 'OnInit',
  DoCheck = 'DoCheck',
}

export enum AngularLifecycleMethods {
  ngAfterContentChecked = 'ngAfterContentChecked',
  ngAfterContentInit = 'ngAfterContentInit',
  ngAfterViewChecked = 'ngAfterViewChecked',
  ngAfterViewInit = 'ngAfterViewInit',
  ngOnChanges = 'ngOnChanges',
  ngOnDestroy = 'ngOnDestroy',
  ngOnInit = 'ngOnInit',
  ngDoCheck = 'ngDoCheck',
}

export type AngularClassDecoratorKeys = keyof typeof AngularClassDecorators;
export type AngularInnerClassDecoratorKeys = Exclude<
  keyof typeof AngularInnerClassDecorators,
  number
>;
export type AngularLifecycleInterfaceKeys = keyof typeof AngularLifecycleInterfaces;
export type AngularLifecycleMethodKeys = keyof typeof AngularLifecycleMethods;

export const angularClassDecoratorKeys = objectKeys(AngularClassDecorators);
export const angularInnerClassDecoratorKeys = objectKeys(
  AngularInnerClassDecorators,
);
export const angularLifecycleInterfaceKeys = objectKeys(
  AngularLifecycleInterfaces,
);
export const angularLifecycleMethodKeys = objectKeys(AngularLifecycleMethods);

/**
 * SECTION START:
 * Equivalents of utils exported by TypeScript itself for its own AST
 */

function isCallExpression(
  node: TSESTree.Node,
): node is TSESTree.CallExpression {
  return node.type === 'CallExpression';
}

export function isIdentifier(node: TSESTree.Node): node is TSESTree.Identifier {
  return node.type === 'Identifier';
}

export function isMemberExpression(
  node: TSESTree.Node,
): node is TSESTree.MemberExpression {
  return node.type === 'MemberExpression';
}

function isClassDeclaration(
  node: TSESTree.Node,
): node is TSESTree.ClassDeclaration {
  return node.type === 'ClassDeclaration';
}

function isObjectExpression(
  node: TSESTree.Node,
): node is TSESTree.ObjectExpression {
  return node.type === 'ObjectExpression';
}

export function isArrayExpression(
  node: TSESTree.Node,
): node is TSESTree.ArrayExpression {
  return node.type === 'ArrayExpression';
}

function isProperty(node: TSESTree.Node): node is TSESTree.Property {
  return node.type === 'Property';
}

export function isLiteral(node: TSESTree.Node): node is TSESTree.Literal {
  return node.type === 'Literal';
}

interface LiteralWithStringValue extends TSESTree.Literal {
  value: string;
}

/**
 * ESTree does not differentiate between different types of Literals at the AST level,
 * but it is a common thing to need to do, so this utility and interface are here to
 * avoid repeated typeof checks on the node's value.
 */
export function isLiteralWithStringValue(
  node: TSESTree.Node,
): node is LiteralWithStringValue {
  return node.type === 'Literal' && typeof node.value === 'string';
}

function isMethodDefinition(
  node: TSESTree.Node,
): node is TSESTree.MethodDefinition {
  return node.type === 'MethodDefinition';
}

/**
 * SECTION END:
 * Equivalents of utils exported by TypeScript itself for its own AST
 */

export const getClassName = (node: TSESTree.Node): string | undefined => {
  if (isClassDeclaration(node)) {
    return node.id ? node.id.name : undefined;
  }
  if (node.parent) {
    return getClassName(node.parent);
  }
  return undefined;
};

export const getDecorator = (
  node: TSESTree.ClassDeclaration,
  decoratorName: string,
): TSESTree.Decorator | undefined => {
  if (!node.decorators) {
    return undefined;
  }
  return node.decorators.find(
    decorator =>
      isCallExpression(decorator.expression) &&
      decorator.expression.arguments &&
      decorator.expression.arguments.length > 0 &&
      getDecoratorName(decorator) === decoratorName,
  );
};

export const getDecoratorArgument = (
  decorator: TSESTree.Decorator,
): TSESTree.ObjectExpression | undefined => {
  const { expression } = decorator;
  if (
    !isCallExpression(expression) ||
    !expression.arguments ||
    expression.arguments.length === 0
  ) {
    return undefined;
  }
  const arg = expression.arguments[0];
  return isObjectExpression(arg) && arg.properties ? arg : undefined;
};

export const getDecoratorName = (
  decorator: TSESTree.Decorator,
): string | undefined => {
  const { expression } = decorator;

  if (isIdentifier(expression)) return expression.name;

  if (isCallExpression(expression) && isIdentifier(expression.callee)) {
    return expression.callee.name;
  }

  return undefined;
};

export const getPipeDecorator = (
  node: TSESTree.ClassDeclaration,
): TSESTree.Decorator | undefined => getDecorator(node, 'Pipe');

export const getSymbolName = (
  expression: TSESTree.ExpressionWithTypeArguments,
): string => {
  const { expression: childExpression } = expression;

  // TODO: Investigate "as any"
  return isMemberExpression(childExpression)
    ? (childExpression.property as any).name
    : (childExpression as any).name;
};

export const getDeclaredInterfaces = (
  node: TSESTree.ClassDeclaration,
): TSESTree.ExpressionWithTypeArguments[] => {
  return node.implements || [];
};

export const getDeclaredInterfaceNames = (
  node: TSESTree.ClassDeclaration,
): string[] => getDeclaredInterfaces(node).map(getSymbolName);

export const getDeclaredInterfaceName = (
  node: TSESTree.ClassDeclaration,
  value: string,
): string | undefined =>
  getDeclaredInterfaceNames(node).find(
    interfaceName => interfaceName === value,
  );

export const getDeclaredAngularLifecycleInterfaces = (
  node: TSESTree.ClassDeclaration,
): ReadonlyArray<AngularLifecycleInterfaceKeys> =>
  getDeclaredInterfaceNames(node).filter(
    isAngularLifecycleInterface,
  ) as ReadonlyArray<AngularLifecycleInterfaceKeys>;

export const ANGULAR_LIFECYCLE_INTERFACES: ReadonlySet<
  AngularLifecycleInterfaceKeys
> = new Set(angularLifecycleInterfaceKeys);

export const ANGULAR_LIFECYCLE_METHODS: ReadonlySet<
  AngularLifecycleMethodKeys
> = new Set(angularLifecycleMethodKeys);

export const isAngularLifecycleInterface = (
  value: string,
): value is AngularLifecycleInterfaceKeys =>
  ANGULAR_LIFECYCLE_INTERFACES.has(value as AngularLifecycleInterfaceKeys);

export const isAngularLifecycleMethod = (
  value: string,
): value is AngularLifecycleMethodKeys =>
  ANGULAR_LIFECYCLE_METHODS.has(value as AngularLifecycleMethodKeys);

/**
 * `ClassProperty` nodes can have different types of `key`s
 *
 * E.g.
 *
 * class Foo {
 *  a // Identifier
 * 'b' // Literal
 *  ['c'] // Literal
 * }
 */
export function getClassPropertyName(
  classProperty: TSESTree.ClassProperty,
): string {
  if (classProperty.key.type === 'Identifier') {
    return classProperty.key.name;
  }

  if (classProperty.key.type === 'Literal') {
    return classProperty.key.raw;
  }

  throw new Error(
    `Unexpected "ClassProperty.key.type" provided: ${classProperty.key.type}`,
  );
}

export const getDecoratorProperty = (
  decorator: TSESTree.Decorator,
  name: string,
): TSESTree.Property | undefined => {
  const arg = getDecoratorArgument(decorator);

  if (!arg || !isObjectExpression(arg)) return undefined;

  const properties = arg.properties as TSESTree.Property[];
  const property = properties.find(
    prop => !!(prop.key && isIdentifier(prop.key) && prop.key.name === name),
  );

  if (!property || !isProperty(property)) return undefined;

  return property;
};

export const getDecoratorPropertyValue = (
  decorator: TSESTree.Decorator,
  name: string,
): TSESTree.Expression | TSESTree.Literal | undefined => {
  const property = getDecoratorProperty(decorator, name);
  if (!property) {
    return undefined;
  }

  /**
   * TODO: Investigate as any
   */
  return property.value as any;
};

export const getDeclaredMethods = (node: TSESTree.ClassDeclaration) => {
  return node.body.body.filter(isMethodDefinition);
};

export const getMethodName = (node: TSESTree.MethodDefinition): string => {
  if (isLiteral(node.key)) {
    return node.key.value as string;
  }
  return (node.key as TSESTree.Identifier).name;
};

export const getLifecycleInterfaceByMethodName = (
  methodName: AngularLifecycleMethodKeys,
): AngularLifecycleInterfaceKeys =>
  methodName.slice(2) as AngularLifecycleInterfaceKeys;
