import type { Interpolation } from '@angular-eslint/bundled-angular-compiler';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noInterpolationInAttributes';
export const RULE_NAME = 'no-interpolation-in-attributes';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that property-binding is used instead of interpolation in attributes.',
    },
    schema: [],
    messages: {
      noInterpolationInAttributes:
        'Use property binding [attribute]="value" instead of interpolation {{ value }} for an attribute.',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      ['BoundAttribute Interpolation$1'](interpolation: Interpolation) {
        const {
          sourceSpan: { start, end },
        } = interpolation;

        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(start),
            end: sourceCode.getLocFromIndex(end),
          },
          messageId: 'noInterpolationInAttributes',
        });
      },
    };
  },
});
