import type {
  ParseSourceSpan,
  TmplAstElement,
} from '@angular-eslint/bundled-angular-compiler';
import {
  ASTWithSource,
  LiteralPrimitive,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [
  {
    readonly ignoreWithDirectives?: string[];
  },
];
export type MessageIds = 'invalidType' | 'missingType';
export const RULE_NAME = 'button-has-type';
const DEFAULT_OPTIONS: Options[number] = {
  ignoreWithDirectives: [],
};
export const INVALID_TYPE_DATA_KEY = 'type';

interface InvalidButtonTypeInfo {
  readonly value: string;
  readonly sourceSpan: ParseSourceSpan;
}

// https://www.w3.org/TR/html401/interact/forms.html#adef-type-BUTTON
const VALID_BUTTON_TYPES: readonly string[] = ['button', 'submit', 'reset'];
const TYPE_ATTRIBUTE_NAME = 'type';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures that a button has a valid type specified',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreWithDirectives: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
            default: DEFAULT_OPTIONS.ignoreWithDirectives as
              | string[]
              | undefined,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingType: 'Type for <button> is missing',
      invalidType: `"{{${INVALID_TYPE_DATA_KEY}}}" can not be used as a type for <button>`,
    },
  },
  defaultOptions: [{}],
  create(context, [{ ignoreWithDirectives }]) {
    const parserServices = getTemplateParserServices(context);

    return {
      [`Element[name=button]`](element: TmplAstElement) {
        if (!isTypeAttributePresentInElement(element)) {
          if (!isIgnored(ignoreWithDirectives, element)) {
            context.report({
              loc: parserServices.convertNodeSourceSpanToLoc(
                element.sourceSpan,
              ),
              messageId: 'missingType',
            });
          }
        }

        const invalidTypeInfo = getInvalidButtonTypeIfPresent(element);
        if (invalidTypeInfo != null) {
          context.report({
            loc: parserServices.convertNodeSourceSpanToLoc(
              invalidTypeInfo.sourceSpan,
            ),
            messageId: 'invalidType',
            data: {
              [INVALID_TYPE_DATA_KEY]: invalidTypeInfo.value,
            },
          });
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Buttons default to `type="submit"` when no type is specified. If placed inside a form, the button triggers a form submission on click. Enforcing the type attribute clarifies the code\'s intent and prevents unintended form submissions.',
};

function isTypeAttributePresentInElement({
  inputs,
  attributes,
}: TmplAstElement): boolean {
  return [...inputs, ...attributes].some(
    ({ name }) => name === TYPE_ATTRIBUTE_NAME,
  );
}

function isIgnored(
  ignoreWithDirectives: string[] | undefined,
  { inputs, attributes }: TmplAstElement,
) {
  if (ignoreWithDirectives && ignoreWithDirectives.length > 0) {
    for (const input of inputs) {
      if (ignoreWithDirectives.includes(input.name)) {
        return true;
      }
    }
    for (const attribute of attributes) {
      if (ignoreWithDirectives.includes(attribute.name)) {
        return true;
      }
    }
  }

  return false;
}

function getInvalidButtonTypeIfPresent(
  element: TmplAstElement,
): InvalidButtonTypeInfo | null {
  const invalidTextAttribute = element.attributes.find(
    ({ name, value }) =>
      name === TYPE_ATTRIBUTE_NAME && !VALID_BUTTON_TYPES.includes(value),
  );

  if (invalidTextAttribute) {
    return {
      sourceSpan: invalidTextAttribute.sourceSpan,
      value: invalidTextAttribute.value,
    };
  }

  for (const { name, value, sourceSpan } of element.inputs) {
    // Intentionally ignore the property binding by looking for literal primitives only
    // in order to avoid type-checking for the property, e.g. check that it's 'submit', 'button', etc.
    if (
      name === TYPE_ATTRIBUTE_NAME &&
      value instanceof ASTWithSource &&
      value.ast instanceof LiteralPrimitive &&
      !VALID_BUTTON_TYPES.includes(value.ast.value)
    ) {
      return {
        value: value.ast.value,
        sourceSpan,
      };
    }
  }

  return null;
}
