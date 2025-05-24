import {
  ASTUtils,
  Selectors,
  toHumanReadableText,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [
  {
    suffixes: string[];
  },
];
export type MessageIds = 'componentClassSuffix';
export const RULE_NAME = 'component-class-suffix';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Classes decorated with @Component must have suffix "Component" (or custom) in their name. Note: As of v20, this is no longer recommended by the Angular Team.`,
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
      componentClassSuffix: `Component class names should end with one of these suffixes: {{suffixes}}`,
    },
  },
  defaultOptions: [
    {
      suffixes: ['Component'],
    },
  ],
  create(context, [{ suffixes }]) {
    return {
      [Selectors.COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const classParent = node.parent as TSESTree.ClassDeclaration;
        const className = ASTUtils.getClassName(classParent);

        if (
          !className ||
          !suffixes.some((suffix) => className.endsWith(suffix))
        ) {
          context.report({
            node: classParent.id ? classParent.id : classParent,
            messageId: 'componentClassSuffix',
            data: { suffixes: toHumanReadableText(suffixes) },
          });
        }
      },
    };
  },
});
