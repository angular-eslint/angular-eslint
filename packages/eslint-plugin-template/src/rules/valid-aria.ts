import type { AST } from '@angular-eslint/bundled-angular-compiler';
import {
  ASTWithSource,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import type { ARIAProperty, ARIAPropertyDefinition } from 'aria-query';
import { aria } from 'aria-query';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { toPattern } from '../utils/to-pattern';

export type Options = [];
export type MessageIds =
  | 'validAria'
  | 'validAriaValue'
  | 'suggestRemoveInvalidAria';
export const RULE_NAME = 'valid-aria';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        '[Accessibility] Ensures that correct ARIA attributes and respective values are used',
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      validAria: 'The `{{attribute}}` is an invalid ARIA attribute',
      validAriaValue:
        'The `{{attribute}}` has an invalid value. Check the valid values at https://raw.githack.com/w3c/aria/stable/#roles',
      suggestRemoveInvalidAria: 'Remove attribute `{{attribute}}`',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const domElements = [...getDomElements()];
    const uppercaseDomElements = domElements.map((element) =>
      element.toUpperCase(),
    );
    const elementNamePattern = toPattern([
      ...domElements,
      ...uppercaseDomElements,
    ]);

    return {
      [`Element[name=${elementNamePattern}] > :matches(BoundAttribute, TextAttribute)[name=/^aria-.+/]`](
        node: TmplAstBoundAttribute | TmplAstTextAttribute,
      ) {
        const { name: attribute, sourceSpan } = node;
        const ariaPropertyDefinition = aria.get(attribute as ARIAProperty);
        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        if (!ariaPropertyDefinition) {
          context.report({
            loc,
            messageId: 'validAria',
            data: { attribute },
            suggest: [
              {
                messageId: 'suggestRemoveInvalidAria',
                data: { attribute },
                fix: (fixer) =>
                  fixer.removeRange([
                    sourceSpan.start.offset - 1,
                    sourceSpan.end.offset,
                  ]),
              },
            ],
          });

          return;
        }

        const ast = extractASTFrom(node);

        if (
          canIgnoreNode(ast) ||
          isValidAriaPropertyValue(
            ariaPropertyDefinition,
            (ast as LiteralPrimitive | TmplAstTextAttribute).value,
          )
        ) {
          return;
        }

        context.report({
          loc,
          messageId: 'validAriaValue',
          data: { attribute },
        });
      },
    };
  },
});

function isLiteralCollection(ast: unknown): ast is LiteralArray | LiteralMap {
  return ast instanceof LiteralArray || ast instanceof LiteralMap;
}

function isPrimitive(
  ast: unknown,
): ast is LiteralPrimitive | TmplAstTextAttribute {
  return ast instanceof LiteralPrimitive || ast instanceof TmplAstTextAttribute;
}

function canIgnoreNode(ast: unknown): boolean {
  return !isLiteralCollection(ast) && !isPrimitive(ast);
}

function extractASTFrom(
  attribute: TmplAstBoundAttribute | TmplAstTextAttribute,
): AST | TmplAstBoundAttribute | TmplAstTextAttribute {
  return attribute instanceof TmplAstBoundAttribute &&
    attribute.value instanceof ASTWithSource
    ? attribute.value.ast
    : attribute;
}

function isBooleanLike(value: unknown): value is boolean | 'false' | 'true' {
  return typeof value === 'boolean' || value === 'false' || value === 'true';
}

function isInteger(value: unknown): boolean {
  return (
    !Number.isNaN(value) &&
    parseInt(Number(value) as unknown as string) == value &&
    !Number.isNaN(parseInt(value as string, 10))
  );
}

function isNumeric(value: unknown): boolean {
  return (
    !Number.isNaN(Number.parseFloat(value as string)) &&
    Number.isFinite(Number(value))
  );
}

function isNil(value: unknown): value is null | undefined {
  return value == null;
}

function isString(value: unknown): value is string {
  return typeof value == 'string';
}

function isMixed(value: unknown): value is 'mixed' {
  return isString(value) && value === 'mixed';
}

function isTristate(value: unknown): boolean {
  return isMixed(value) || isBooleanLike(value) || isNil(value);
}

function isValidAriaPropertyValue(
  { allowundefined, type, values }: ARIAPropertyDefinition,
  attributeValue: boolean | number | string | null | undefined,
): boolean {
  if (allowundefined && isNil(attributeValue)) return true;

  switch (type) {
    case 'boolean':
      return isBooleanLike(attributeValue);
    case 'tristate':
      return isTristate(attributeValue);
    case 'id':
    case 'idlist':
      return true;
    case 'integer':
      return isInteger(attributeValue);
    case 'number':
      return isNumeric(attributeValue);
    case 'string':
      return isString(attributeValue);
    case 'token':
    case 'tokenlist': {
      const parsedAttributeValue = isBooleanLike(attributeValue)
        ? JSON.parse(attributeValue as unknown as string)
        : attributeValue;
      return Boolean(values?.includes(parsedAttributeValue));
    }
  }
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    "ARIA (Accessible Rich Internet Applications) attributes must be valid and used correctly for screen readers to interpret them. Using invalid or misspelled ARIA attributes (like 'aria-labeledby' instead of 'aria-labelledby', or using ARIA attributes that don't exist) causes screen readers to ignore them, breaking accessibility. Each HTML element only supports specific ARIA attributes based on its role. Invalid ARIA is worse than no ARIA because it gives developers false confidence that they've made something accessible when they haven't. Use a reference like the ARIA specification or MDN to verify attribute names and valid usage.",
};
