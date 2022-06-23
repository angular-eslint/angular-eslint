import {
  ASTUtils,
  RuleFixes,
  isNotNullOrUndefined,
  Selectors,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds =
  | 'preferOnPushComponentChangeDetection'
  | 'suggestAddChangeDetectionOnPush';
type StronglyTypedDecorator = TSESTree.Decorator & {
  parent: TSESTree.ClassDeclaration;
};
type StronglyTypedProperty = TSESTree.Property & {
  parent: TSESTree.CallExpression & {
    parent: TSESTree.ObjectExpression & {
      parent: TSESTree.Decorator & {
        parent: TSESTree.ClassDeclaration;
      };
    };
  };
};
export const RULE_NAME = 'prefer-on-push-component-change-detection';
const METADATA_PROPERTY_NAME = 'changeDetection';
const STRATEGY_ON_PUSH = 'ChangeDetectionStrategy.OnPush';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures component's \`${METADATA_PROPERTY_NAME}\` is set to \`${STRATEGY_ON_PUSH}\``,
      recommended: false,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      preferOnPushComponentChangeDetection: `The component's \`${METADATA_PROPERTY_NAME}\` value should be set to \`${STRATEGY_ON_PUSH}\``,
      suggestAddChangeDetectionOnPush: `Add \`${STRATEGY_ON_PUSH}\``,
    },
  },
  defaultOptions: [],
  create(context) {
    const changeDetectionMetadataProperty = Selectors.metadataProperty(
      METADATA_PROPERTY_NAME,
    );
    const withoutChangeDetectionDecorator =
      `${Selectors.COMPONENT_CLASS_DECORATOR}:matches([expression.arguments.length=0], [expression.arguments.0.type='ObjectExpression']:not(:has(${changeDetectionMetadataProperty})))` as const;
    const nonChangeDetectionOnPushProperty =
      `${Selectors.COMPONENT_CLASS_DECORATOR} > CallExpression > ObjectExpression > ${changeDetectionMetadataProperty}:matches([value.type='Identifier'][value.name='undefined'], [value.object.name='ChangeDetectionStrategy'][value.property.name!='OnPush'])` as const;
    const selectors = [
      withoutChangeDetectionDecorator,
      nonChangeDetectionOnPushProperty,
    ].join(',');

    return {
      [selectors](node: StronglyTypedDecorator | StronglyTypedProperty) {
        context.report({
          node: nodeToReport(node),
          messageId: 'preferOnPushComponentChangeDetection',
          suggest: [
            {
              messageId: 'suggestAddChangeDetectionOnPush',
              fix: (fixer) => {
                if (ASTUtils.isProperty(node)) {
                  return [
                    RuleFixes.getImportAddFix({
                      fixer,
                      importName: 'ChangeDetectionStrategy',
                      moduleName: '@angular/core',
                      node: node.parent.parent.parent.parent,
                    }),
                    ASTUtils.isMemberExpression(node.value)
                      ? fixer.replaceText(node.value.property, 'OnPush')
                      : fixer.replaceText(node.value, STRATEGY_ON_PUSH),
                  ].filter(isNotNullOrUndefined);
                }

                return [
                  RuleFixes.getImportAddFix({
                    fixer,
                    importName: 'ChangeDetectionStrategy',
                    moduleName: '@angular/core',
                    node: node.parent,
                  }),
                  RuleFixes.getDecoratorPropertyAddFix(
                    node,
                    fixer,
                    `${METADATA_PROPERTY_NAME}: ${STRATEGY_ON_PUSH}`,
                  ),
                ].filter(isNotNullOrUndefined);
              },
            },
          ],
        });
      },
    };
  },
});

function nodeToReport(node: TSESTree.Node) {
  if (!ASTUtils.isProperty(node)) {
    return node;
  }

  return ASTUtils.isMemberExpression(node.value)
    ? node.value.property
    : node.value;
}
