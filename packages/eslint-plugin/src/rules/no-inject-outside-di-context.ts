import { ASTUtils } from '@angular-eslint/utils';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noInjectOutsideDiContext';
export const RULE_NAME = 'no-inject-outside-di-context';

const INJECT_DOC = 'https://angular.dev/api/core/inject';
const DEPENDENCY_INJECTION_CONTEXT_DOC =
  'https://angular.dev/guide/di/dependency-injection-context';

const functionTypesWithInjectionContext: readonly string[] = [
  'CanActivateFn',
  'CanActivateChildFn',
  'CanDeactivateFn',
  'CanMatchFn',
  'ResolveFn',
  // see https://github.com/angular/angular/pull/64938
  'RunGuardsAndResolvers',
  // see https://github.com/angular/angular/pull/62133
  'LoadChildren',
  'LoadChildrenCallback',
  'HttpInterceptorFn',
  // see https://angular.dev/api/router/ViewTransitionsFeatureOptions#onViewTransitionCreated
  'ViewTransitionsFeatureOptions',
];
const methodsAndInterfacesWithInjectionContextMap: ReadonlyMap<string, string> =
  new Map<string, string>([
    ['canActivate', 'CanActivate'],
    ['canActivateChild', 'CanActivateChild'],
    ['canDeactivate', 'CanDeactivate'],
    ['canMatch', 'CanMatch'],
    ['resolve', 'Resolve'],
    ['intercept', 'HttpInterceptor'],
  ]);
const methodsWithInjectionContext = Array.from(
  methodsAndInterfacesWithInjectionContextMap.keys(),
);
const functionsWithInjectionContext: readonly string[] = [
  // see https://angular.dev/api/core/runInInjectionContext
  'runInInjectionContext',
  // see https://angular.dev/api/core/provideAppInitializer
  'provideAppInitializer',
  // see https://angular.dev/api/core/providePlatformInitializer
  'providePlatformInitializer',
  // see https://angular.dev/api/core/provideEnvironmentInitializer
  'provideEnvironmentInitializer',
  // see https://angular.dev/api/router/withViewTransitions
  'withViewTransitions',
];

/**
 * Same as `ASTUtils.getNearestNodeFrom()`,
 * but returns `null` if there is a `CallExpression` during traversal.
 * This is needed for this rule because the injection context is lost when inside a callback.
 */
function getNearestNodeWithoutCallExpressionInBetweenFrom<
  T extends TSESTree.Node,
>(
  { parent }: TSESTree.Node,
  predicate: (parent: TSESTree.Node) => parent is T,
): T | null {
  while (parent && parent.type !== AST_NODE_TYPES.Program) {
    if (parent.type === AST_NODE_TYPES.CallExpression) {
      return null;
    }
    if (predicate(parent)) {
      return parent;
    }

    parent = parent.parent;
  }

  return null;
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Ensures that \`inject()\` is called in an injection context`,
    },
    schema: [],
    messages: {
      noInjectOutsideDiContext: `\`inject()\` must be called in an injection context. See more at ${INJECT_DOC} and ${DEPENDENCY_INJECTION_CONTEXT_DOC}`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type !== AST_NODE_TYPES.Identifier ||
          node.callee.name !== 'inject' ||
          isInInjectionContext(node)
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'noInjectOutsideDiContext',
        });
      },
    };
  },
});

function isInInjectionContext(node: TSESTree.Node): boolean {
  const parent: TSESTree.Node | undefined = node.parent;

  if (
    parent &&
    // Start with constructor and field initializer, as they are by far the most common case, to avoid useless checks
    (isInAngularClassInitialization(parent) ||
      // Special contexts (guard, resolver and interceptor) are the second most common case
      // 1. modern function syntax, 2. legacy class syntax, 3. directly inline inside a route
      isInFunctionTypeWithInjectionContext(parent) ||
      isInMethodWithInjectionContext(parent) ||
      isInRoute(parent) ||
      // Factories
      isInFactoryFunction(parent) ||
      // Special functions like `runInInjectionContext` and some application providers
      isInFunctionWithInjectionContext(parent) ||
      // Custom injectable functions where context is asserted
      isInjectionContextAsserted(parent))
  ) {
    return true;
  }

  return false;
}

