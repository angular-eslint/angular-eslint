import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { PIPE_CLASS_DECORATOR } from '../utils/selectors';
import {
  getDeclaredInterfaceName,
  getImplementsSchemaFixer,
  getImportAddFix,
} from '../utils/utils';

type Options = [];
export type MessageIds = 'usePipeTransformInterface';
export const RULE_NAME = 'use-pipe-transform-interface';
const PIPE_TRANSFORM = 'PipeTransform';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures that Pipes implement \`${PIPE_TRANSFORM}\` interface`,
      category: 'Best Practices',
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
      [PIPE_CLASS_DECORATOR]({
        parent: classDeclaration,
      }: TSESTree.Decorator & { parent: TSESTree.ClassDeclaration }) {
        if (getDeclaredInterfaceName(classDeclaration, PIPE_TRANSFORM)) return;

        context.report({
          node: classDeclaration.id ?? classDeclaration,
          messageId: 'usePipeTransformInterface',
          fix: (fixer) => {
            const { implementsNodeReplace, implementsTextReplace } =
              getImplementsSchemaFixer(classDeclaration, PIPE_TRANSFORM);

            return [
              getImportAddFix(
                classDeclaration,
                '@angular/core',
                PIPE_TRANSFORM,
                fixer,
              ),
              fixer.insertTextAfter(
                implementsNodeReplace,
                implementsTextReplace,
              ),
            ];
          },
        });
      },
    };
  },
});
