import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import {
  TmplAstTextAttribute,
  TmplAstBoundAttribute,
  LiteralPrimitive,
  Binary,
  ASTWithSource,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'missingAttribute' | 'invalidDoubleSource';
export const RULE_NAME = 'prefer-ngsrc';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures ngSrc is used instead of src for img elements',
    },
    schema: [],
    messages: {
      missingAttribute:
        'The attribute [ngSrc] should be used for img elements instead of [src].',
      invalidDoubleSource:
        'Only [ngSrc] should exist on an img element. Delete the [src] attribute.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'Element[name=img]'(element: TmplAstElement) {
        const ngSrcAttribute = getNgSrcAttribute(element);
        const srcAttribute = getNormalSrcAttribute(element);

        if (
          !srcAttribute ||
          (!ngSrcAttribute && isSrcBase64Image(srcAttribute))
        ) {
          return;
        }

        const loc = parserServices.convertNodeSourceSpanToLoc(
          srcAttribute.sourceSpan,
        );

        context.report({
          loc,
          messageId: !ngSrcAttribute
            ? 'missingAttribute'
            : 'invalidDoubleSource',
        });
      },
    };
  },
});

function getNgSrcAttribute({
  inputs,
  attributes,
}: TmplAstElement): TmplAstTextAttribute | TmplAstBoundAttribute | undefined {
  return [...inputs, ...attributes].find(({ name }) => name === 'ngSrc');
}

function getNormalSrcAttribute({
  inputs,
  attributes,
}: TmplAstElement): TmplAstTextAttribute | TmplAstBoundAttribute | undefined {
  return [...inputs, ...attributes].find(({ name }) => name === 'src');
}

// Adheres to angular's assertion that ngSrc value is not a data URL.
// https://github.com/angular/angular/blob/17.0.3/packages/common/src/directives/ng_optimized_image/ng_optimized_image.ts#L585
function isSrcBase64Image(
  attribute: TmplAstTextAttribute | TmplAstBoundAttribute,
): boolean {
  const isPlainDataAttribute =
    attribute instanceof TmplAstTextAttribute &&
    attribute.value.trim().startsWith('data:');
  if (isPlainDataAttribute) {
    return true;
  }

  const isBoundDataAttribute =
    attribute.value instanceof ASTWithSource &&
    isDataStringPrimitive(attribute.value.ast);

  if (isBoundDataAttribute) {
    return true;
  }

  const isBoundDataInExpression =
    attribute.value instanceof ASTWithSource &&
    attribute.value.ast instanceof Binary &&
    attribute.value.ast.operation === '+' &&
    isDataStringPrimitive(attribute.value.ast.left);

  return isBoundDataInExpression;
}

function isDataStringPrimitive(primitive: unknown): boolean {
  return (
    primitive instanceof LiteralPrimitive &&
    typeof primitive.value === 'string' &&
    primitive.value.trim().startsWith('data:')
  );
}