function isInAngularClassInitialization(node: TSESTree.Node): boolean {
  // Start with field initializer, as it is the most common case, and it does not require traversal
  if (ASTUtils.isPropertyDefinition(node) || isInConstructor(node)) {
    const classDeclaration = ASTUtils.getNearestNodeFrom(
      node,
      ASTUtils.isClassDeclaration,
    );

    if (
      classDeclaration &&
      ASTUtils.getAngularClassDecorator(classDeclaration)
    ) {
      return true;
    }
  }
  return false;
}

function isInConstructor(node: TSESTree.Node): boolean {
  const methodDefinition = getNearestNodeWithoutCallExpressionInBetweenFrom(
    node,
    ASTUtils.isMethodDefinition,
  );
  if (methodDefinition?.kind === 'constructor') {
    return true;
  }
  return false;
}

function isInFunctionTypeWithInjectionContext(node: TSESTree.Node): boolean {
  // Check the variable type is an accepted type like `CanActivateFn`
  const variableDeclarator = getNearestNodeWithoutCallExpressionInBetweenFrom(
    node,
    (node) => node.type === AST_NODE_TYPES.VariableDeclarator,
  );

  const typeAnnotation = variableDeclarator?.id.typeAnnotation?.typeAnnotation;

  if (
    typeAnnotation?.type === AST_NODE_TYPES.TSTypeReference &&
    typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier &&
    functionTypesWithInjectionContext.includes(typeAnnotation.typeName.name) &&
    !isAfterAwait(node)
  ) {
    return true;
  }

  return false;
}

function isInMethodWithInjectionContext(node: TSESTree.Node): boolean {
  // Check if the method name is one of the accepted ones like `canActivate`
  const methodDefinition = getNearestNodeWithoutCallExpressionInBetweenFrom(
    node,
    ASTUtils.isMethodDefinition,
  );

  if (
    methodDefinition?.key.type !== AST_NODE_TYPES.Identifier ||
    !methodsWithInjectionContext.includes(methodDefinition.key.name)
  ) {
    return false;
  }

  // Check if we are in an injectable Angular class
  const classDeclaration = ASTUtils.getNearestNodeFrom(
    node,
    ASTUtils.isClassDeclaration,
  );

  if (
    !classDeclaration ||
    !ASTUtils.getAngularClassDecorator(classDeclaration)
  ) {
    return false;
  }

  // Check if the class implements the according accepted interface
  const implementName = methodsAndInterfacesWithInjectionContextMap.get(
    methodDefinition.key.name,
  );

  if (
    implementName !== undefined &&
    classDeclaration.implements.find(
      ({ expression }) =>
        expression.type === AST_NODE_TYPES.Identifier &&
        expression.name === implementName,
    ) !== undefined &&
    !isAfterAwait(node)
  ) {
    return true;
  }

  return false;
}

function isInRoute(node: TSESTree.Node): boolean {
  // Check the variable type is `Route` or `Routes`
  const variableDeclarator = getNearestNodeWithoutCallExpressionInBetweenFrom(
    node,
    (node) => node.type === AST_NODE_TYPES.VariableDeclarator,
  );

  const typeAnnotation = variableDeclarator?.id.typeAnnotation?.typeAnnotation;

  if (
    typeAnnotation?.type === AST_NODE_TYPES.TSTypeReference &&
    typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier &&
    ['Routes', 'Route'].includes(typeAnnotation.typeName.name) &&
    !isAfterAwait(node)
  ) {
    return true;
  }

  return false;
}

function isInFactoryFunction(node: TSESTree.Node): boolean {
  const property = getNearestNodeWithoutCallExpressionInBetweenFrom(
    node,
    ASTUtils.isProperty,
  );

  if (
    property &&
    (isPropertyInProviderFactory(property) ||
      isPropertyInInjectionTokenFactory(property) ||
      isPropertyInInjectableFactory(property))
  ) {
    return true;
  }

  return false;
}

function isPropertyInInjectionTokenFactory(
  property: TSESTree.PropertyComputedName | TSESTree.PropertyNonComputedName,
): boolean {
  // Check the property is inside a `new InjectionToken()`
  const newExpression = ASTUtils.getNearestNodeFrom(
    property,
    (node) => node.type === AST_NODE_TYPES.NewExpression,
  );

  if (
    newExpression?.callee.type === AST_NODE_TYPES.Identifier &&
    newExpression.callee.name === 'InjectionToken'
  ) {
    return true;
  }

  return false;
}

