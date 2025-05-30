import type { Interpolation } from '@angular-eslint/bundled-angular-compiler';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [{ allowSubstringInterpolation: boolean }];
export type MessageIds = 'noInterpolationInAttributes';
export const RULE_NAME = 'no-interpolation-in-attributes';

const allowSubstringInterpolationDescription = `\
When \`true\`, only attribute values that are entirely interpolations will fail, whereas values with interpolations that form part of larger strings will be allowed.

For example, when set to \`true\` the following code will not fail for the \`alt\` attribute but will still fail for the \`src\` attribute:

\`\`\`html
<img alt="Poke user {{ username }}" src="{{ pokeSrc }}" />
\`\`\`
`;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that property-binding is used instead of interpolation in attributes.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowSubstringInterpolation: {
            type: 'boolean',
            description: allowSubstringInterpolationDescription,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noInterpolationInAttributes:
        'Use property binding [attribute]="value" instead of interpolation {{ value }} for an attribute.',
    },
  },
  defaultOptions: [{ allowSubstringInterpolation: false }],
  create(context, [{ allowSubstringInterpolation }]) {
    const sourceCode = context.sourceCode;

    return {
      ['BoundAttribute Interpolation'](interpolation: Interpolation) {
        if (
          allowSubstringInterpolation &&
          interpolation.strings.some((str) => str !== '')
        ) {
          return;
        }
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
