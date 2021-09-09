import {
  ASTUtils,
  capitalize,
  Selectors,
  withoutBracketsAndWhitespaces,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/experimental-utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds =
  | 'noOutputRename'
  | 'suggestRemoveAliasName'
  | 'suggestReplaceOriginalNameWithAliasName';
export const RULE_NAME = 'no-output-rename';
const STYLE_GUIDE_LINK = 'https://angular.io/guide/styleguide#style-05-13';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that output bindings are not aliased',
      category: 'Best Practices',
      recommended: 'error',
      suggestion: true,
    },
    fixable: 'code',
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
        const classPropertyOrMethodDefinition = ASTUtils.getNearestNodeFrom(
          node,
          ASTUtils.isClassPropertyOrMethodDefinition,
        );

        if (
          !classPropertyOrMethodDefinition ||
          !TSESLintASTUtils.isIdentifier(classPropertyOrMethodDefinition.key)
        ) {
          return;
        }

        const aliasName = ASTUtils.getRawText(node);
        const propertyName = ASTUtils.getRawText(
          classPropertyOrMethodDefinition.key,
        );

        if (aliasName === propertyName) {
          context.report({
            node,
            messageId: 'noOutputRename',
            fix: (fixer) => fixer.remove(node),
          });
        } else if (!isAliasNameAllowed(selectors, propertyName, aliasName)) {
          context.report({
            node,
            messageId: 'noOutputRename',
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
      [Selectors.OUTPUTS_METADATA_PROPERTY_LITERAL](
        node: TSESTree.Literal | TSESTree.TemplateElement,
      ) {
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
