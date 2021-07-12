import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { metadataProperty } from '../utils/selectors';
import { getDecoratorPropertyAddFix, isProperty } from '../utils/utils';

type Options = [];
export type MessageIds = 'useInjectableProvidedIn' | 'suggestInjector';
export const RULE_NAME = 'use-injectable-provided-in';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Using the `providedIn` property makes `Injectables` tree-shakable',
      category: 'Best Practices',
      recommended: false,
      suggestion: true,
    },
    schema: [],
    messages: {
      useInjectableProvidedIn:
        'The `providedIn` property is mandatory for `Injectables`',
      suggestInjector: "Use `providedIn: '{{injector}}'`",
    },
  },
  defaultOptions: [],
  create(context) {
    const injectableClassDecorator = `ClassDeclaration:not(:has(TSClassImplements:matches([expression.property.name='HttpInterceptor'], [expression.name='HttpInterceptor']))) > Decorator[expression.callee.name="Injectable"]`;
    const providedInMetadataProperty = metadataProperty('providedIn');
    const withoutProvidedInDecorator = `${injectableClassDecorator}:matches([expression.arguments.length=0], [expression.arguments.0.type='ObjectExpression']:not(:has(${providedInMetadataProperty})))`;
    const nullableProvidedInProperty = `${injectableClassDecorator} ${providedInMetadataProperty}:matches([value.type='Identifier'][value.name='undefined'], [value.type='Literal'][value.raw='null'])`;
    const selectors = [
      withoutProvidedInDecorator,
      nullableProvidedInProperty,
    ].join(',');

    return {
      [selectors](node: TSESTree.Decorator | TSESTree.Property) {
        context.report({
          node,
          messageId: 'useInjectableProvidedIn',
          suggest: (['any', 'platform', 'root'] as const).map((injector) => ({
            messageId: 'suggestInjector',
            fix: (fixer) => {
              return isProperty(node)
                ? fixer.replaceText(node.value, `'${injector}'`)
                : getDecoratorPropertyAddFix(
                    node,
                    fixer,
                    `providedIn: '${injector}'`,
                  ) ?? [];
            },
            data: { injector },
          })),
        });
      },
    };
  },
});
