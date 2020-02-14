import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { AngularClassDecorators, getPipeDecorator } from '../utils/utils';

type Options = [];
export type MessageIds = 'usePipeDecorator';
export const RULE_NAME = 'use-pipe-decorator';

const PIPE_TRANSFORM = 'PipeTransform';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures that classes implementing ${PIPE_TRANSFORM} interface use @${AngularClassDecorators.Pipe} decorator`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      usePipeDecorator: `Classes that implement the ${PIPE_TRANSFORM} interface should be decorated with @${AngularClassDecorators.Pipe}`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ['ClassDeclaration > TSClassImplements:matches([expression.name="PipeTransform"], [expression.property.name="PipeTransform"])'](
        node: TSESTree.TSClassImplements,
      ) {
        const classParent = node.parent as TSESTree.ClassDeclaration;
        if (getPipeDecorator(classParent)) {
          return;
        }

        context.report({
          node: classParent,
          messageId: 'usePipeDecorator',
        });
      },
    };
  },
});
