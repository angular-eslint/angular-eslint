import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  AngularLifecycleInterfaces,
  getDeclaredAngularLifecycleInterfaces,
  getDeclaredMethods,
  getLifecycleInterfaceByMethodName,
  getMethodName,
  isAngularLifecycleMethod,
} from '../utils/utils';

type Options = [];
export type MessageIds = 'useLifecycleInterface';
export const RULE_NAME = 'use-lifecycle-interface';

const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-09-01';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures classes implement lifecycle interfaces corresponding to the declared lifecycle methods',
      category: 'Best Practices',
      recommended: 'warn',
    },
    schema: [],
    messages: {
      useLifecycleInterface: `Lifecycle interface '{{interfaceName}}' should be implemented for method '{{methodName}}'. (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration) {
        const declaredLifecycleInterfaces = getDeclaredAngularLifecycleInterfaces(
          node,
        );
        const declaredMethods = getDeclaredMethods(node);

        for (const method of declaredMethods) {
          const methodName = getMethodName(method);

          if (!isAngularLifecycleMethod(methodName)) continue;

          const interfaceName = getLifecycleInterfaceByMethodName(methodName);
          const isMethodImplemented = declaredLifecycleInterfaces.includes(
            AngularLifecycleInterfaces[interfaceName],
          );

          if (isMethodImplemented) continue;

          context.report({
            node: method.key,
            messageId: 'useLifecycleInterface',
            data: {
              interfaceName,
              methodName,
            },
          });
        }
      },
    };
  },
});
