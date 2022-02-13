import type { TmplAstBoundEvent } from '@angular-eslint/bundled-angular-compiler';
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
      BoundEvent({ name, sourceSpan }: TmplAstBoundEvent) {
        const matches = name.match(INVALID_PATTERN);

        if (!matches) return;

        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        context.report({
          messageId: 'bananaInBox',
          loc,
          fix: (fixer) => {
            const [, textInTheBox] = matches;
            const textToReplace = `${VALID_OPEN_BOX}${textInTheBox}${VALID_CLOSE_BOX}`;
            const startIndex = sourceCode.getIndexFromLoc(loc.start);
            return fixer.replaceTextRange(
              [startIndex, startIndex + name.length + 2],
              textToReplace,
            );
          },
        });
      },
    };
  },
});
