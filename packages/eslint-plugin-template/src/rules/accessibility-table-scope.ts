import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'accessibilityTableScope';
export const RULE_NAME = 'accessibility-table-scope';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that scope is not used on any element except th.',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      accessibilityTableScope: 'Scope attribute can only be on <th> element.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      Element(node: any) {
        if (node.name === 'th') {
          return;
        }

        const attributes = [...node.inputs, ...node.attributes];

        for (const attribute of attributes) {
          if (attribute.name !== 'scope') continue;

          const loc = parserServices.convertNodeSourceSpanToLoc(
            attribute.sourceSpan,
          );

          context.report({
            loc,
            messageId: 'accessibilityTableScope',
          });
        }
      },
    };
  },
});
