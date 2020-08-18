import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { AngularInnerClassDecorators, getDecoratorName } from '../utils/utils';

type Options = [];

export type MessageIds = 'noAttributeDecorator';

export const CONSTRUCTOR_METHOD_NAME = 'constructor';

export const RULE_NAME = 'no-attribute-decorator';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Disallows usage of @${AngularInnerClassDecorators.Attribute} decorator.`,
      category: 'Possible Errors',
      recommended: false,
    },
    schema: [],
    messages: {
      noAttributeDecorator: `@${AngularInnerClassDecorators.Attribute} is considered bad practice. Use @Input instead`,
    },
  },
  defaultOptions: [],
  create(context) {
    function checkIfConstructor(node: TSESTree.MethodDefinition): boolean {
      return node.kind === CONSTRUCTOR_METHOD_NAME;
    }

    function validateParams(node: TSESTree.MethodDefinition): void {
      node.value.params.forEach((parameter) => {
        if (parameter.decorators != null) {
          for (const decorator of parameter.decorators) {
            if (
              getDecoratorName(decorator) ===
              AngularInnerClassDecorators.Attribute
            ) {
              context.report({
                node: parameter,
                messageId: 'noAttributeDecorator',
              });
              break;
            }
          }
        }
      });
    }

    return {
      MethodDefinition(node: TSESTree.MethodDefinition): void {
        if (
          node.value &&
          node.value.type === AST_NODE_TYPES.FunctionExpression &&
          checkIfConstructor(node)
        ) {
          validateParams(node);
        }
      },
    };
  },
});
