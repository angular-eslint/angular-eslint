import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { COMPONENT_CLASS_DECORATOR } from '../utils/selectors';
import { getClassName } from '../utils/utils';

type Options = [
  {
    suffixes: string[];
  },
];
export type MessageIds = 'componentClassSuffix';
export const RULE_NAME = 'component-class-suffix';

const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-02-03';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Classes decorated with @Component must have suffix "Component" (or custom) in their name. See more at ${STYLE_GUIDE_LINK}.`,
      category: 'Best Practices',
      recommended: 'error',
    },
    schema: [
      {
        type: 'object',
        properties: {
          suffixes: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      componentClassSuffix: `The name of the class {{className}} should end with the suffix {{suffixes}} (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [
    {
      suffixes: ['Component'],
    },
  ],
  create(context, [options]) {
    const { suffixes } = options;

    return {
      [COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const classParent = node.parent as TSESTree.ClassDeclaration;
        const className = getClassName(classParent);

        if (
          !className ||
          !suffixes.some((suffix) => className.endsWith(suffix))
        ) {
          context.report({
            node: classParent.id ? classParent.id : classParent,
            messageId: 'componentClassSuffix',
            data: {
              className,
              suffixes,
            },
          });
        }
      },
    };
  },
});
