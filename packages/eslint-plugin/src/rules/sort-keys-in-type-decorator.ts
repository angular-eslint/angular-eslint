import { ASTUtils, Selectors } from '@angular-eslint/utils';
import { TSESLint, TSESTree } from '@typescript-eslint/utils';
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
    function checkContext(
      node: TSESTree.Decorator,
      decoratorName: string,
    ): void {
      const expectedOrder = orderConfig[decoratorName];
      if (!expectedOrder) {
        return;
      }

      const argument = ASTUtils.getDecoratorArgument(node);
      if (!argument) {
        return;
      }

      const properties = ASTUtils.getDecoratorProperties(node);
      if (properties.length <= 1) {
        return;
      }

      const firstConfiguredIndex = properties.findIndex(({ key }) =>
        expectedOrder.includes((key as TSESTree.Identifier).name),
      );
      const lastNonConfiguredIndex = properties.findIndex(
        ({ key }) => !expectedOrder.includes((key as TSESTree.Identifier).name),
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

      const configuredProperties = properties.filter(({ key }) =>
        expectedOrder.includes((key as TSESTree.Identifier).name),
      );

      if (configuredProperties.length) {
        const actualConfiguredOrder = configuredProperties.map(
          ({ key }) => (key as TSESTree.Identifier).name,
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
          const outOfOrderProperty = configuredProperties[firstOutOfOrderIndex];

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
    }

    return {
      [Selectors.COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, ASTUtils.AngularClassDecorators.Component);
      },
      [Selectors.DIRECTIVE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, ASTUtils.AngularClassDecorators.Directive);
      },
      [Selectors.INJECTABLE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, ASTUtils.AngularClassDecorators.Injectable);
      },
      [Selectors.MODULE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, ASTUtils.AngularClassDecorators.NgModule);
      },
      [Selectors.PIPE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        checkContext(node, ASTUtils.AngularClassDecorators.Pipe);
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
    ({ key }) => (key as TSESTree.Identifier).name,
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
      const sourceCode = context.sourceCode;
      const nonConfiguredProperties = properties.filter(
        ({ key }) => !expectedOrder.includes((key as TSESTree.Identifier).name),
      );

      const newProperties = [
        ...expectedOrder
          .map((expectedOrderKey: string) =>
            properties.find(
              ({ key }) =>
                (key as TSESTree.Identifier).name === expectedOrderKey,
            ),
          )
          .filter((prop): prop is TSESTree.Property => !!prop)
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
