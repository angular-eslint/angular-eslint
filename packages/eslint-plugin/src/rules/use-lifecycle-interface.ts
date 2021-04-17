import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import type { AngularLifecycleMethodKeys } from '../utils/utils';
import {
  AngularLifecycleInterfaces,
  ANGULAR_LIFECYCLE_METHODS,
  getAngularClassDecorator,
  getDeclaredAngularLifecycleInterfaces,
  getLifecycleInterfaceByMethodName,
  toPattern,
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
        'Ensures that classes implement lifecycle interfaces corresponding to the declared lifecycle methods',
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
    const angularLifecycleMethodsPattern = toPattern([
      ...ANGULAR_LIFECYCLE_METHODS,
    ]);

    return {
      [`MethodDefinition[key.name=${angularLifecycleMethodsPattern}]`]({
        key,
        parent,
      }: TSESTree.MethodDefinition) {
        const classDeclaration = parent!.parent as TSESTree.ClassDeclaration;

        if (!getAngularClassDecorator(classDeclaration)) return;

        const declaredLifecycleInterfaces = getDeclaredAngularLifecycleInterfaces(
          classDeclaration,
        );
        const methodName = (key as TSESTree.Identifier)
          .name as AngularLifecycleMethodKeys;
        const interfaceName = getLifecycleInterfaceByMethodName(methodName);
        const isMethodImplemented = declaredLifecycleInterfaces.includes(
          AngularLifecycleInterfaces[interfaceName],
        );

        if (isMethodImplemented) return;

        context.report({
          node: key,
          messageId: 'useLifecycleInterface',
          data: { interfaceName, methodName },
        });
      },
    };
  },
});
