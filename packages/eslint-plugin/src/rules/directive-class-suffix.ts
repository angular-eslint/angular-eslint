import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { DIRECTIVE_CLASS_DECORATOR } from '../utils/selectors';
import { getClassName, getDeclaredInterfaceNames } from '../utils/utils';

type Options = [
  {
    suffixes: string[];
  }
];
export type MessageIds = 'directiveClassSuffix';
export const RULE_NAME = 'directive-class-suffix';

const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-02-03';

const ValidatorSuffix = 'Validator';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Classes decorated with @Directive must have suffix "Directive" (or custom) in their name. See more at ${STYLE_GUIDE_LINK}.`,
      category: 'Best Practices',
      recommended: false,
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
      directiveClassSuffix: `The name of the class {{className}} should end with the suffix {{suffixes}} (${STYLE_GUIDE_LINK})`,
    },
  },
  defaultOptions: [
    {
      suffixes: ['Directive'],
    },
  ],
  create(context, [options]) {
    const { suffixes } = options;

    return {
      [DIRECTIVE_CLASS_DECORATOR](node: TSESTree.Decorator) {
        const classParent = node.parent as TSESTree.ClassDeclaration;
        const className = getClassName(classParent);

        const declaredInterfaceNames = getDeclaredInterfaceNames(classParent);
        const hasValidatorInterface = declaredInterfaceNames.some(
          interfaceName => interfaceName.endsWith(ValidatorSuffix),
        );

        if (hasValidatorInterface) {
          suffixes.push(ValidatorSuffix);
        }

        if (
          !className ||
          !suffixes.some(suffix => className.endsWith(suffix))
        ) {
          context.report({
            node: classParent.id ? classParent.id : classParent,
            messageId: 'directiveClassSuffix',
            data: {
              className,
              suffixes,
            },
          });
        }
      },
    };
  },
});
