import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noPositiveTabindex';
export const RULE_NAME = 'no-positive-tabindex';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures that the tabindex attribute is not positive`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noPositiveTabindex: 'tabindex attribute cannot be positive',
    },
  },
  defaultOptions: [],
  create(context) {
    const getAttributeValue = (element: any, property: string) => {
      const attr = element.attributes.find(
        (attr: any) => attr.name === property,
      );
      const input = element.inputs.find(
        (input: any) => input.name === property,
      );
      if (attr) {
        return attr.value;
      }

      if (!input || !input.value.ast) {
        return undefined;
      }

      return input.value.ast.value;
    };

    const parserServices = getTemplateParserServices(context);
    return parserServices.defineTemplateBodyVisitor({
      ['Element'](node: any) {
        let tabIndexValue = getAttributeValue(node, 'tabindex');
        if (!tabIndexValue) {
          return;
        }

        tabIndexValue = parseInt(tabIndexValue, 10);
        if (tabIndexValue > 0) {
          const loc = parserServices.convertNodeSourceSpanToLoc(
            node.startSourceSpan,
          );
          context.report({
            messageId: 'noPositiveTabindex',
            loc,
          });
        }
      },
    });
  },
});
