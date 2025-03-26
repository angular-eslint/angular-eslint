import { ASTUtils, CommentUtils, Selectors } from '@angular-eslint/utils';
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
    'template',
    'styleUrl',
    'styleUrls',
    'styles',
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
        createInvalidSortRuleForDecorator(
          context,
          decoratorName,
          expectedOrder,
          properties,
          properties[lastNonConfiguredIndex],
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

          createInvalidSortRuleForDecorator(
            context,
            decoratorName,
            expectedOrder,
            properties,
            outOfOrderProperty,
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

function createInvalidSortRuleForDecorator(
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
  decoratorName: string,
  expectedOrder: string[],
  properties: TSESTree.Property[],
  node: TSESTree.Property,
): void {
  const presentProps = properties.map(
    (prop) => (prop.key as TSESTree.Identifier).name,
  );

  const relevantExpectedOrder = expectedOrder.filter((propName) =>
    presentProps.includes(propName),
  );

  const data = {
    decorator: decoratorName,
    expectedOrder: relevantExpectedOrder.join(', '),
  };

  reportAndFix(
    context,
    node,
    'incorrectOrder',
    data,
    properties,
    expectedOrder,
    node.parent as TSESTree.Expression,
  );
}

function reportAndFix(
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
  node: TSESTree.Property,
  messageId: MessageIds,
  data: { decorator: string; expectedOrder: string },
  properties: TSESTree.Property[],
  expectedOrder: string[],
  objectExpression: TSESTree.Expression,
): void {
  const sourceCode = context.sourceCode;

  context.report({
    node,
    messageId,
    data,
    fix(fixer) {
      const indentation = CommentUtils.getObjectIndentation(
        sourceCode,
        objectExpression,
      );

      const propNames = properties.map(
        (p) => (p.key as TSESTree.Identifier).name,
      );
      const filteredOrder = expectedOrder.filter((name) =>
        propNames.includes(name),
      );

      const propInfoMap = CommentUtils.extractPropertyComments(
        sourceCode,
        properties,
        objectExpression,
        indentation,
      );

      const sortedText = CommentUtils.buildSortedPropertiesWithComments(
        filteredOrder,
        propInfoMap,
        indentation,
      );

      return fixer.replaceText(
        objectExpression,
        `{\n${sortedText}\n${indentation.slice(0, -2)}}`,
      );
    },
  });
}
