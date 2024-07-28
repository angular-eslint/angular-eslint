import {
  ASTUtils,
  toPattern,
  RuleFixes,
  isNotNullOrUndefined,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'useLifecycleInterface';
export const RULE_NAME = 'use-lifecycle-interface';
const STYLE_GUIDE_LINK = 'https://angular.dev/style-guide#style-09-01';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures that classes implement lifecycle interfaces corresponding to the declared lifecycle methods. See more at ${STYLE_GUIDE_LINK}`,
    },
    schema: [],
    messages: {
      useLifecycleInterface: `Lifecycle interface '{{interfaceName}}' should be implemented for method '{{methodName}}'. (${STYLE_GUIDE_LINK})`,
    },
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    const angularLifecycleMethodsPattern = toPattern([
      ...ASTUtils.ANGULAR_LIFECYCLE_METHODS,
    ]);

    return {
      [`MethodDefinition[key.name=${angularLifecycleMethodsPattern}]`]({
        key,
        parent: { parent },
      }: TSESTree.MethodDefinition & { parent: TSESTree.ClassBody } & {
        parent: TSESTree.ClassDeclaration;
      }) {
        if (!ASTUtils.getAngularClassDecorator(parent)) return;

        const declaredLifecycleInterfaces =
          ASTUtils.getDeclaredAngularLifecycleInterfaces(parent);
        const methodName = (key as TSESTree.Identifier)
          .name as ASTUtils.AngularLifecycleMethodKeys;
        const interfaceName =
          ASTUtils.getLifecycleInterfaceByMethodName(methodName);
        const isMethodImplemented = declaredLifecycleInterfaces.includes(
          ASTUtils.AngularLifecycleInterfaces[interfaceName],
        );

        if (isMethodImplemented) return;

        context.report({
          node: key,
          messageId: 'useLifecycleInterface',
          data: { interfaceName, methodName },
          fix: (fixer) => {
            const { implementsNodeReplace, implementsTextReplace } =
              RuleFixes.getImplementsSchemaFixer(parent, interfaceName);
            return [
              RuleFixes.getImportAddFix({
                fixer,
                importName: interfaceName,
                moduleName: '@angular/core',
                node: parent,
              }),
              fixer.insertTextAfter(
                implementsNodeReplace,
                implementsTextReplace,
              ),
            ].filter(isNotNullOrUndefined);
          },
        });
      },
    };
  },
});
