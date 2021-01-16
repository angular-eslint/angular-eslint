import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  getDecoratorPropertyValue,
  isIdentifier,
  isLiteral,
  isCallExpression,
  AngularClassDecorators,
  isImportedFrom,
} from '../utils/utils';

type Options = [];
export type MessageIds = 'noOutputRename';
export const RULE_NAME = 'no-output-rename';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows renaming directive outputs by providing a string to the decorator.',
      category: 'Best Practices',
      recommended: 'error',
    },
    schema: [],
    messages: {
      noOutputRename: '@Outputs should not be renamed',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      'ClassProperty > Decorator[expression.callee.name="Output"]'(
        node: TSESTree.Decorator,
      ) {
        const outputCallExpression = node.expression as TSESTree.CallExpression;

        if (
          !isImportedFrom(
            outputCallExpression.callee as TSESTree.Identifier,
            '@angular/core',
          )
        )
          return;
        if (outputCallExpression.arguments.length === 0) return;

        // handle directive's selector is also an output property
        let directiveSelectors: ReadonlySet<any>;

        const canPropertyBeAliased = (
          propertyAlias: string,
          propertyName: string,
        ): boolean => {
          return !!(
            directiveSelectors &&
            directiveSelectors.has(propertyAlias) &&
            propertyAlias !== propertyName
          );
        };

        const classProperty = node.parent as TSESTree.ClassProperty;
        const classDeclaration = (classProperty.parent as TSESTree.ClassBody)
          .parent as TSESTree.ClassDeclaration;

        const decorator =
          classDeclaration.decorators &&
          classDeclaration.decorators.find(
            (decorator) =>
              isCallExpression(decorator.expression) &&
              isIdentifier(decorator.expression.callee) &&
              decorator.expression.callee.name ===
                AngularClassDecorators.Directive,
          );

        if (decorator) {
          const selector = getDecoratorPropertyValue(decorator, 'selector');

          if (selector && isLiteral(selector) && selector.value) {
            directiveSelectors = new Set(
              (selector.value.toString() || '')
                .replace(/[[\]\s]/g, '')
                .split(','),
            );
          }
        }

        const propertyAlias = (outputCallExpression
          .arguments[0] as TSESTree.Literal).value;

        if (
          propertyAlias &&
          isIdentifier(classProperty.key) &&
          canPropertyBeAliased(propertyAlias.toString(), classProperty.key.name)
        )
          return;

        context.report({
          node: classProperty,
          messageId: 'noOutputRename',
        });
      },
    };
  },
});
