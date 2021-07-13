import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { ASTUtils } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getAriaAttributeKeys } from '../utils/get-aria-attribute-keys';
import {
  COMPONENT_OR_DIRECTIVE_SELECTOR_LITERAL,
  INPUTS_METADATA_PROPERTY_LITERAL,
  INPUT_ALIAS,
} from '../utils/selectors';
import {
  capitalize,
  getNearestNodeFrom,
  getRawText,
  getReplacementText,
  isClassPropertyOrMethodDefinition,
  kebabToCamelCase,
  withoutBracketsAndWhitespaces,
} from '../utils/utils';

type Options = [{ readonly allowedNames?: readonly string[] }];
export type MessageIds =
  | 'noInputRename'
  | 'suggestRemoveAliasName'
  | 'suggestReplaceOriginalNameWithAliasName';
export const RULE_NAME = 'no-input-rename';
const STYLE_GUIDE_LINK = 'https://angular.io/guide/styleguide#style-05-13';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that input bindings are not aliased',
      category: 'Best Practices',
      recommended: 'error',
      suggestion: true,
    },
    fixable: 'code',
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

    return {
      [COMPONENT_OR_DIRECTIVE_SELECTOR_LITERAL](
        node: TSESTree.Literal | TSESTree.TemplateElement,
      ) {
        selectors = new Set(
          withoutBracketsAndWhitespaces(getRawText(node)).split(','),
        );
      },
      [INPUT_ALIAS](node: TSESTree.Literal | TSESTree.TemplateElement) {
        const classPropertyOrMethodDefinition = getNearestNodeFrom(
          node,
          isClassPropertyOrMethodDefinition,
        );

        if (
          !classPropertyOrMethodDefinition ||
          !ASTUtils.isIdentifier(classPropertyOrMethodDefinition.key)
        ) {
          return;
        }

        const aliasName = getRawText(node);
        const propertyName = getRawText(classPropertyOrMethodDefinition.key);

        if (
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
            fix: (fixer) => fixer.remove(node),
          });
        } else if (!isAliasNameAllowed(selectors, propertyName, aliasName)) {
          context.report({
            node,
            messageId: 'noInputRename',
            suggest: [
              {
                messageId: 'suggestRemoveAliasName',
                fix: (fixer) => fixer.remove(node),
              },
              {
                messageId: 'suggestReplaceOriginalNameWithAliasName',
                fix: (fixer) => [
                  fixer.remove(node),
                  fixer.replaceText(
                    classPropertyOrMethodDefinition.key,
                    aliasName.includes('-') ? `'${aliasName}'` : aliasName,
                  ),
                ],
              },
            ],
          });
        }
      },
      [INPUTS_METADATA_PROPERTY_LITERAL](
        node: TSESTree.Literal | TSESTree.TemplateElement,
      ) {
        const [propertyName, aliasName] = withoutBracketsAndWhitespaces(
          getRawText(node),
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
              fixer.replaceText(node, getReplacementText(node, propertyName)),
          });
        } else if (!isAliasNameAllowed(selectors, propertyName, aliasName)) {
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
                fixer.replaceText(node, getReplacementText(node, name)),
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
