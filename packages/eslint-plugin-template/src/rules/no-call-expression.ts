import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noCallExpression';
export const RULE_NAME = 'no-call-expression';

const ALLOWED_METHOD_NAMES: ReadonlySet<string> = new Set(['$any']);

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Disallows calling expressions in templates, except for output handlers.`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noCallExpression: 'Avoid calling expressions in templates.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const sourceCode = context.getSourceCode();

    return parserServices.defineTemplateBodyVisitor({
      MethodCall(node: any) {
        const isMethodAllowed = ALLOWED_METHOD_NAMES.has(node.name);

        if (isMethodAllowed || node.parent.parent.type === 'BoundEvent') {
          return;
        }

        const additionalEndOffset =
          node.parent.type === 'Interpolation' ? -1 : 0;

        const start = sourceCode.getLocFromIndex(node.sourceSpan.start);
        const end = sourceCode.getLocFromIndex(
          node.sourceSpan.end + additionalEndOffset,
        );

        context.report({
          messageId: 'noCallExpression',
          loc: {
            start,
            end,
          },
        });
      },
    });
  },
});
