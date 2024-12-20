import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [
  {
    [key: string]: string[];
  },
];

export type MessageIds = 'incorrectOrder';

const DEFAULT_ORDER = {
  Component: [
    'selector',
    'imports',
    'standalone',
    'templateUrl',
    'styleUrl',
    'encapsulation',
    'changeDetection',
  ],
  Directive: ['selector', 'standalone'],
  NgModule: ['declarations', 'imports', 'exports', 'providers', 'bootstrap'],
  Pipe: ['name', 'standalone'],
};

export const RULE_NAME = 'sort-keys-in-type-decorator';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that keys in type decorators (Component, Directive, NgModule, Pipe) are sorted in a consistent order',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          Component: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          Directive: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          NgModule: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          Pipe: {
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
      incorrectOrder:
        'Keys in @{{decorator}} decorator should be ordered: {{expectedOrder}}',
    },
  },
  defaultOptions: [DEFAULT_ORDER],
  create(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
    [orderConfig]: Readonly<Options>,
  ) {
    return {
      Decorator(node: TSESTree.Decorator) {
        if (
          node.expression.type !== AST_NODE_TYPES.CallExpression ||
          node.expression.callee.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }

        const decoratorName = node.expression.callee.name;
        const expectedOrder = orderConfig[decoratorName];

        if (!expectedOrder || !node.expression.arguments.length) {
          return;
        }

        const argument = node.expression.arguments[0];
        if (argument.type !== AST_NODE_TYPES.ObjectExpression) {
          return;
        }

        const properties = argument.properties.filter(
          (property): property is TSESTree.Property =>
            property.type === AST_NODE_TYPES.Property &&
            property.key.type === AST_NODE_TYPES.Identifier,
        );

        const firstConfiguredIndex = properties.findIndex((prop) =>
          expectedOrder.includes((prop.key as TSESTree.Identifier).name),
        );
        const lastNonConfiguredIndex = properties.findIndex(
          (prop) =>
            !expectedOrder.includes((prop.key as TSESTree.Identifier).name),
        );

        if (
          firstConfiguredIndex !== -1 &&
          lastNonConfiguredIndex !== -1 &&
          lastNonConfiguredIndex < firstConfiguredIndex
        ) {
          reportAndFix(
            context,
            properties[lastNonConfiguredIndex],
            decoratorName,
            properties,
            expectedOrder,
            argument,
          );
          return;
        }

        const configuredProperties = properties.filter((prop) =>
          expectedOrder.includes((prop.key as TSESTree.Identifier).name),
        );

        if (configuredProperties.length) {
          const actualConfiguredOrder = configuredProperties.map(
            (prop) => (prop.key as TSESTree.Identifier).name,
          );
          const expectedConfiguredOrder = expectedOrder.filter((key: string) =>
            actualConfiguredOrder.includes(key),
          );

          if (
            actualConfiguredOrder.length &&
            JSON.stringify(actualConfiguredOrder) !==
              JSON.stringify(expectedConfiguredOrder)
          ) {
            const firstOutOfOrderIndex = actualConfiguredOrder.findIndex(
              (key, index) => key !== expectedConfiguredOrder[index],
            );
            const outOfOrderProperty =
              configuredProperties[firstOutOfOrderIndex];

            reportAndFix(
              context,
              outOfOrderProperty,
              decoratorName,
              properties,
              expectedOrder,
              argument,
            );
          }
        }
      },
    };
  },
});

function reportAndFix(
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
  node: TSESTree.Property,
  decoratorName: string,
  properties: TSESTree.Property[],
  expectedOrder: string[],
  objectExpression: TSESTree.Expression,
): void {
  const presentProperties = properties.map(
    (prop) => (prop.key as TSESTree.Identifier).name,
  );
  const expectedConfiguredOrder = expectedOrder.filter((key: string) =>
    presentProperties.includes(key),
  );

  context.report({
    node,
    messageId: 'incorrectOrder',
    data: {
      decorator: decoratorName,
      expectedOrder: expectedConfiguredOrder.join(', '),
    },
    fix(fixer) {
      const sourceCode = context.getSourceCode();
      const nonConfiguredProperties = properties.filter(
        (prop) =>
          !expectedOrder.includes((prop.key as TSESTree.Identifier).name),
      );

      const newProperties = [
        ...expectedOrder
          .filter((key: string) =>
            properties.some(
              (prop) => (prop.key as TSESTree.Identifier).name === key,
            ),
          )
          .map(
            (key: string) =>
              properties.find(
                (prop) => (prop.key as TSESTree.Identifier).name === key,
              )!,
          )
          .map((prop) => sourceCode.getText(prop)),
        ...nonConfiguredProperties.map((prop) => sourceCode.getText(prop)),
      ];

      const objectExpressionText = sourceCode.getText(objectExpression);
      const lines = objectExpressionText.split('\n');
      const indentation = lines[1] ? lines[1].match(/^\s*/)?.[0] || '' : '';

      return fixer.replaceText(
        objectExpression,
        `{\n${indentation}${newProperties.join(`,\n${indentation}`)}\n${indentation.slice(2)}}`,
      );
    },
  });
}
