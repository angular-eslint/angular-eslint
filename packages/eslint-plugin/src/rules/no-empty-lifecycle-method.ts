import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  ANGULAR_LIFECYCLE_METHODS,
  getAngularClassDecorator,
  getImplementsRemoveFix,
  getImportDeclarations,
  getImportRemoveFix,
  toPattern,
} from '../utils/utils';

type Options = [];
export type MessageIds =
  | 'noEmptyLifecycleMethod'
  | 'suggestRemoveLifecycleMethod';
export const RULE_NAME = 'no-empty-lifecycle-method';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows declaring empty lifecycle methods',
      category: 'Best Practices',
      recommended: 'error',
      suggestion: true,
    },
    schema: [],
    messages: {
      noEmptyLifecycleMethod: 'Lifecycle methods should not be empty',
      suggestRemoveLifecycleMethod: 'Remove lifecycle method',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    const angularLifecycleMethodsPattern = toPattern([
      ...ANGULAR_LIFECYCLE_METHODS,
    ]);

    return {
      [`ClassDeclaration > ClassBody > MethodDefinition[key.name=${angularLifecycleMethodsPattern}][value.body.body.length=0]`](
        node: TSESTree.MethodDefinition & {
          key: TSESTree.Identifier;
          parent: TSESTree.ClassBody & { parent: TSESTree.ClassDeclaration };
        },
      ) {
        if (!getAngularClassDecorator(node.parent.parent)) return;

        context.report({
          node,
          messageId: 'noEmptyLifecycleMethod',
          suggest: [
            {
              messageId: 'suggestRemoveLifecycleMethod',
              fix: (fixer) => {
                const importDeclarations = getImportDeclarations(
                  node,
                  '@angular/core',
                );
                const interfaceName = node.key.name.replace(/^ng+/, '');

                return [fixer.remove(node)].concat(
                  getImplementsRemoveFix(
                    sourceCode,
                    node.parent.parent,
                    interfaceName,
                    fixer,
                  ),
                  getImportRemoveFix(
                    sourceCode,
                    importDeclarations ?? [],
                    interfaceName,
                    fixer,
                  ),
                );
              },
            },
          ],
        });
      },
    };
  },
});
