import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
type DecoratorTypes = 'component' | 'directive' | 'pipe';
export type MessageIds = 'preferStandalone';
export const RULE_NAME = 'prefer-standalone';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures Components, Directives and Pipes do not opt out of standalone`,
      recommended: 'recommended',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferStandalone: `Components, Directives and Pipes should not opt out of standalone`,
    },
  },
  defaultOptions: [],
  create(context) {
    const standaloneRuleFactory =
      (type: DecoratorTypes) => (node: TSESTree.Decorator) => {
        const standalone = ASTUtils.getDecoratorPropertyValue(
          node,
          'standalone',
        );

        // Leave the standalone property alone if it was set to true or not present
        if (
          !standalone ||
          (ASTUtils.isLiteral(standalone) && standalone.value === true)
        ) {
          return;
        }

        if (!ASTUtils.getDecoratorArgument(node)) {
          return;
        }
        context.report({
          node: standalone.parent,
          messageId: 'preferStandalone',
          data: { type },
          fix: (fixer) => {
            // Remove the standalone property altogether if it was set to false
            const tokenAfter = context.sourceCode.getTokenAfter(
              standalone.parent,
            );
            // Remove the trailing comma, if present
            const removeStart = standalone.parent.range[0];
            let removeEnd = standalone.parent.range[1];
            if (tokenAfter && tokenAfter.value === ',') {
              removeEnd = tokenAfter.range[1];
            }
            return fixer.removeRange([removeStart, removeEnd]);
          },
        });
      };

    return {
      [Selectors.COMPONENT_CLASS_DECORATOR]: standaloneRuleFactory('component'),
      [Selectors.DIRECTIVE_CLASS_DECORATOR]: standaloneRuleFactory('directive'),
      [Selectors.PIPE_CLASS_DECORATOR]: standaloneRuleFactory('pipe'),
    };
  },
});
