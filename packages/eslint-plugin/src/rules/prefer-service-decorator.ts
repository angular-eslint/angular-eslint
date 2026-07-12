import {
  ASTUtils,
  isNotNullOrUndefined,
  RuleFixes,
  Selectors,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import {
  ASTUtils as TSESLintASTUtils,
  AST_NODE_TYPES,
} from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];

export type MessageIds = 'preferServiceDecorator';

export const RULE_NAME = 'prefer-service-decorator';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Prefer the `@Service()` decorator over `@Injectable({ providedIn: 'root' })`",
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferServiceDecorator:
        "Use the `@Service()` decorator instead of `@Injectable({ providedIn: 'root' })`",
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [Selectors.INJECTABLE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const { expression } = node;

        if (
          !ASTUtils.isCallExpression(expression) ||
          expression.arguments.length !== 1
        ) {
          return;
        }

        const [argument] = expression.arguments;

        if (!ASTUtils.isObjectExpression(argument)) {
          return;
        }

        const migration = getMetadataMigration(argument);

        if (!migration) {
          return;
        }

        context.report({
          node,
          messageId: 'preferServiceDecorator',
          fix: (fixer) => {
            const fixes = [
              // `@Injectable(...)` => `@Service(...)`.
              fixer.replaceText(expression.callee, 'Service'),
              // Migrate the `Injectable` import to `Service`.
              ...RuleFixes.getImportReplaceFix({
                fixer,
                fromName: 'Injectable',
                moduleName: '@angular/core',
                node,
                sourceCode: context.sourceCode,
                toName: 'Service',
              }),
            ];

            switch (migration.type) {
              // Only `providedIn: 'root'`, so drop the whole metadata object.
              case 'drop-metadata': {
                fixes.push(fixer.remove(argument));
                break;
              }
              // Keep the factory, but rename `useFactory` => `factory` and drop
              // `providedIn: 'root'` (which `@Service()` implies).
              case 'rewrite-factory': {
                fixes.push(
                  fixer.replaceText(
                    migration.useFactoryProperty.key,
                    'factory',
                  ),
                  RuleFixes.getNodeToCommaRemoveFix(
                    context.sourceCode,
                    migration.providedInProperty,
                    fixer,
                  ),
                );
                break;
              }
            }

            return fixes.filter(isNotNullOrUndefined);
          },
        });
      },
    };
  },
});

/**
 * Describes how an `@Injectable({ providedIn: 'root', ... })` decorator maps to
 * `@Service()`:
 * - `drop-metadata`: the metadata only held `providedIn: 'root'`, so the whole
 *   object is removed (`@Service()`).
 * - `rewrite-factory`: a `useFactory` is kept but renamed to `@Service()`'s
 *   `factory` option, while `providedIn: 'root'` is dropped.
 */
type MetadataMigration =
  | { readonly type: 'drop-metadata' }
  | {
      readonly type: 'rewrite-factory';
      readonly providedInProperty: TSESTree.Property;
      readonly useFactoryProperty: TSESTree.Property;
    };

/**
 * `@Service()` only models `providedIn: 'root'` (implicit) and accepts a
 * `factory` (which maps from `useFactory`). Any other provider metadata
 * (`useClass`, `useExisting`, `useValue`, `deps`, ...) has no equivalent, so we
 * bail out and leave such `@Injectable`s untouched for now.
 */
function getMetadataMigration(
  argument: TSESTree.ObjectExpression,
): MetadataMigration | undefined {
  const properties = argument.properties.filter(
    (property): property is TSESTree.Property =>
      property.type === AST_NODE_TYPES.Property,
  );

  const providedInProperty = properties.find(
    (property) => TSESLintASTUtils.getPropertyName(property) === 'providedIn',
  );

  const useFactoryProperty = properties.find(
    (property) => TSESLintASTUtils.getPropertyName(property) === 'useFactory',
  );

  // Bail out unless the only metadata is `providedIn: 'root'` plus an optional
  // `useFactory`.
  if (
    !providedInProperty ||
    TSESLintASTUtils.getStaticValue(providedInProperty.value)?.value !==
      'root' ||
    properties.length !==
      [providedInProperty, useFactoryProperty].filter(isNotNullOrUndefined)
        .length
  ) {
    return undefined;
  }

  return useFactoryProperty
    ? { type: 'rewrite-factory', providedInProperty, useFactoryProperty }
    : { type: 'drop-metadata' };
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Angular 22 introduced the `@Service()` decorator as a concise shorthand for `@Injectable({ providedIn: 'root' })`, the most common way to declare a tree-shakable, application-wide service. Using `@Service()` removes the boilerplate of the metadata object while expressing the exact same intent. Because `providedIn: 'root'` is exactly what `@Service()` implies, this migration is safe and behavior-preserving: the `providedIn: 'root'` entry is dropped, and a `useFactory` is preserved by renaming it to `@Service()`'s `factory` option. Services that rely on other provider metadata (`useClass`, `useExisting`, `useValue`, `deps`) or a different `providedIn` value (`'platform'`, `'any'`, a specific module) have no `@Service()` equivalent and are intentionally left untouched.",
};
