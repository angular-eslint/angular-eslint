import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getClassPropertyName, isImportedFrom } from '../utils/utils';

type Options = [
  {
    prefixes: string[];
  },
];
export type MessageIds = 'noInputPrefix';
export const RULE_NAME = 'no-input-prefix';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Input names should not be prefixed by the configured disallowed prefixes.',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          prefixes: {
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
      noInputPrefix: `@Inputs should not be prefixed by {{disallowedPrefixes}}`,
    },
  },
  defaultOptions: [
    {
      prefixes: [],
    },
  ],
  create(context, [options]) {
    return {
      ':matches(ClassProperty, MethodDefinition[kind="set"]) > Decorator[expression.callee.name="Input"]'(
        node: TSESTree.Decorator,
      ) {
        const inputCallExpression = node.expression as TSESTree.CallExpression;

        if (
          !isImportedFrom(
            inputCallExpression.callee as TSESTree.Identifier,
            '@angular/core',
          )
        ) {
          return;
        }

        const property = node.parent as TSESTree.ClassProperty;
        const memberName = getClassPropertyName(property);

        const disallowedPrefixes = options.prefixes;

        const isDisallowedPrefix = disallowedPrefixes.some(
          x => x === memberName || new RegExp(`^${x}[^a-z]`).test(memberName),
        );

        if (!isDisallowedPrefix) {
          return;
        }

        context.report({
          node: property,
          messageId: 'noInputPrefix',
          data: {
            disallowedPrefixes: disallowedPrefixes.join(', '),
          },
        });
      },
    };
  },
});
