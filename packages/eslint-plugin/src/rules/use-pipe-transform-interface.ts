import { RuleFixes, isNotNullOrUndefined } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'usePipeTransformInterface';
export const RULE_NAME = 'use-pipe-transform-interface';
const PIPE_TRANSFORM = 'PipeTransform';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures that \`Pipes\` implement \`${PIPE_TRANSFORM}\` interface`,
      recommended: 'recommended',
    },
    fixable: 'code',
    schema: [],
    messages: {
      usePipeTransformInterface: `Pipes should implement \`${PIPE_TRANSFORM}\` interface`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [`ClassDeclaration:not(:has(TSClassImplements:matches([expression.name='${PIPE_TRANSFORM}'], [expression.property.name='${PIPE_TRANSFORM}']))) > Decorator[expression.callee.name='Pipe']`]({
        parent: classDeclaration,
      }: TSESTree.Decorator & { parent: TSESTree.ClassDeclaration }) {
        context.report({
          node: classDeclaration.id ?? classDeclaration,
          messageId: 'usePipeTransformInterface',
          fix: (fixer) => {
            const { implementsNodeReplace, implementsTextReplace } =
              RuleFixes.getImplementsSchemaFixer(
                classDeclaration,
                PIPE_TRANSFORM,
              );

            return [
              RuleFixes.getImportAddFix({
                compatibleWithTypeOnlyImport: true,
                fixer,
                importName: PIPE_TRANSFORM,
                moduleName: '@angular/core',
                node: classDeclaration,
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

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Implementing the PipeTransform interface provides TypeScript compile-time checking to ensure your pipe has the correct transform() method signature. Without the interface, typos in the method name or incorrect parameters won't be caught until runtime. The interface also serves as self-documentation and enables better IDE support like autocomplete and inline documentation. While Angular requires pipes to have a transform() method, using the PipeTransform interface leverages TypeScript's type system to catch implementation errors during development rather than at runtime.",
};
