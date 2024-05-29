import {
  ASTUtils,
  capitalize,
  getAriaAttributeKeys,
  kebabToCamelCase,
  Selectors,
  withoutBracketsAndWhitespaces,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [{ readonly allowedNames?: readonly string[] }];
export type MessageIds =
  | 'noInputRename'
  | 'suggestRemoveAliasName'
  | 'suggestReplaceOriginalNameWithAliasName';
export const RULE_NAME = 'no-input-rename';
const STYLE_GUIDE_LINK = 'https://angular.dev/style-guide#style-05-13';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that input bindings are not aliased',
      recommended: 'recommended',
    },
    fixable: 'code',
    hasSuggestions: true,
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
      noInputRename: `Input bindings should not be aliased (${STYLE_GUIDE_LINK})`,
      suggestRemoveAliasName: 'Remove alias name',
      suggestReplaceOriginalNameWithAliasName:
        'Remove alias name and use it as the original name',
    },
  },
  defaultOptions: [{ allowedNames: [] }],
  create(context, [{ allowedNames = [] }]) {
    let selectors: ReadonlySet<string> = new Set();
    const ariaAttributeKeys = getAriaAttributeKeys();
    let selectorDirectiveName: string;

    return {
      [Selectors.COMPONENT_OR_DIRECTIVE_SELECTOR_LITERAL](
        node: TSESTree.Literal | TSESTree.TemplateElement,
      ) {
        const nodeRawText = ASTUtils.getRawText(node);
        const bracketMatchResults = nodeRawText.match(/\[(.*?)\]/);

        if (bracketMatchResults) {
          selectorDirectiveName = bracketMatchResults[1];
        }

        selectors = new Set(
          withoutBracketsAndWhitespaces(nodeRawText).split(','),
        );
      },
      [Selectors.INPUT_ALIAS](
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

        let isAliasMetadataProperty = false;

        if (node.parent && ASTUtils.isProperty(node.parent)) {
          if (ASTUtils.getRawText(node.parent.key) !== 'alias') {
            // We're within an Input decorator metadata object, but it is not the alias property
            return;
          }
          isAliasMetadataProperty = true;
        }

        const aliasName = ASTUtils.getRawText(node);
        const propertyName = ASTUtils.getRawText(
          propertyOrMethodDefinition.key,
        );

        if (
          allowedNames.includes(aliasName) ||
          (ariaAttributeKeys.has(aliasName) &&
            propertyName === kebabToCamelCase(aliasName))
        ) {
          return;
        }

        const inputCallExpression = ASTUtils.getNearestNodeFrom(
          node,
          ASTUtils.isCallExpression,
        );

        if (
          inputCallExpression &&
          TSESLintASTUtils.isIdentifier(inputCallExpression.callee) &&
          inputCallExpression.callee.name === 'Input' &&
          ASTUtils.isObjectExpression(inputCallExpression.arguments?.[0])
        ) {
          const [firstArg] = inputCallExpression.arguments;

          const aliasProperty = firstArg.properties.find(
            (property) =>
              ASTUtils.isProperty(property) &&
              ASTUtils.getRawText(property.key) === 'alias',
          );

          if (!aliasProperty) {
            return;
          }
        }

        if (aliasName === propertyName) {
          context.report({
            node,
            messageId: 'noInputRename',
            fix: (fixer) => {
              if (node.parent && isAliasMetadataProperty) {
                return fixer.remove(node.parent);
              }
              return fixer.remove(node);
            },
          });
        } else if (
          !isAliasNameAllowed(
            selectors,
            propertyName,
            aliasName,
            selectorDirectiveName,
          )
        ) {
          context.report({
            node,
            messageId: 'noInputRename',
            suggest: [
              {
                messageId: 'suggestRemoveAliasName',
                fix: (fixer) => {
                  if (node.parent && isAliasMetadataProperty) {
                    return fixer.remove(node.parent);
                  }
                  return fixer.remove(node);
                },
              },
              {
                messageId: 'suggestReplaceOriginalNameWithAliasName',
                fix: (fixer) => [
                  fixer.remove(node),
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
      [Selectors.INPUTS_METADATA_PROPERTY_LITERAL](
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
           * Renaming host directive inputs using this API is not a bad practice and should not be reported
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

        if (
          !aliasName ||
          allowedNames.includes(aliasName) ||
          (ariaAttributeKeys.has(aliasName) &&
            propertyName === kebabToCamelCase(aliasName))
        ) {
          return;
        }

        if (aliasName === propertyName) {
          context.report({
            node,
            messageId: 'noInputRename',
            fix: (fixer) =>
              fixer.replaceText(
                node,
                ASTUtils.getReplacementText(node, propertyName),
              ),
          });
        } else if (
          !isAliasNameAllowed(
            selectors,
            propertyName,
            aliasName,
            selectorDirectiveName,
          )
        ) {
          context.report({
            node,
            messageId: 'noInputRename',
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
  selectorDirectiveName: string,
): boolean {
  return [...selectors].some((selector) => {
    return (
      selector === aliasName ||
      selectorDirectiveName === aliasName ||
      composedName(selector, propertyName) === aliasName
    );
  });
}
