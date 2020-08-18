import { createESLintRule } from '../utils/create-eslint-rule';
import { isAngularLifecycleMethod, isIdentifier } from '../utils/utils';

type Options = [];
export type MessageIds = 'noLifecycleCall';
export const RULE_NAME = 'no-lifecycle-call';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows explicit calls to lifecycle methods.',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noLifecycleCall: 'Avoid explicit calls to lifecycle methods',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      MemberExpression: (node) => {
        const {
          object: { type: nodeObjectType },
          parent,
          property,
        } = node;
        const isSuperCall = nodeObjectType === 'Super';

        if (
          !parent ||
          !isIdentifier(property) ||
          !isAngularLifecycleMethod(property.name) ||
          isSuperCall
        ) {
          return;
        }

        context.report({ node: parent, messageId: 'noLifecycleCall' });
      },
    };
  },
});
