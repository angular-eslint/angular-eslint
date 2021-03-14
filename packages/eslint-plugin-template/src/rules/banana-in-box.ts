import type { BoundEventAst } from '@angular/compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'bananaInBox';
export const RULE_NAME = 'banana-in-box';
const INVALID_PATTERN = /\[(.*)\]/;
const VALID_CLOSE_BOX = ')]';
const VALID_OPEN_BOX = '[(';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that the two-way data binding syntax is correct',
      category: 'Best Practices',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      bananaInBox: 'Invalid binding syntax. Use [(expr)] instead',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const sourceCode = context.getSourceCode();

    return {
      BoundEvent({ name, sourceSpan }: BoundEventAst) {
        const matches = name.match(INVALID_PATTERN);

        if (!matches) return;

        const [, text] = matches;
        const newText = `${VALID_OPEN_BOX}${text}${VALID_CLOSE_BOX}`;
        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);
        const startIndex = sourceCode.getIndexFromLoc(loc.start);

        context.report({
          messageId: 'bananaInBox',
          loc,
          fix: (fixer) =>
            fixer.replaceTextRange(
              [startIndex, startIndex + name.length + 2],
              newText,
            ),
        });
      },
    };
  },
});
