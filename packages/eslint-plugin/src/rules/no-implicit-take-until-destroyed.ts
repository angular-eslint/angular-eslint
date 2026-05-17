import { ASTUtils } from '@angular-eslint/utils';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noImplicitTakeUntilDestroyed';
export const RULE_NAME = 'no-implicit-take-until-destroyed';

const RXJS_INTEROP_LINK =
  'https://angular.dev/ecosystem/rxjs-interop/take-until-destroyed';
const DEPENDENCY_INJECTION_CONTEXT =
  'https://angular.dev/guide/di/dependency-injection-context';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Ensures that \`takeUntilDestroyed()\` is called with an explicit \`DestroyRef\` when used outside of an injection context`,
    },
    schema: [],
    messages: {
      noImplicitTakeUntilDestroyed: `\`takeUntilDestroyed()\` must be called with an explicit \`DestroyRef\` parameter when used outside of an injection context. See more at ${DEPENDENCY_INJECTION_CONTEXT} and ${RXJS_INTEROP_LINK}`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type !== AST_NODE_TYPES.Identifier ||
          node.callee.name !== 'takeUntilDestroyed' ||
          node.arguments.length > 0 ||
          isInInjectionContext(node)
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'noImplicitTakeUntilDestroyed',
        });
      },
    };
  },
});

function isInInjectionContext(node: TSESTree.Node): boolean {
  let current: TSESTree.Node | undefined = node;

  while (current) {
    if (isInFactoryFunction(current)) {
      return true;
    }

    if (
      ASTUtils.isPropertyDefinition(current) ||
      isConstructorMethod(current)
    ) {
      const classDeclaration = ASTUtils.getNearestNodeFrom(
        current,
        ASTUtils.isClassDeclaration,
      );

      if (!classDeclaration) {
        current = current.parent;
        continue;
      }

      const decorator = ASTUtils.getAngularClassDecorator(classDeclaration);

      if (decorator && decorator !== 'NgModule') {
        return true;
      }
    }

    if (isNonConstructorMethod(current)) {
      const classDeclaration = ASTUtils.getNearestNodeFrom(
        current,
        ASTUtils.isClassDeclaration,
      );

      if (classDeclaration) {
        const decorator = ASTUtils.getAngularClassDecorator(classDeclaration);

        if (
          decorator &&
          decorator !== 'NgModule' &&
          isMethodCalledFromInjectionContext(
            current as TSESTree.MethodDefinition,
            classDeclaration,
          )
        ) {
          return true;
        }
      }
    }

    current = current.parent;
  }

  return false;
}

function isConstructorMethod(node: TSESTree.Node) {
  return (
    node.type === AST_NODE_TYPES.MethodDefinition && node.kind === 'constructor'
  );
}

function isNonConstructorMethod(
  node: TSESTree.Node,
): node is TSESTree.MethodDefinition {
  return (
    node.type === AST_NODE_TYPES.MethodDefinition && node.kind !== 'constructor'
  );
}

function getMethodName(node: TSESTree.MethodDefinition): string | null {
  if (
    node.key.type === AST_NODE_TYPES.Identifier ||
    node.key.type === AST_NODE_TYPES.PrivateIdentifier
  ) {
    return node.key.name;
  }
  return null;
}

function isMethodCalledFromInjectionContext(
  method: TSESTree.MethodDefinition,
  classDeclaration: TSESTree.ClassDeclaration,
): boolean {
  const methodName = getMethodName(method);
  if (!methodName) {
    return false;
  }

  const isPrivateField = method.key.type === AST_NODE_TYPES.PrivateIdentifier;

  for (const member of classDeclaration.body.body) {
    if (
      !isConstructorMethod(member) &&
      !ASTUtils.isPropertyDefinition(member)
    ) {
      continue;
    }

    if (containsCallToMethod(member, methodName, isPrivateField)) {
      return true;
    }
  }

  return false;
}

function isASTNode(value: unknown): value is TSESTree.Node {
  return (
    value !== null &&
    typeof value === 'object' &&
    'type' in value &&
    typeof (value as { type: unknown }).type === 'string'
  );
}

function containsCallToMethod(
  node: TSESTree.Node,
  methodName: string,
  isPrivateField: boolean,
): boolean {
  if (
    node.type === AST_NODE_TYPES.CallExpression &&
    node.callee.type === AST_NODE_TYPES.MemberExpression
  ) {
    const { object, property } = node.callee;

    if (object.type === AST_NODE_TYPES.ThisExpression) {
      if (
        isPrivateField &&
        property.type === AST_NODE_TYPES.PrivateIdentifier &&
        property.name === methodName
      ) {
        return true;
      }

      if (
        !isPrivateField &&
        property.type === AST_NODE_TYPES.Identifier &&
        property.name === methodName
      ) {
        return true;
      }
    }
  }

  for (const key of Object.keys(node) as (keyof typeof node)[]) {
    if (key === 'parent') continue;

    const child = node[key];
    if (child && typeof child === 'object') {
      if (Array.isArray(child)) {
        for (const item of child) {
          if (
            isASTNode(item) &&
            containsCallToMethod(item, methodName, isPrivateField)
          ) {
            return true;
          }
        }
      } else if (isASTNode(child)) {
        if (containsCallToMethod(child, methodName, isPrivateField)) {
          return true;
        }
      }
    }
  }

  return false;
}

function isInFactoryFunction(node: TSESTree.Node): boolean {
  if (
    node.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
    node.type !== AST_NODE_TYPES.FunctionExpression
  ) {
    return false;
  }

  const parent = node.parent;

  if (!ASTUtils.isProperty(parent)) {
    return false;
  }

  const key = parent.key;

  if (
    key.type === AST_NODE_TYPES.Identifier &&
    ['factory', 'useFactory'].includes(key.name)
  ) {
    return true;
  }

  return false;
}

export const RULE_DOCS_EXTENSION = {
  rationale: `The \`takeUntilDestroyed()\` operator can automatically infer the current component's or directive's \`DestroyRef\` only when called within an injection context — specifically in constructors or field initializers of classes decorated with \`@Component\`, \`@Directive\`, \`@Injectable\`, or \`@Pipe\`, or in factory functions (\`useFactory\` in providers or \`factory\` in InjectionTokens). When used in lifecycle methods like \`ngOnInit()\` or \`ngAfterViewInit()\`, in regular methods, in constructors of plain classes not managed by Angular's DI system, or in \`@NgModule\` classes (which don't support the \`ngOnDestroy\` lifecycle), the injection context is not available, and \`takeUntilDestroyed()\` will throw a runtime error: "NG0203: inject() must be called from an injection context." To fix this, inject \`DestroyRef\` using \`inject(DestroyRef)\` and pass it explicitly: \`takeUntilDestroyed(this.destroyRef)\`.`,
};
