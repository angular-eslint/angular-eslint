import { ASTUtils, RuleFixes, Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [{ readonly ignoreClassNamePattern?: string }];
export type MessageIds = 'useInjectableProvidedIn' | 'suggestInjector';
export const RULE_NAME = 'use-injectable-provided-in';
const METADATA_PROPERTY_NAME = 'providedIn';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Using the \`${METADATA_PROPERTY_NAME}\` property makes \`Injectables\` tree-shakable`,
    },
    hasSuggestions: true,
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
    const providedInMetadataProperty = Selectors.metadataProperty(
      METADATA_PROPERTY_NAME,
    );
    const withoutProvidedInDecorator = `${injectableClassDecorator}:matches([expression.arguments.length=0], [expression.arguments.0.type='ObjectExpression']:not(:has(${providedInMetadataProperty})))`;
    const nullableProvidedInProperty = `${injectableClassDecorator} ${providedInMetadataProperty}:matches([value.type='Identifier'][value.name='undefined'], [value.type='Literal'][value.raw='null'])`;
    const selectors = [
      withoutProvidedInDecorator,
      nullableProvidedInProperty,
    ].join(',');

    return {
      [selectors](node: TSESTree.Decorator | TSESTree.Property) {
        context.report({
          node: ASTUtils.isProperty(node) ? node.value : node,
          messageId: 'useInjectableProvidedIn',
          suggest: (['any', 'platform', 'root'] as const).map((injector) => ({
            messageId: 'suggestInjector',
            fix: (fixer) => {
              return ASTUtils.isProperty(node)
                ? fixer.replaceText(node.value, `'${injector}'`)
                : (RuleFixes.getDecoratorPropertyAddFix(
                    node,
                    fixer,
                    `${METADATA_PROPERTY_NAME}: '${injector}'`,
                  ) ?? []);
            },
            data: { injector },
          })),
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale: `Using 'providedIn' in the @Injectable() decorator (like '@Injectable({ providedIn: "root" })') enables tree-shaking, which means Angular can remove the service from your production bundle if it's never actually used. Without 'providedIn', services must be registered in a module's providers array, and Angular must include them in the bundle even if they're unused. This can significantly increase bundle size. Additionally, 'providedIn' makes services easier to use (no need to add them to module providers) and makes circular dependencies less likely. The 'providedIn' syntax is the modern, recommended way to provide services.`,
};
