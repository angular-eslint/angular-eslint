import { ASTUtils, Selectors, toPattern } from '@angular-eslint/utils';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];

export type MessageIds = 'preferInject';
export const RULE_NAME = 'prefer-inject';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer using the inject() function over constructor parameter injection',
      recommended: 'recommended',
    },
    schema: [],
    messages: {
      preferInject:
        "Prefer using the inject() function over constructor parameter injection. Use Angular's migration schematic to automatically refactor: ng generate @angular/core:inject",
    },
  },
  defaultOptions: [],
  create(context) {
    const angularDecoratorsPattern = toPattern([
      'Component',
      'Directive',
      'Injectable',
      'Pipe',
    ]);

    function shouldReportParameter(param: TSESTree.Parameter): boolean {
      let actualParam = param;
      let hasModifier = false;

      if (param.type === AST_NODE_TYPES.TSParameterProperty) {
        actualParam = param.parameter;
        hasModifier = true;
      }

      const decorators = (
        (param.type === AST_NODE_TYPES.TSParameterProperty
          ? param.parameter
          : param) as TSESTree.Parameter
      ).decorators;
      if (
        decorators?.some((d) => {
          const name = ASTUtils.getDecoratorName(d);
          return (
            name === 'Inject' ||
            name === 'Optional' ||
            name === 'Self' ||
            name === 'SkipSelf' ||
            name === 'Host'
          );
        })
      ) {
        return true;
      }

      if (hasModifier) {
        return true;
      }

      const typeAnnotation = (
        actualParam as TSESTree.Identifier | TSESTree.AssignmentPattern
      ).typeAnnotation;
      if (typeAnnotation) {
        switch (typeAnnotation.typeAnnotation.type) {
          case AST_NODE_TYPES.TSStringKeyword:
          case AST_NODE_TYPES.TSNumberKeyword:
          case AST_NODE_TYPES.TSBooleanKeyword:
          case AST_NODE_TYPES.TSBigIntKeyword:
          case AST_NODE_TYPES.TSSymbolKeyword:
          case AST_NODE_TYPES.TSAnyKeyword:
          case AST_NODE_TYPES.TSUnknownKeyword:
            return false;
          default:
            return true;
        }
      }

      return false;
    }

    return {
      [`${Selectors.decoratorDefinition(
        angularDecoratorsPattern,
      )} > ClassBody > MethodDefinition[kind="constructor"]`](
        node: TSESTree.MethodDefinition & {
          parent: TSESTree.ClassBody & { parent: TSESTree.ClassDeclaration };
        },
      ) {
        const params = (node.value as TSESTree.FunctionExpression).params ?? [];
        if (params.length === 0) {
          return;
        }
        for (const param of params) {
          if (shouldReportParameter(param)) {
            context.report({ node: param, messageId: 'preferInject' });
          }
        }
      },
    };
  },
});
