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
    fixable: 'code',
    defaultOptions: [{ allowSubstringInterpolation: false }],
  },
  create(context, [{ allowSubstringInterpolation }]) {
    const sourceCode = context.sourceCode;

    return {
      ['BoundAttribute Interpolation'](interpolation: Interpolation) {
        const isFullInterpolation = !interpolation.strings.some(
          (str) => str !== '',
        );

        if (allowSubstringInterpolation && !isFullInterpolation) {
          return;
        }

        // 'parent' is an internal runtime property not declared in the type, hence the 'any' cast.
        const boundAttribute = (interpolation as any).parent?.parent;
        if (!boundAttribute) {
          return;
        }

        // The interpolation's own source span is computed from the attribute
        // value after HTML entities have been decoded, so its offsets drift
        // whenever the raw value contains entities. The attribute's value span
        // always matches the raw source text. Its `start` skips leading
        // whitespace, so report from `fullStart` to keep the location (and
        // `eslint-disable-next-line` comments) on the line the value starts.
        const reportStart: number =
          boundAttribute.valueSpan?.fullStart.offset ??
          interpolation.sourceSpan.start;
        const valueStart: number =
          boundAttribute.valueSpan?.start.offset ??
          interpolation.sourceSpan.start;
        const valueEnd: number =
          boundAttribute.valueSpan?.end.offset ?? interpolation.sourceSpan.end;

        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(reportStart),
            end: sourceCode.getLocFromIndex(valueEnd),
          },
          messageId: 'noInterpolationInAttributes',
          fix:
            isFullInterpolation &&
            interpolation.expressions.length === 1 &&
            // A fix would drop the attribute's i18n metadata.
            !boundAttribute.i18n
              ? (fixer) => {
                  const rawValue = sourceCode.text.slice(valueStart, valueEnd);
                  // The delimiters can be written as entities (for example
                  // `&#123;&#123;`), in which case the raw text cannot be
                  // safely sliced into an expression.
                  if (!rawValue.startsWith('{{') || !rawValue.endsWith('}}')) {
                    return null;
                  }

                  // Angular decodes HTML entities in interpolations and in
                  // property bindings differently (for example with a bare `&`
                  // before an entity), so moving an expression that contains
                  // `&` from one to the other can change its meaning.
                  if (rawValue.includes('&')) {
                    return null;
                  }

                  const expression = rawValue.slice(2, -2).trim();
                  const quote = getQuote(expression);
                  if (!quote) {
                    return null;
                  }

                  const attributeName = sourceCode.text
                    .slice(
                      boundAttribute.keySpan.start.offset,
                      boundAttribute.keySpan.end.offset,
                    )
                    .trim();

                  return fixer.replaceTextRange(
                    [
                      boundAttribute.sourceSpan.start.offset,
                      boundAttribute.sourceSpan.end.offset,
                    ],
                    `[${attributeName}]=${quote}${expression}${quote}`,
                  );
                }
              : null,
        });
      },
    };
  },
});

/**
 * Returns the quote character to wrap the property binding's value in, or
 * `null` if no quote character can wrap it without escaping. Double quotes
 * are preferred, and single quotes are used when the expression contains a
 * double quote (for example when the original value was single-quoted).
 */
function getQuote(expression: string): '"' | "'" | null {
  if (!expression.includes('"')) {
    return '"';
  }
  if (!expression.includes("'")) {
    return "'";
  }
  return null;
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Property binding syntax [attribute]="value" is more efficient and clearer than interpolation {{ value }} for setting attribute values in templates. Interpolation converts the expression to a string and then Angular parses it back, whereas property binding directly passes the value without string conversion. This makes property binding faster and avoids potential issues with type coercion. Property binding also makes it immediately obvious that the attribute value is dynamic rather than static. For substring interpolation (like alt="Image of {{ name }}"), the performance difference is minimal and interpolation may be more readable, so the rule can optionally allow these cases while still catching full interpolation patterns that should use property binding.',
};
