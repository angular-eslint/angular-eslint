import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  COMPONENT_CLASS_DECORATOR,
  DIRECTIVE_CLASS_DECORATOR,
  INJECTABLE_CLASS_DECORATOR,
  MODULE_CLASS_DECORATOR,
  PIPE_CLASS_DECORATOR,
} from '../utils/selectors';
import {
  ANGULAR_CLASS_DECORATOR_LIFECYCLE_METHOD_MAPPER,
  AngularClassDecorators,
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
        'Ensures that lifecycle methods are used in a correct context',
      category: 'Possible Errors',
      recommended: 'error',
    },
    schema: [],
    messages: {
      contextuaLifecycle: `This lifecycle method is not called for {{decorator}}`,
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
          messageId: 'contextuaLifecycle',
          data: { decorator },
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
