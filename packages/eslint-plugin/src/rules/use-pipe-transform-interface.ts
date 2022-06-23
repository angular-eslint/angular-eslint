import { RuleFixes, isNotNullOrUndefined } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'usePipeTransformInterface';
export const RULE_NAME = 'use-pipe-transform-interface';
const PIPE_TRANSFORM = 'PipeTransform';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures that \`Pipes\` implement \`${PIPE_TRANSFORM}\` interface`,
      recommended: 'error',
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
