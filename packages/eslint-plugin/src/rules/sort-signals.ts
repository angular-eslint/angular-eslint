import { ASTUtils, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [{ readonly order?: readonly string[] }];
export type MessageIds = 'signalsNotSorted';
export const RULE_NAME = 'sort-signals';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensures that signals are declared in order of execution',
    },
    schema: [
      {
        type: 'object',
        properties: {
          order: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'The order of the signal types',
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      signalsNotSorted: `signals are not declared in order of execution`,
    },
  },
  defaultOptions: [{ order: ASTUtils.angularSignalFunctionsOrdered }],
  create(context, [{ order = [] }]) {
    const isBefore = (
      property1: TSESTree.PropertyDefinition,
      property2: TSESTree.PropertyDefinition,
    ) => {
      const methodIndex1 = order.indexOf(
        ASTUtils.getPropertySignalName(
          property1,
        ) as ASTUtils.AngularSignalFunctions,
      );
      const methodIndex2 = order.indexOf(
        ASTUtils.getPropertySignalName(
          property2,
        ) as ASTUtils.AngularSignalFunctions,
      );

      return (
        (methodIndex1 < methodIndex2 && methodIndex1 !== -1) ||
        methodIndex2 === -1
      );
    };

    return {
      [Selectors.COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR](
        node: TSESTree.Decorator,
      ) {
        const declaredProperties = ASTUtils.getDeclaredProperties(
          node.parent as TSESTree.ClassDeclaration,
        );
        const declaredPropertyFunctions = declaredProperties.filter(
          (method: TSESTree.PropertyDefinition) =>
            ASTUtils.isAngularSignalFunction(
              ASTUtils.getPropertySignalName(method) ?? '',
            ),
        );

        for (let i = 1; i < declaredProperties.length; ++i) {
          const before = isBefore(
            declaredPropertyFunctions[i],
            declaredPropertyFunctions[i - 1],
          );

          if (before) {
            context.report({
              node: declaredPropertyFunctions[i].key,
              messageId: 'signalsNotSorted',
            });
          }
        }
      },
    };
  },
});
