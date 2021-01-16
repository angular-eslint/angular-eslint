import { aria, ARIAProperty, ARIAPropertyDefinition } from 'aria-query';
import {
  AST,
  ASTWithSource,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular/compiler';

import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds =
  | 'accessibilityValidAria'
  | 'accessibilityValidAriaValue';
export const RULE_NAME = 'accessibility-valid-aria';
const ARIA_PATTERN = /^aria-.*/;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that correct ARIA attributes and respective values are used',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      accessibilityValidAria:
        'The `{{attribute}}` is an invalid ARIA attribute',
      accessibilityValidAriaValue:
        'The `{{attribute}}` has an invalid value. Check the valid values at https://raw.githack.com/w3c/aria/stable/#roles',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      [`BoundAttribute[name=${ARIA_PATTERN}], TextAttribute[name=${ARIA_PATTERN}]`](
        astAttribute: TmplAstBoundAttribute | TmplAstTextAttribute,
      ) {
        const { name: attribute, sourceSpan } = astAttribute;
        const ariaPropertyDefinition = aria.get(attribute as ARIAProperty) as
          | ARIAPropertyDefinition
          | undefined;
        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        if (!ariaPropertyDefinition) {
          context.report({
            loc,
            messageId: 'accessibilityValidAria',
            data: { attribute },
          });

          return;
        }

        const ast = extractASTFrom(astAttribute);

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
          messageId: 'accessibilityValidAriaValue',
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
): AST | TmplAstTextAttribute {
  return attribute instanceof TmplAstBoundAttribute
    ? (attribute.value as ASTWithSource).ast
    : attribute;
}

function isBooleanLike(value: unknown): value is boolean | 'false' | 'true' {
  return typeof value === 'boolean' || value === 'false' || value === 'true';
}

function isInteger(value: unknown): boolean {
  return (
    !Number.isNaN(value) &&
    parseInt((Number(value) as unknown) as string) == value &&
    !Number.isNaN(parseInt(value as string, 10))
  );
}

function isNumeric(value: unknown): boolean {
  return (
    !Number.isNaN(Number.parseFloat(value as string)) &&
    Number.isFinite(value as number)
  );
}

function isNil(value: unknown): value is null | undefined {
  return value == null;
}

function isString(value: unknown): value is string {
  return typeof value == 'string';
}

function isValidAriaPropertyValue(
  { allowundefined, type, values }: ARIAPropertyDefinition,
  attributeValue: boolean | number | string,
): boolean {
  if (allowundefined && isNil(attributeValue)) return true;

  switch (type) {
    case 'boolean':
      return isBooleanLike(attributeValue);
    case 'tristate':
      return isBooleanLike(attributeValue) || isNil(attributeValue);
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
    case 'tokenlist':
      const parsedAttributeValue = isBooleanLike(attributeValue)
        ? JSON.parse((attributeValue as unknown) as string)
        : attributeValue;
      return Boolean(values?.includes(parsedAttributeValue));
  }
}
