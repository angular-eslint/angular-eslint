import { ASTUtils, CommentUtils, Selectors } from '@angular-eslint/utils';
import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type OrderConfig = {
  readonly Component?: string[];
  readonly Directive?: string[];
  readonly Injectable?: string[];
  readonly NgModule?: string[];
  readonly Pipe?: string[];
};

export type Options = [
  OrderConfig & {
    readonly allowUnconfiguredProperties?: boolean;
  },
];

export type MessageIds = 'incorrectOrder' | 'unconfiguredProperty';

const DEFAULT_ORDER = {
  // https://angular.dev/api/core/Component
  Component: [
    'selector',
    'imports',
    'standalone',
    'templateUrl',
    'template',
    'styleUrl',
    'styleUrls',
    'styles',
    'providers',
    'changeDetection',
    'encapsulation',
    'viewProviders',
    'host',
    'hostDirectives',
    'inputs',
    'outputs',
    'animations',
    'schemas',
    'exportAs',
    'queries',
    'preserveWhitespaces',
    'jit',
    // Deprecated properties according to https://angular.dev/api/core/Component
    'moduleId',
    'interpolation',
  ],
  // https://angular.dev/api/core/Directive
  Directive: [
    'selector',
    'standalone',
    'providers',
    'host',
    'hostDirectives',
    'inputs',
    'outputs',
    'exportAs',
    'queries',
    'jit',
  ],
  // https://angular.dev/api/core/Injectable
  Injectable: [
    'providedIn',
    'useClass',
    'useExisting',
    'useFactory',
    'useValue',
    'deps',
  ],
  // https://angular.dev/api/core/NgModule
  NgModule: [
    'id', // rarely used but good to have first if set
    'imports',
    'declarations',
    'providers',
    'exports',
    'bootstrap',
    'schemas',
    'jit',
  ],
  // https://angular.dev/api/core/Pipe
  Pipe: ['name', 'standalone', 'pure'],
};

const DEFAULT_OPTIONS: Options[0] = {
  ...DEFAULT_ORDER,
  allowUnconfiguredProperties: true,
};

export const RULE_NAME = 'sort-keys-in-type-decorator';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that keys in type decorators (Component, Directive, Injectable, NgModule, Pipe) are sorted in a consistent order',
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
          Injectable: {
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
          allowUnconfiguredProperties: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.allowUnconfiguredProperties,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      incorrectOrder:
        'Keys in @{{decorator}} decorator should be ordered: {{expectedOrder}}',
      unconfiguredProperty:
        'Property "{{property}}" is not in the configured key order for @{{decorator}}.',
    },
    defaultOptions: [DEFAULT_OPTIONS],
  },
  create(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
    [orderConfig]: Readonly<Options>,
  ) {
    function checkContext(
      node: TSESTree.Decorator,
      decoratorName: string,
    ): void {
      const expectedOrder = orderConfig[decoratorName as keyof OrderConfig];
      if (!expectedOrder) {
        return;
      }

      const argument = ASTUtils.getDecoratorArgument(node);
      if (!argument) {
        return;
      }

      const properties = ASTUtils.getDecoratorProperties(node);
      const allowUnconfiguredProperties =
        orderConfig.allowUnconfiguredProperties ?? true;

      if (!allowUnconfiguredProperties) {
        for (const property of properties) {
          const propertyName = (property.key as TSESTree.Identifier).name;

          if (!expectedOrder.includes(propertyName)) {
            context.report({
              node: property,
              messageId: 'unconfiguredProperty',
              data: {
                decorator: decoratorName,
                property: propertyName,
              },
            });
          }
        }
      }

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
        allowUnconfiguredProperties &&
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
      const configuredProps = expectedOrder.filter((name) =>
        propNames.includes(name),
      );
      const unconfiguredProps = propNames.filter(
        (name) => !expectedOrder.includes(name),
      );
      const filteredOrder = [...configuredProps, ...unconfiguredProps];

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

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Maintaining a consistent order for properties in Angular decorators (@Component, @Directive, @Injectable, @NgModule, @Pipe) makes code more predictable and easier to scan. When all components in a codebase follow the same property order, developers can quickly locate specific metadata without searching. For example, if selector always comes first and providers always comes before changeDetection, you develop muscle memory for where to look. This is especially helpful in large components with many properties. The recommended default order groups related properties logically: identification (selector, name) first, then dependencies (imports, providers), then templates/styles, then configuration options. Consistent ordering also makes code reviews easier, reduces merge conflicts when multiple developers edit decorators, and creates a professional, well-organized codebase. When `allowUnconfiguredProperties` is `false`, decorators omitted from the user configuration are still checked against their built-in default key order.',
};
