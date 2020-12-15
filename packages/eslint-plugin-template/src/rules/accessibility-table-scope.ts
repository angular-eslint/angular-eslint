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

    return parserServices.defineTemplateBodyVisitor({
      BoundAttribute(attribute: any) {
        validateAttribute(context, parserServices, attribute);
      },
      TextAttribute(attribute: any) {
        validateAttribute(context, parserServices, attribute);
      },
    });
  },
});

function validateAttribute(
  context: any,
  parserServices: ReturnType<typeof getTemplateParserServices>,
  attribute: any,
): void {
  console.log;
  if (attribute.parent.name === 'th' || attribute.name !== 'scope') {
    return;
  }

  const loc = parserServices.convertNodeSourceSpanToLoc(attribute.sourceSpan);

  context.report({
    loc,
    messageId: 'accessibilityTableScope',
  });
}
