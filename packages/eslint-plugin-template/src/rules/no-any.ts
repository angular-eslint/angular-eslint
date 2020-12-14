import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noAny';
export const RULE_NAME = 'no-any';
const ANY_TYPE_CAST_FUNCTION_NAME = '$any';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `
        The use of '${ANY_TYPE_CAST_FUNCTION_NAME}' nullifies the compile-time
        benefits of the Angular's type system.
      `,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noAny: `Avoid using '${ANY_TYPE_CAST_FUNCTION_NAME}' in templates`,
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const sourceCode = context.getSourceCode();

    return parserServices.defineTemplateBodyVisitor({
      MethodCall({ name, receiver, sourceSpan }: any) {
        const isAnyTypeCastFunction = name === ANY_TYPE_CAST_FUNCTION_NAME;
        const isAngularAnyTypeCastFunction =
          !receiver.expression && !receiver.name;

        if (!isAnyTypeCastFunction || !isAngularAnyTypeCastFunction) return;

        const start = sourceCode.getLocFromIndex(sourceSpan.start);
        const end = sourceCode.getLocFromIndex(sourceSpan.end);

        context.report({
          messageId: 'noAny',
          loc: {
            start,
            end,
          },
        });
      },
    });
  },
});