function isPropertyInProviderFactory(
  property: TSESTree.PropertyComputedName | TSESTree.PropertyNonComputedName,
): boolean {
  // Check the property is called `useFactory`
  if (
    property.key.type !== AST_NODE_TYPES.Identifier ||
    property.key.name !== 'useFactory'
  ) {
    return false;
  }

  // Check the object contains another property called `provide`
  const objectExpression = ASTUtils.getNearestNodeFrom(
    property,
    ASTUtils.isObjectExpression,
  );

  const provideProperty = objectExpression?.properties.find(
    (objectProperty) =>
      objectProperty.type === AST_NODE_TYPES.Property &&
      objectProperty.key.type === AST_NODE_TYPES.Identifier &&
      objectProperty.key.name === 'provide',
  );

  if (provideProperty !== undefined) {
    return true;
  }

  return false;
}

function isPropertyInInjectableFactory(
  property: TSESTree.PropertyComputedName | TSESTree.PropertyNonComputedName,
): boolean {
  // Check the property is called `useFactory`
  if (
    property.key.type !== AST_NODE_TYPES.Identifier ||
    property.key.name !== 'useFactory'
  ) {
    return false;
  }

  // Check the property is inside an `Injectable()`
  const classDeclaration = ASTUtils.getNearestNodeFrom(
    property,
    ASTUtils.isClassDeclaration,
  );

  if (!classDeclaration) {
    return false;
  }

  if (ASTUtils.getAngularClassDecorator(classDeclaration) === 'Injectable') {
    return true;
  }

  return false;
}

function isInFunctionWithInjectionContext(node: TSESTree.Node): boolean {
  const callExpression = ASTUtils.getNearestNodeFrom(
    node,
    ASTUtils.isCallExpression,
  );

  if (
    callExpression?.callee.type === AST_NODE_TYPES.Identifier &&
    functionsWithInjectionContext.includes(callExpression.callee.name) &&
    !isAfterAwait(node)
  ) {
    return true;
  }

  return false;
}

function isInjectionContextAsserted(node: TSESTree.Node): boolean {
  // Check there is an `assertInInjectionContext` call in the same block
  const blockStatement = getNearestNodeWithoutCallExpressionInBetweenFrom(
    node,
    (node) => node.type === AST_NODE_TYPES.BlockStatement,
  );

  const assertCall = blockStatement?.body.find(
    (body) =>
      body.type === AST_NODE_TYPES.ExpressionStatement &&
      body.expression.type === 'CallExpression' &&
      body.expression.callee.type === AST_NODE_TYPES.Identifier &&
      body.expression.callee.name === 'assertInInjectionContext',
  );

  if (assertCall !== undefined) {
    return true;
  }

  return false;
}

function isAfterAwait(node: TSESTree.Node): boolean {
  // Check there is an `await` expression in the same block, before the node
  const blockStatement = getNearestNodeWithoutCallExpressionInBetweenFrom(
    node,
    (node) => node.type === AST_NODE_TYPES.BlockStatement,
  );

  if (blockStatement === null) {
    return false;
  }

  const awaitExpression = blockStatement.body.find(
    (body) =>
      body.type === AST_NODE_TYPES.ExpressionStatement &&
      body.expression.type === AST_NODE_TYPES.AwaitExpression,
  );

  if (awaitExpression === undefined) {
    return false;
  }

  if (
    node.loc.end.line > awaitExpression.loc.start.line ||
    (node.loc.end.line === awaitExpression.loc.start.line &&
      node.loc.end.column > awaitExpression.loc.start.column)
  ) {
    return true;
  }

  return false;
}

export const RULE_DOCS_EXTENSION = {
  rationale: `The \`inject()\` function can only be called within an injection context — specifically in constructors or field initializers of classes decorated with \`@Component\`, \`@Directive\`, \`@Injectable\`, or \`@Pipe\`, in special cases like guards, resolvers and interceptors, or in factory functions (\`useFactory\` in providers or \`factory\` in InjectionTokens). When used in lifecycle methods like \`ngOnInit()\` or \`ngAfterViewInit()\`, in regular methods, in constructors of plain classes not managed by Angular's DI system, the injection context is not available, and \`inject()\` will throw a runtime error: "NG0203: inject() must be called from an injection context." Also, even in allowed places, the injection context is lost if inside a nested callback or after an \`await\`. To fix this, move \`inject()\` into an injection context.`,
};
