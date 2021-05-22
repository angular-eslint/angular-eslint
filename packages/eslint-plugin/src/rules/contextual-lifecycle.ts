import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  COMPONENT_CLASS_DECORATOR,
  DIRECTIVE_CLASS_DECORATOR,
  INJECTABLE_CLASS_DECORATOR,
  MODULE_CLASS_DECORATOR,
  PIPE_CLASS_DECORATOR,
} from '../utils/selectors';
import {
  AngularClassDecorators,
  ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER,
  getDeclaredMethods,
  getMethodName,
  isAngularLifecycleMethod,
} from '../utils/utils';

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
      category: 'Possible Errors',
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
      decorator: AngularClassDecorators,
    ) {
      const classDeclaration = parent as TSESTree.ClassDeclaration;
      const allowedMethods = ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER.get(
        decorator,
      );
      const declaredMethods = getDeclaredMethods(classDeclaration);

      for (const method of declaredMethods) {
        const methodName = getMethodName(method);

        if (
          !isAngularLifecycleMethod(methodName) ||
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
      [COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, AngularClassDecorators.Component);
      },
      [DIRECTIVE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, AngularClassDecorators.Directive);
      },
      [INJECTABLE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, AngularClassDecorators.Injectable);
      },
      [MODULE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, AngularClassDecorators.NgModule);
      },
      [PIPE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, AngularClassDecorators.Pipe);
      },
    };
  },
});
