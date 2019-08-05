import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  getDecoratorPropertyValue,
  isIdentifier,
  isLiteral,
  isCallExpression,
  kebabToCamelCase,
  toTitleCase,
} from '../utils/utils';

type Options = [];
export type MessageIds = 'noInputRename';
export const RULE_NAME = 'no-input-rename';

// source: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques
const whiteListAliases = new Set<string>([
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
      recommended: false,
    },
    schema: [],
    messages: {
      noInputRename: '@Inputs should not be renamed',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      'ClassProperty > Decorator[expression.callee.name="Input"]'(
        node: TSESTree.Decorator,
      ) {
        const inputCallExpression = node.expression as TSESTree.CallExpression;

        if (inputCallExpression.arguments.length === 0) {
          return;
        }

        let directiveSelectors: ReadonlyArray<any>;

        const canPropertyBeAliased = (
          propertyAlias: string,
          propertyName: string,
        ): boolean => {
          if (
            propertyAlias !== propertyName &&
            directiveSelectors &&
            directiveSelectors.some(x =>
              new RegExp(`^${x}((${toTitleCase(propertyName)}$)|(?=$))`).test(
                propertyAlias,
              ),
            )
          ) {
            return true;
          }

          return (
            whiteListAliases.has(propertyAlias) &&
            propertyName === kebabToCamelCase(propertyAlias)
          );
        };

        const classProperty = node.parent as TSESTree.ClassProperty;
        const classDeclaration = (classProperty.parent as TSESTree.ClassBody)
          .parent as TSESTree.ClassDeclaration;

        const decorator =
          classDeclaration.decorators && classDeclaration.decorators[0];

        if (
          decorator &&
          decorator.expression &&
          isCallExpression(decorator.expression) &&
          isIdentifier(decorator.expression.callee) &&
          decorator.expression.callee.name === 'Directive'
        ) {
          const selector = getDecoratorPropertyValue(decorator, 'selector');

          if (selector && isLiteral(selector) && selector.value) {
            directiveSelectors = Array.from(
              new Set(
                (selector.value.toString() || '')
                  .replace(/[\[\]\s]/g, '')
                  .split(','),
              ),
            );
          }
        }

        const propertyAlias = (inputCallExpression
          .arguments[0] as TSESTree.Literal).value;

        if (
          propertyAlias &&
          isIdentifier(classProperty.key) &&
          canPropertyBeAliased(propertyAlias.toString(), classProperty.key.name)
        ) {
          return;
        }

        context.report({
          node: classProperty,
          messageId: 'noInputRename',
        });
      },
    };
  },
});
