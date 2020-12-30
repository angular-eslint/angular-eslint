import { aria } from 'aria-query';
import { TmplAstBoundAttribute, TmplAstTextAttribute } from '@angular/compiler';

import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'accessibilityValidAria';
export const RULE_NAME = 'accessibility-valid-aria';
const ARIA_PATTERN = /^aria-.*/;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that correct ARIA attributes are used',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      accessibilityValidAria:
        'The `{{attribute}}` is an invalid ARIA attribute',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      [`BoundAttribute[name=${ARIA_PATTERN}], TextAttribute[name=${ARIA_PATTERN}]`]({
        name: attribute,
        sourceSpan,
      }: TmplAstBoundAttribute | TmplAstTextAttribute) {
        if (getAriaAttributes().has(attribute)) return;

        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        context.report({
          loc,
          messageId: 'accessibilityValidAria',
          data: { attribute },
        });
      },
    };
  },
});

let ariaAttributes: ReadonlySet<string> | null = null;
function getAriaAttributes(): ReadonlySet<string> {
  return ariaAttributes || (ariaAttributes = new Set<string>(aria.keys()));
}
