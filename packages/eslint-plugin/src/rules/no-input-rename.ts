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

export type Options = [{ readonly allowedNames?: readonly string[] }];
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

        // The alias is either a string in the `@Input()` decorator function,
        // or a string on an `alias` property that is in an object expression
        // that is in the `@Input()` decorator or the `input()` function or the
        // `input.required()` function. If it's on the `alias` property, then we
        // want to remove that whole property rather than just the string literal.
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

              // If the object is in an `input()` function, then
              // the object will be the second argument. The first
              // argument will be the default value. We need to
              // remove the comma after the default value.
              const tokenBefore =
                context.sourceCode.getTokenBefore(objectExpression);
              if (tokenBefore && TSESLintASTUtils.isCommaToken(tokenBefore)) {
                rangeToRemove = [tokenBefore.range[0], rangeToRemove[1]];
              }
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
            messageId: 'noInputRename',
            fix: (fixer) => fixer.removeRange(rangeToRemove),
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
