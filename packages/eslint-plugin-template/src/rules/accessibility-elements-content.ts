import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'accessibilityElementsContent';
export const RULE_NAME = 'accessibility-elements-content';

const elements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button'];

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that the heading, anchor and button elements have content in it.',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      accessibilityElementsContent: '<{{element}}/> should have content.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      Element(node: any) {
        if (elements.indexOf(node.name) === -1) {
          return;
        }

        const hasContent = node.children.length > 0;

        if (hasContent) {
          return;
        }

        const hasInnerContent = node.inputs.some(
          (input: any) =>
            input.name === 'innerHTML' || input.name === 'innerText',
        );

        if (hasInnerContent) {
          return;
        }

        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);

        context.report({
          loc,
          messageId: 'accessibilityElementsContent',
          data: {
            element: node.name,
          },
        });
      },
    };
  },
});
