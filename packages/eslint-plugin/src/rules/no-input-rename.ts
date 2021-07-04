import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { ASTUtils } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  AngularClassDecorators,
  getDecoratorPropertyValue,
  isCallExpression,
  isImportedFrom,
  isStringLiteral,
  kebabToCamelCase,
} from '../utils/utils';

type Options = [
  {
    readonly allowedNames?: readonly string[];
  },
];
export type MessageIds = 'noInputRename';
export const RULE_NAME = 'no-input-rename';
const STYLE_GUIDE_LINK = 'https://angular.io/guide/styleguide#style-05-13';

// source: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques
const safelistAliases = new Set<string>([
  'aria-activedescendant',
  'aria-atomic',
  'aria-autocomplete',
  'aria-busy',
  'aria-checked',
  'aria-controls',
  'aria-current',
  'aria-describedby',
  'aria-disabled',
  'aria-dragged',
  'aria-dropeffect',
  'aria-expanded',
  'aria-flowto',
  'aria-haspopup',
  'aria-hidden',
  'aria-invalid',
  'aria-label',
  'aria-labelledby',
  'aria-level',
  'aria-live',
  'aria-multiline',
  'aria-multiselectable',
  'aria-orientation',
  'aria-owns',
  'aria-posinset',
  'aria-pressed',
  'aria-readonly',
  'aria-relevant',
  'aria-required',
  'aria-selected',
  'aria-setsize',
  'aria-sort',
  'aria-valuemax',
  'aria-valuemin',
  'aria-valuenow',
  'aria-valuetext',
]);

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows renaming directive inputs by providing a string to the decorator.',
      category: 'Best Practices',
      recommended: 'error',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedNames: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'A list with allowed input names',
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noInputRename: `@Inputs should not be aliased (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [
    {
      allowedNames: [],
    },
  ],
  create(context, [{ allowedNames = [] }]) {
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
        )
          return;
        if (inputCallExpression.arguments.length === 0) return;

        // handle directive's selector is also an input property
        let directiveSelectors: readonly string[];

        const canPropertyBeAliased = (
          propertyAlias: string,
          propertyName: string,
        ): boolean => {
          return (
            allowedNames.includes(propertyAlias) ||
            (propertyAlias !== propertyName &&
              directiveSelectors &&
              directiveSelectors.some((x) =>
                new RegExp(
                  `^${x}((${
                    propertyName[0].toUpperCase() + propertyName.slice(1)
                  }$)|(?=$))`,
                ).test(propertyAlias),
              )) ||
            (safelistAliases.has(propertyAlias) &&
              propertyName === kebabToCamelCase(propertyAlias))
          );
        };

        const classProperty = node.parent as
          | TSESTree.ClassProperty
          | TSESTree.MethodDefinition;
        const { decorators } = (classProperty.parent as TSESTree.ClassBody)
          .parent as TSESTree.ClassDeclaration;
        const decorator = decorators?.find(
          (decorator) =>
            isCallExpression(decorator.expression) &&
            ASTUtils.isIdentifier(decorator.expression.callee) &&
            decorator.expression.callee.name ===
              AngularClassDecorators.Directive,
        );

        if (decorator) {
          const selector = getDecoratorPropertyValue(decorator, 'selector');

          if (selector && isStringLiteral(selector)) {
            directiveSelectors = selector.value
              .replace(/[[\]\s]/g, '')
              .split(',');
          }
        }

        const propertyAlias = (
          inputCallExpression.arguments[0] as TSESTree.Literal
        ).value;

        if (
          propertyAlias &&
          ASTUtils.isIdentifier(classProperty.key) &&
          canPropertyBeAliased(propertyAlias.toString(), classProperty.key.name)
        )
          return;

        context.report({
          node: classProperty,
          messageId: 'noInputRename',
        });
      },
    };
  },
});
