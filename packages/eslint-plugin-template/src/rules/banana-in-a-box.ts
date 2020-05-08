import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'bananaInABox';
export const RULE_NAME = 'banana-in-a-box';

const INVALID_PATTERN = /\[(.*)\]/;
const VALID_CLOSE_BOX = ')]';
const VALID_OPEN_BOX = '[(';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Ensures that the two-way data binding syntax is correct`,
      category: 'Best Practices',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      bananaInABox: 'Invalid binding syntax. Use [(expr)] instead',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const sourceCode = context.getSourceCode();

    return parserServices.defineTemplateBodyVisitor({
      BoundEvent(node: any) {
        const matches = node.name.match(INVALID_PATTERN);
        if (!matches) {
          return;
        }

        const text = matches[1];
        const newText = `${VALID_OPEN_BOX}${text}${VALID_CLOSE_BOX}`;

        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);
        const startIndex = sourceCode.getIndexFromLoc(loc.start);

        context.report({
          messageId: 'bananaInABox',
          loc,
          fix: fixer =>
            fixer.replaceTextRange(
              [
                startIndex,
                '('.length + startIndex + ')'.length + node.name.length,
              ],
              newText,
            ),
        });
      },
    });
  },
});
