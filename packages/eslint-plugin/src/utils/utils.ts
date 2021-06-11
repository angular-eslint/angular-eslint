import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

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

export const ANGULAR_INNER_CLASS_DECORATORS: ReadonlySet<AngularInnerClassDecoratorKeys> = new Set(
  angularInnerClassDecoratorKeys,
);

export const ANGULAR_CLASS_DECORATORS: ReadonlySet<AngularClassDecoratorKeys> = new Set(
  angularClassDecoratorKeys,
);

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

/**
 * SECTION START:
 * Equivalents of utils exported by TypeScript itself for its own AST
 */

export function isCallExpression(
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

export function isClassDeclaration(
  node: TSESTree.Node,
): node is TSESTree.ClassDeclaration {
  return node.type === 'ClassDeclaration';
}

export function isObjectExpression(
  node: TSESTree.Node,
): node is TSESTree.ObjectExpression {
  return node.type === 'ObjectExpression';
}

export function isArrayExpression(
  node: TSESTree.Node,
): node is TSESTree.ArrayExpression {
  return node.type === 'ArrayExpression';
}

export function isProperty(node: TSESTree.Node): node is TSESTree.Property {
  return node.type === 'Property';
}

function isProgram(node: TSESTree.Node): node is TSESTree.Program {
  return node.type === 'Program';
}

export function isLiteral(node: TSESTree.Node): node is TSESTree.Literal {
  return node.type === 'Literal';
}

export function isTemplateLiteral(
  node: TSESTree.Node,
): node is TSESTree.TemplateLiteral {
  return node.type === 'TemplateLiteral';
}

export function isImportDeclaration(
  node: TSESTree.Node,
): node is TSESTree.ImportDeclaration {
  return node.type === 'ImportDeclaration';
}

function isImportSpecifier(
  node: TSESTree.Node,
): node is TSESTree.ImportSpecifier {
  return node.type === 'ImportSpecifier';
}

type LiteralWithStringValue = TSESTree.Literal & {
  value: string;
};

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

export function isMethodDefinition(
  node: TSESTree.Node,
): node is TSESTree.MethodDefinition {
  return node.type === 'MethodDefinition';
}

export function isSuper(node: TSESTree.Node): node is TSESTree.Super {
  return node.type === 'Super';
}

/**
 * SECTION END:
 * Equivalents of utils exported by TypeScript itself for its own AST
 */

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

export function getImplementsRemoveFix(
  sourceCode: Readonly<TSESLint.SourceCode>,
  classDeclaration: TSESTree.ClassDeclaration,
  interfaceName: string,
  fixer: TSESLint.RuleFixer,
): TSESLint.RuleFix | undefined {
  const { implements: classImplements } = classDeclaration;

  if (!classImplements) return undefined;

  const identifier = classImplements
    .map(({ expression }) => expression)
    .filter(isIdentifier)
    .find(({ name }) => name === interfaceName);

  if (!identifier) return undefined;

  const isFirstInterface = classImplements[0].expression === identifier;
  const isLastInterface =
    classImplements[classImplements.length - 1].expression === identifier;
  const isSingleInterface = isFirstInterface && isLastInterface;

  if (isSingleInterface && classDeclaration.id) {
    return fixer.removeRange([
      classDeclaration.id.range[1],
      classImplements[0].range[1],
    ]);
  }

  const tokenAfterInterface = sourceCode.getTokenAfter(identifier);

  if (isFirstInterface && tokenAfterInterface) {
    return fixer.removeRange([
      identifier.range[0],
      tokenAfterInterface.range[1],
    ]);
  }

  const tokenBeforeInterface = sourceCode.getTokenBefore(identifier);

  if (!tokenBeforeInterface) return undefined;

  return fixer.removeRange([
    tokenBeforeInterface.range[0],
    identifier.range[1],
  ]);
}

function getImportDeclarationSpecifier(
  importDeclarations: readonly TSESTree.ImportDeclaration[],
  importedName: string,
) {
  for (const importDeclaration of importDeclarations) {
    const importSpecifier = importDeclaration.specifiers.find(
      (importClause): importClause is TSESTree.ImportSpecifier => {
        return (
          isImportSpecifier(importClause) &&
          importClause.imported.name === importedName
        );
      },
    );

    if (importSpecifier) {
      return { importDeclaration, importSpecifier } as const;
    }
  }

  return undefined;
}

export function getLast<T extends readonly unknown[]>(items: T): T[number] {
  return items.slice(-1)[0];
}

export function getImportAddFix(
  node: TSESTree.ClassDeclaration,
  moduleName: string,
  importedName: string,
  fixer: TSESLint.RuleFixer,
): TSESLint.RuleFix {
  const importDeclarations = getImportDeclarations(node, moduleName);

  if (!importDeclarations?.length) {
    return fixer.insertTextAfterRange(
      [0, 0],
      `import { ${importedName} } from '${moduleName}';\n`,
    );
  }

  const firstImportDeclaration = importDeclarations[0];
  const lastImportSpecifier = getLast(firstImportDeclaration.specifiers);

  return fixer.insertTextAfter(lastImportSpecifier, `, ${importedName}`);
}

export function getImportRemoveFix(
  sourceCode: Readonly<TSESLint.SourceCode>,
  importDeclarations: readonly TSESTree.ImportDeclaration[],
  importedName: string,
  fixer: TSESLint.RuleFixer,
): TSESLint.RuleFix | undefined {
  const { importDeclaration, importSpecifier } =
    getImportDeclarationSpecifier(importDeclarations, importedName) ?? {};

  if (!importDeclaration || !importSpecifier) return undefined;

  const isFirstImportSpecifier =
    importDeclaration.specifiers[0] === importSpecifier;
  const isLastImportSpecifier =
    importDeclaration.specifiers[importDeclaration.specifiers.length - 1] ===
    importSpecifier;
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
  { id, implements: implementz }: TSESTree.ClassDeclaration,
  interfaceName: string,
): {
  readonly implementsNodeReplace:
    | TSESTree.TSClassImplements
    | TSESTree.Identifier;
  readonly implementsTextReplace: string;
} {
  const [implementsNodeReplace, implementsTextReplace] = implementz
    ? [getLast(implementz), `, ${interfaceName}`]
    : [id as TSESTree.Identifier, ` implements ${interfaceName}`];

  return { implementsNodeReplace, implementsTextReplace } as const;
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
  node: TSESTree.ClassDeclaration,
  decoratorName: string,
): TSESTree.Decorator | undefined => {
  if (!node.decorators) {
    return undefined;
  }
  return node.decorators.find(
    (decorator) =>
      isCallExpression(decorator.expression) &&
      decorator.expression.arguments &&
      decorator.expression.arguments.length > 0 &&
      getDecoratorName(decorator) === decoratorName,
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
  expression: TSESTree.TSClassImplements,
): string => {
  const { expression: childExpression } = expression;

  // TODO: Investigate "as any"
  return isMemberExpression(childExpression)
    ? (childExpression.property as any).name
    : (childExpression as any).name;
};

export const getDeclaredInterfaces = (
  node: TSESTree.ClassDeclaration,
): TSESTree.TSClassImplements[] => {
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
    (interfaceName) => interfaceName === value,
  );

export const getDeclaredAngularLifecycleInterfaces = (
  node: TSESTree.ClassDeclaration,
): ReadonlyArray<AngularLifecycleInterfaceKeys> =>
  getDeclaredInterfaceNames(node).filter(
    isAngularLifecycleInterface,
  ) as ReadonlyArray<AngularLifecycleInterfaceKeys>;

export const getDeclaredAngularLifecycleMethods = (
  node: TSESTree.ClassDeclaration,
): ReadonlyArray<AngularLifecycleMethodKeys> =>
  getDeclaredMethods(node)
    .map(getMethodName)
    .filter(isAngularLifecycleMethod) as ReadonlyArray<
    AngularLifecycleMethodKeys
  >;

export const ANGULAR_LIFECYCLE_INTERFACES: ReadonlySet<AngularLifecycleInterfaceKeys> = new Set(
  angularLifecycleInterfaceKeys,
);

export const ANGULAR_LIFECYCLE_METHODS: ReadonlySet<AngularLifecycleMethodKeys> = new Set(
  angularLifecycleMethodKeys,
);

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
    (prop) => prop.key && isIdentifier(prop.key) && prop.key.name === name,
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

/**
 * Enforces the invariant that the input is an array.
 */
export function arrayify<T>(arg?: T | T[]): T[] {
  if (Array.isArray(arg)) {
    return arg;
  } else if (arg != undefined) {
    return [arg];
  } else {
    return [];
  }
}

// Needed because in the current Typescript version (TS 3.3.3333), Boolean() cannot be used to perform a null check.
// For more, see: https://github.com/Microsoft/TypeScript/issues/16655
export const isNotNullOrUndefined = <T>(
  input: null | undefined | T,
): input is T => input !== null && input !== undefined;

export const SelectorValidator = {
  attribute(selector: string): boolean {
    return selector.length !== 0;
  },

  camelCase(selector: string): boolean {
    return /^[a-zA-Z0-9[\]]+$/.test(selector);
  },

  element(selector: string): boolean {
    return selector !== null;
  },

  kebabCase(selector: string): boolean {
    return /^[a-z0-9-]+-[a-z0-9-]+$/.test(selector);
  },

  prefix(
    prefix: string,
    selectorStyle: SelectorStyle,
  ): (selector: string) => boolean {
    const regex = new RegExp(`^\\[?(${prefix})`);

    return (selector) => {
      if (!prefix) return true;

      if (!regex.test(selector)) return false;

      const suffix = selector.replace(regex, '');

      if (selectorStyle === OPTION_STYLE_CAMEL_CASE) {
        return !suffix || suffix[0] === suffix[0].toUpperCase();
      } else if (selectorStyle === OPTION_STYLE_KEBAB_CASE) {
        return !suffix || suffix[0] === '-';
      }

      throw Error('Invalid selector style!');
    };
  },
};

export const kebabToCamelCase = (value: string) =>
  value.replace(/-[a-zA-Z]/g, (x) => x[1].toUpperCase());

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

/**
 * Convert an array to human-readable text.
 */
export const toHumanReadableText = (items: readonly string[]): string => {
  const itemsLength = items.length;

  if (itemsLength === 1) {
    return `"${items[0]}"`;
  }

  return `${items
    .map((item) => `"${item}"`)
    .slice(0, itemsLength - 1)
    .join(', ')} or "${[...items].pop()}"`;
};

export const toPattern = (value: readonly unknown[]) =>
  RegExp(`^(${value.join('|')})$`);
