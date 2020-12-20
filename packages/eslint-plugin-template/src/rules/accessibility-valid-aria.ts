import { aria } from 'aria-query';
import { TmplAstBoundAttribute, TmplAstTextAttribute } from '@angular/compiler';

import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'accessibilityValidAria';
export const RULE_NAME = 'accessibility-valid-aria';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that the correct ARIA attributes are used.',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      accessibilityValidAria:
        '{{attribute}}: This attribute is an invalid ARIA attribute.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'TextAttribute[name=/aria-*/], BoundAttribute[name=/aria-*/]'({
        name,
        sourceSpan,
      }: TmplAstTextAttribute | TmplAstBoundAttribute) {
        if (getAriaAttributes().has(name)) {
          return;
        }

        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        context.report({
          loc,
          messageId: 'accessibilityValidAria',
          data: { attribute: name },
        });
      },
    };
  },
});

let ariaAttributes: Set<string> | null = null;
function getAriaAttributes(): Set<string> {
  return ariaAttributes || (ariaAttributes = new Set<string>(aria.keys()));
}
