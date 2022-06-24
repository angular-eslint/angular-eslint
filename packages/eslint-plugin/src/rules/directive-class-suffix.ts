import {
  ASTUtils,
  Selectors,
  toHumanReadableText,
} from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [{ readonly suffixes: readonly string[] }];
export type MessageIds = 'directiveClassSuffix';
export const RULE_NAME = 'directive-class-suffix';
const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-02-03';
const DEFAULT_SUFFIXES = ['Directive'] as const;
const VALIDATOR_SUFFIX = 'Validator';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Classes decorated with @Directive must have suffix "Directive" (or custom) in their name. See more at ${STYLE_GUIDE_LINK}`,
      recommended: 'error',
    },
    schema: [
      {
        type: 'object',
        properties: {
          suffixes: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      directiveClassSuffix: `Directive class names should end with one of these suffixes: {{suffixes}} (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [{ suffixes: DEFAULT_SUFFIXES }],
  create(context, [{ suffixes }]) {
    return {
      [Selectors.DIRECTIVE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const selectorPropertyValue = ASTUtils.getDecoratorPropertyValue(
          node,
          'selector',
        );

        if (!selectorPropertyValue) return;

        const classParent = node.parent as TSESTree.ClassDeclaration;
        const className = ASTUtils.getClassName(classParent);
        const declaredInterfaceNames =
          ASTUtils.getDeclaredInterfaceNames(classParent);
        const hasValidatorInterface = declaredInterfaceNames.some(
          (interfaceName) => interfaceName.endsWith(VALIDATOR_SUFFIX),
        );
        const allSuffixes = suffixes.concat(
          hasValidatorInterface ? VALIDATOR_SUFFIX : [],
        );

        if (
          !className ||
          !allSuffixes.some((suffix) => className.endsWith(suffix))
        ) {
          context.report({
            node: classParent.id ?? classParent,
            messageId: 'directiveClassSuffix',
            data: { suffixes: toHumanReadableText(allSuffixes) },
          });
        }
      },
    };
  },
});
