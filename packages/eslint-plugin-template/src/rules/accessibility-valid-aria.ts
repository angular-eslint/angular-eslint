import type { AST } from '@angular-eslint/bundled-angular-compiler';
import {
  ASTWithSource,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import type { ARIAProperty, ARIAPropertyDefinition } from 'aria-query';
import { aria } from 'aria-query';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { toPattern } from '../utils/to-pattern';

type Options = [];
export type MessageIds =
  | 'accessibilityValidAria'
  | 'accessibilityValidAriaValue'
  | 'suggestRemoveInvalidAria';
export const RULE_NAME = 'accessibility-valid-aria';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that correct ARIA attributes and respective values are used',
      recommended: false,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      accessibilityValidAria:
        'The `{{attribute}}` is an invalid ARIA attribute',
      accessibilityValidAriaValue:
        'The `{{attribute}}` has an invalid value. Check the valid values at https://raw.githack.com/w3c/aria/stable/#roles',
      suggestRemoveInvalidAria: 'Remove attribute `{{attribute}}`',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const elementNamePattern = toPattern([...getDomElements()]);

    return {
      [`Element$1[name=${elementNamePattern}] > :matches(BoundAttribute, TextAttribute)[name=/^aria-.+/]`](
        node: TmplAstBoundAttribute | TmplAstTextAttribute,
      ) {
        const { name: attribute, sourceSpan } = node;
        const ariaPropertyDefinition = aria.get(attribute as ARIAProperty);
        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        if (!ariaPropertyDefinition) {
          context.report({
            loc,
            messageId: 'accessibilityValidAria',
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
    case 'tokenlist': {
      const parsedAttributeValue = isBooleanLike(attributeValue)
        ? JSON.parse(attributeValue as unknown as string)
        : attributeValue;
      return Boolean(values?.includes(parsedAttributeValue));
    }
  }
}
