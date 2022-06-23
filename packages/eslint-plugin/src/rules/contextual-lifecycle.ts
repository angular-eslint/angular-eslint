import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'contextualLifecycle';
export const RULE_NAME = 'contextual-lifecycle';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensures that lifecycle methods are used in a correct context',
      recommended: 'error',
    },
    schema: [],
    messages: {
      contextualLifecycle: `Angular will not invoke the \`{{methodName}}\` lifecycle method within \`@{{classDecoratorName}}()\` classes`,
    },
  },
  defaultOptions: [],
  create(context) {
    function checkContext(
      { parent }: TSESTree.Decorator,
      decorator: ASTUtils.AngularClassDecorators,
    ) {
      const classDeclaration = parent as TSESTree.ClassDeclaration;
      const allowedMethods =
        ASTUtils.ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER.get(decorator);
      const declaredMethods = ASTUtils.getDeclaredMethods(classDeclaration);

      for (const method of declaredMethods) {
        const methodName = ASTUtils.getMethodName(method);

        if (
          !methodName ||
          !ASTUtils.isAngularLifecycleMethod(methodName) ||
          allowedMethods?.has(methodName)
        ) {
          continue;
        }

        context.report({
          node: method.key,
          messageId: 'contextualLifecycle',
          data: { classDecoratorName: decorator, methodName },
        });
      }
    }

    return {
      [Selectors.COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, ASTUtils.AngularClassDecorators.Component);
      },
      [Selectors.DIRECTIVE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, ASTUtils.AngularClassDecorators.Directive);
      },
      [Selectors.INJECTABLE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, ASTUtils.AngularClassDecorators.Injectable);
      },
      [Selectors.MODULE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, ASTUtils.AngularClassDecorators.NgModule);
      },
      [Selectors.PIPE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, ASTUtils.AngularClassDecorators.Pipe);
      },
    };
  },
});
