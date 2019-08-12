import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  PIPE_CLASS_DECORATOR,
  DIRECTIVE_CLASS_DECORATOR,
  INJECTABLE_CLASS_DECORATOR,
  MODULE_CLASS_DECORATOR,
} from '../utils/selectors';

import {
  ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER,
  AngularClassDecorators,
  getClassName,
  getDeclaredMethods,
  getMethodName,
  isAngularLifecycleMethod,
} from '../utils/utils';

type Options = [];
export type MessageIds = 'contextuaLifecycle';
export const RULE_NAME = 'contextual-lifecycle';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensures that classes use allowed lifecycle method in its body',
      category: 'Possible Errors',
      recommended: false,
    },
    schema: [],
    messages: {
      contextuaLifecycle: `The method {{methodName}} is not allowed for class {{className}} because it is decorated with {{decoratorName}}`,
    },
  },
  defaultOptions: [],
  create(context) {
    function checkContext(
      node: TSESTree.Decorator,
      decorator: AngularClassDecorators,
    ) {
      const className = getClassName(node);
      const classParent = node.parent as TSESTree.ClassDeclaration;
      const allowedMethods = ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER.get(
        decorator,
      );

      const declaredMethods = getDeclaredMethods(classParent);

      for (const method of declaredMethods) {
        const methodName = getMethodName(method);
        if (
          !isAngularLifecycleMethod(methodName) ||
          (allowedMethods && allowedMethods.has(methodName))
        )
          continue;

        context.report({
          node: method.key,
          messageId: 'contextuaLifecycle',
          data: {
            methodName,
            className,
            decorator,
          },
        });
      }
    }

    return {
      [PIPE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, AngularClassDecorators.Pipe);
      },
      [INJECTABLE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, AngularClassDecorators.Injectable);
      },
      [MODULE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, AngularClassDecorators.NgModule);
      },
      [DIRECTIVE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, AngularClassDecorators.Directive);
      },
    };
  },
});
