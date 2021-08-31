import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { metadataProperty } from '../utils/selectors';
import { getDecoratorPropertyAddFix, isProperty } from '../utils/utils';

type Options = [{ readonly ignoreClassNamePattern?: string }];
export type MessageIds = 'useInjectableProvidedIn' | 'suggestInjector';
export const RULE_NAME = 'use-injectable-provided-in';
const METADATA_PROPERTY_NAME = 'providedIn';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Using the \`${METADATA_PROPERTY_NAME}\` property makes \`Injectables\` tree-shakable`,
      category: 'Best Practices',
      recommended: false,
      suggestion: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreClassNamePattern: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useInjectableProvidedIn: `The \`${METADATA_PROPERTY_NAME}\` property is mandatory for \`Injectables\``,
      suggestInjector: `Use \`${METADATA_PROPERTY_NAME}: '{{injector}}'\``,
    },
  },
  defaultOptions: [{}],
  create(context, [{ ignoreClassNamePattern }]) {
    const injectableClassDecorator = `ClassDeclaration:not([id.name=${ignoreClassNamePattern}]):not(:has(TSClassImplements:matches([expression.property.name='HttpInterceptor'], [expression.name='HttpInterceptor']))) > Decorator[expression.callee.name="Injectable"]`;
    const providedInMetadataProperty = metadataProperty(METADATA_PROPERTY_NAME);
    const withoutProvidedInDecorator = `${injectableClassDecorator}:matches([expression.arguments.length=0], [expression.arguments.0.type='ObjectExpression']:not(:has(${providedInMetadataProperty})))`;
    const nullableProvidedInProperty = `${injectableClassDecorator} ${providedInMetadataProperty}:matches([value.type='Identifier'][value.name='undefined'], [value.type='Literal'][value.raw='null'])`;
    const selectors = [
      withoutProvidedInDecorator,
      nullableProvidedInProperty,
    ].join(',');

    return {
      [selectors](node: TSESTree.Decorator | TSESTree.Property) {
        context.report({
          node: isProperty(node) ? node.value : node,
          messageId: 'useInjectableProvidedIn',
          suggest: (['any', 'platform', 'root'] as const).map((injector) => ({
            messageId: 'suggestInjector',
            fix: (fixer) => {
              return isProperty(node)
                ? fixer.replaceText(node.value, `'${injector}'`)
                : getDecoratorPropertyAddFix(
                    node,
                    fixer,
                    `${METADATA_PROPERTY_NAME}: '${injector}'`,
                  ) ?? [];
            },
            data: { injector },
          })),
        });
      },
    };
  },
});
