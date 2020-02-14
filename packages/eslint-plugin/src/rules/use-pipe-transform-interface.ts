import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { PIPE_CLASS_DECORATOR } from '../utils/selectors';
import {
  AngularClassDecorators,
  getDeclaredInterfaceName,
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
      description: `Ensures tht classes decorated with @${AngularClassDecorators.Pipe} implement ${PIPE_TRANSFORM} interface`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      usePipeTransformInterface: `Classes decorated with @${AngularClassDecorators.Pipe} decorator should implement ${PIPE_TRANSFORM} interface`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [PIPE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const classParent = node.parent as TSESTree.ClassDeclaration;
        if (getDeclaredInterfaceName(classParent, PIPE_TRANSFORM)) {
          return;
        }

        context.report({
          node: classParent,
          messageId: 'usePipeTransformInterface',
        });
      },
    };
  },
});
