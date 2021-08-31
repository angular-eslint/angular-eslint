import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { ASTUtils } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

export const objectKeys = Object.keys as <T>(
  o: T,
) => readonly Extract<keyof T, string>[];

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

export function isClassDeclaration(
  node: TSESTree.Node,
): node is TSESTree.ClassDeclaration {
  return node.type === AST_NODE_TYPES.ClassDeclaration;
}

export function isClassProperty(
  node: TSESTree.Node,
): node is TSESTree.ClassProperty {
  return node.type === AST_NODE_TYPES.ClassProperty;
}

export function isClassPropertyOrMethodDefinition(
  node: TSESTree.Node,
): node is TSESTree.ClassProperty | TSESTree.MethodDefinition {
  return isClassProperty(node) || isMethodDefinition(node);
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

function isImportSpecifier(
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

// SECTION END:
// Equivalents of utils exported by TypeScript itself for its own AST

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
    .filter(ASTUtils.isIdentifier)
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
): TSESLint.RuleFix | undefined {
  const importDeclarations = getImportDeclarations(node, moduleName);

  if (!importDeclarations?.length) {
    return fixer.insertTextAfterRange(
      [0, 0],
      `import { ${importedName} } from '${moduleName}';\n`,
    );
  }

  const importDeclarationSpecifier = getImportDeclarationSpecifier(
    importDeclarations,
    importedName,
  );

  if (importDeclarationSpecifier) return undefined;

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
  return node.decorators?.find(
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

export const getPipeDecorator = (
  node: TSESTree.ClassDeclaration,
): TSESTree.Decorator | undefined => getDecorator(node, 'Pipe');

export const getDeclaredInterfaces = (
  node: TSESTree.ClassDeclaration,
): TSESTree.TSClassImplements[] => {
  return node.implements ?? [];
};

export const getDeclaredInterfaceNames = (
  node: TSESTree.ClassDeclaration,
): readonly string[] =>
  getDeclaredInterfaces(node)
    .map(({ expression }) =>
      isMemberExpression(expression) ? expression.property : expression,
    )
    .filter(ASTUtils.isIdentifier)
    .map(({ name }) => name);

export const getDeclaredInterfaceName = (
  node: TSESTree.ClassDeclaration,
  value: string,
): string | undefined =>
  getDeclaredInterfaceNames(node).find(
    (interfaceName) => interfaceName === value,
  );

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
export function getClassPropertyName({ key }: TSESTree.ClassProperty): string {
  if (ASTUtils.isIdentifier(key)) {
    return key.name;
  }

  if (isLiteral(key)) {
    return key.raw;
  }

  throw new Error(`Unexpected "ClassProperty.key.type" provided: ${key.type}`);
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

export const getMethodName = (
  node: TSESTree.MethodDefinition,
): string | undefined => {
  if (isStringLiteral(node.key)) {
    return node.key.value;
  }
  return ASTUtils.isIdentifier(node.key) ? node.key.name : undefined;
};

export const getLifecycleInterfaceByMethodName = (
  methodName: AngularLifecycleMethodKeys,
): AngularLifecycleInterfaceKeys =>
  methodName.slice(2) as AngularLifecycleInterfaceKeys;

/**
 * Enforces the invariant that the input is an array.
 */
export function arrayify<T>(value: T | readonly T[]): readonly T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return (value ? [value] : []) as readonly T[];
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

export const kebabToCamelCase = (value: string): string =>
  value.replace(/-[a-zA-Z]/g, ({ 1: letterAfterDash }) =>
    letterAfterDash.toUpperCase(),
  );

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

export const toPattern = (value: readonly unknown[]): RegExp =>
  RegExp(`^(${value.join('|')})$`);

export function getRawText(
  node:
    | TSESTree.Identifier
    | TSESTree.Literal
    | TSESTree.TemplateElement
    | TSESTree.TemplateLiteral,
): string {
  if (ASTUtils.isIdentifier(node)) {
    return node.name;
  }

  if (isLiteral(node)) {
    return String(node.value);
  }

  const templateElement = isTemplateLiteral(node) ? node.quasis[0] : node;
  return templateElement.value.raw;
}

export function getReplacementText(
  node: TSESTree.Literal | TSESTree.TemplateElement | TSESTree.TemplateLiteral,
  text: string,
): string {
  return isLiteral(node) ? `'${text}'` : `\`${text}\``;
}

export function capitalize<T extends string>(text: T): Capitalize<T> {
  return `${text[0].toUpperCase()}${text.slice(1)}` as Capitalize<T>;
}

export function withoutBracketsAndWhitespaces(text: string): string {
  return text.replace(/[[\]\s]/g, '');
}
