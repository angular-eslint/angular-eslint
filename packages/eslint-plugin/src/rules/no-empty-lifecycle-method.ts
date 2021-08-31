import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { methodDefinition } from '../utils/selectors';
import {
  ANGULAR_LIFECYCLE_METHODS,
  getImplementsRemoveFix,
  getImportDeclarations,
  getImportRemoveFix,
  getRawText,
  isNotNullOrUndefined,
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
      [`ClassDeclaration:has(Decorator[expression.callee.name=/^(Component|Directive|Injectable|NgModule|Pipe)$/]) > ClassBody > ${methodDefinition(
        angularLifecycleMethodsPattern,
      )}[value.body.body.length=0]`](
        node: TSESTree.MethodDefinition & {
          parent: TSESTree.ClassBody & { parent: TSESTree.ClassDeclaration };
        },
      ) {
        context.report({
          node,
          messageId: 'noEmptyLifecycleMethod',
          suggest: [
            {
              messageId: 'suggestRemoveLifecycleMethod',
              fix: (fixer) => {
                const importDeclarations =
                  getImportDeclarations(node, '@angular/core') ?? [];
                const interfaceName = getRawText(node).replace(/^ng+/, '');
                const text = sourceCode.getText();
                const totalInterfaceOccurrences = getTotalInterfaceOccurrences(
                  text,
                  interfaceName,
                );
                const totalInterfaceOccurrencesSafeForRemoval = 2;

                return [
                  fixer.remove(node),
                  getImplementsRemoveFix(
                    sourceCode,
                    node.parent.parent,
                    interfaceName,
                    fixer,
                  ),
                  totalInterfaceOccurrences <=
                  totalInterfaceOccurrencesSafeForRemoval
                    ? getImportRemoveFix(
                        sourceCode,
                        importDeclarations,
                        interfaceName,
                        fixer,
                      )
                    : null,
                ].filter(isNotNullOrUndefined);
              },
            },
          ],
        });
      },
    };
  },
});

function stripSpecialCharacters(text: string) {
  return text.replace(/[\W]/g, '');
}

function getTotalInterfaceOccurrences(text: string, interfaceName: string) {
  return text
    .split(' ')
    .filter((item) => stripSpecialCharacters(item) === interfaceName).length;
}
