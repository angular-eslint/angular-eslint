import {
  ASTUtils,
  capitalize,
  Selectors,
  withoutBracketsAndWhitespaces,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds =
  | 'noOutputRename'
  | 'suggestRemoveAliasName'
  | 'suggestReplaceOriginalNameWithAliasName';
export const RULE_NAME = 'no-output-rename';
const STYLE_GUIDE_LINK = 'https://angular.dev/style-guide#style-05-13';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that output bindings are not aliased',
      recommended: 'recommended',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [],
    messages: {
      noOutputRename: `Output bindings should not be aliased (${STYLE_GUIDE_LINK})`,
      suggestRemoveAliasName: 'Remove alias name',
      suggestReplaceOriginalNameWithAliasName:
        'Remove alias name and use it as the original name',
    },
  },
  defaultOptions: [],
  create(context) {
    let selectors: ReadonlySet<string> = new Set();

    return {
      [Selectors.COMPONENT_OR_DIRECTIVE_SELECTOR_LITERAL](
        node: TSESTree.Literal | TSESTree.TemplateElement,
      ) {
        selectors = new Set(
          withoutBracketsAndWhitespaces(ASTUtils.getRawText(node)).split(','),
        );
      },
      [Selectors.OUTPUT_ALIAS](
        node: TSESTree.Literal | TSESTree.TemplateElement,
      ) {
        const propertyOrMethodDefinition = ASTUtils.getNearestNodeFrom(
          node,
          ASTUtils.isPropertyOrMethodDefinition,
        );

        if (
          !propertyOrMethodDefinition ||
          !TSESLintASTUtils.isIdentifier(propertyOrMethodDefinition.key)
        ) {
          return;
        }

        const aliasName = ASTUtils.getRawText(node);
        const propertyName = ASTUtils.getRawText(
          propertyOrMethodDefinition.key,
        );

        // The alias is either a string in the `@Output()` decorator function,
        // or a string on an `alias` property that is in an object expression
        // that is in the `output()` function. If it's the latter, then we want
        // to remove that whole property rather than just the string literal.
        const stringToRemove: TSESTree.Node = ASTUtils.isTemplateElement(node)
          ? node.parent
          : node;
        let rangeToRemove: Readonly<TSESTree.Range> = stringToRemove.range;

        if (ASTUtils.isProperty(stringToRemove.parent)) {
          const property = stringToRemove.parent;
          rangeToRemove = property.range;

          if (ASTUtils.isObjectExpression(property.parent)) {
            const objectExpression = property.parent;
            if (objectExpression.properties.length === 1) {
              // The property is the only property in the
              // object, so we can remove the whole object.
              rangeToRemove = objectExpression.range;
            } else {
              // There are other properties in the object, so we
              // can only remove the property. How we remove it
              // will depend on where the property is in the object.
              const propertyIndex =
                objectExpression.properties.indexOf(property);
              if (propertyIndex < objectExpression.properties.length - 1) {
                // The property is not the last one, so we can
                // remove everything up to the next property
                // which will remove the comma after it.
                rangeToRemove = [
                  property.range[0],
                  objectExpression.properties[propertyIndex + 1].range[0],
                ];
              } else {
                // The property is the last one. If the object has a
                // trailing comma, then we want to keep the trailing comma.
                // The simplest way to do that is to remove the property
                // and the comma that precedes it.
                const tokenBefore = context.sourceCode.getTokenBefore(property);
                if (tokenBefore && TSESLintASTUtils.isCommaToken(tokenBefore)) {
                  rangeToRemove = [tokenBefore.range[0], rangeToRemove[1]];
                }
              }
            }
          }
        }
        if (aliasName === propertyName) {
          context.report({
            node,
            messageId: 'noOutputRename',
            fix: (fixer) => fixer.removeRange(rangeToRemove),
          });
        } else if (!isAliasNameAllowed(selectors, propertyName, aliasName)) {
          context.report({
            node,
            messageId: 'noOutputRename',
            suggest: [
              {
                messageId: 'suggestRemoveAliasName',
                fix: (fixer) => fixer.removeRange(rangeToRemove),
              },
              {
                messageId: 'suggestReplaceOriginalNameWithAliasName',
                fix: (fixer) => [
                  fixer.removeRange(rangeToRemove),
                  fixer.replaceText(
                    propertyOrMethodDefinition.key,
                    aliasName.includes('-') ? `'${aliasName}'` : aliasName,
                  ),
                ],
              },
            ],
          });
        }
      },
      [Selectors.OUTPUTS_METADATA_PROPERTY_LITERAL](
        node: TSESTree.Literal | TSESTree.TemplateElement,
      ) {
        const ancestorMaybeHostDirectiveAPI =
          node.parent?.parent?.parent?.parent?.parent;
        if (
          ancestorMaybeHostDirectiveAPI &&
          ASTUtils.isProperty(ancestorMaybeHostDirectiveAPI)
        ) {
          /**
           * Angular v15 introduced the directive composition API: https://angular.dev/guide/directives/directive-composition-api
           * Renaming host directive outputs using this API is not a bad practice and should not be reported
           */
          const hostDirectiveAPIPropertyName = 'hostDirectives';
          if (
            (ASTUtils.isLiteral(ancestorMaybeHostDirectiveAPI.key) &&
              ancestorMaybeHostDirectiveAPI.key.value ===
                hostDirectiveAPIPropertyName) ||
            (TSESLintASTUtils.isIdentifier(ancestorMaybeHostDirectiveAPI.key) &&
              ancestorMaybeHostDirectiveAPI.key.name ===
                hostDirectiveAPIPropertyName)
          ) {
            return;
          }
        }

        const [propertyName, aliasName] = withoutBracketsAndWhitespaces(
          ASTUtils.getRawText(node),
        ).split(':');

        if (!aliasName) return;

        if (aliasName === propertyName) {
          context.report({
            node,
            messageId: 'noOutputRename',
            fix: (fixer) =>
              fixer.replaceText(
                node,
                ASTUtils.getReplacementText(node, propertyName),
              ),
          });
        } else if (!isAliasNameAllowed(selectors, propertyName, aliasName)) {
          context.report({
            node,
            messageId: 'noOutputRename',
            suggest: (
              [
                ['suggestRemoveAliasName', propertyName],
                ['suggestReplaceOriginalNameWithAliasName', aliasName],
              ] as const
            ).map(([messageId, name]) => ({
              messageId,
              fix: (fixer) =>
                fixer.replaceText(
                  node,
                  ASTUtils.getReplacementText(node, name),
                ),
            })),
          });
        }
      },
      'ClassDeclaration:exit'() {
        selectors = new Set();
      },
    };
  },
});

function composedName(selector: string, propertyName: string): string {
  return `${selector}${capitalize(propertyName)}`;
}

function isAliasNameAllowed(
  selectors: ReadonlySet<string>,
  propertyName: string,
  aliasName: string,
): boolean {
  return [...selectors].some((selector) => {
    return (
      selector === aliasName ||
      composedName(selector, propertyName) === aliasName
    );
  });
}
