import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noAutofocus';
export const RULE_NAME = 'no-autofocus';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensure that autofocus attribute is not used`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noAutofocus:
        'autofocus attribute should not be used, as it reduces usability and accessibility for users',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return parserServices.defineTemplateBodyVisitor({
      Element(node: any) {
        const hasAttr = (node: any, prop: string) =>
          node.attributes.find(({ name }: any) => name === prop);

        if (hasAttr(node, 'autofocus')) {
          const loc = parserServices.convertNodeSourceSpanToLoc(
            node.startSourceSpan,
          );
          context.report({
            messageId: 'noAutofocus',
            loc,
          });
        }
      },
    });
  },
});
