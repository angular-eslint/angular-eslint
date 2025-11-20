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
export type MessageIds =
  | 'missingAttribute'
  | 'invalidDoubleSource'
  | 'suggestReplaceWithNgSrc'
  | 'suggestRemoveSrc';
export const RULE_NAME = 'prefer-ngsrc';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures ngSrc is used instead of src for img elements',
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      missingAttribute:
        'The attribute [ngSrc] should be used for img elements instead of [src].',
      invalidDoubleSource:
        'Only [ngSrc] should exist on an img element. Delete the [src] attribute.',
      suggestReplaceWithNgSrc: 'Replace [src] with [ngSrc]',
      suggestRemoveSrc: 'Remove the [src] attribute',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const sourceCode = context.sourceCode;

    function reportMissingNgSrc(
      srcAttribute: TmplAstTextAttribute | TmplAstBoundAttribute,
    ) {
      const loc = parserServices.convertNodeSourceSpanToLoc(
        srcAttribute.sourceSpan,
      );

      context.report({
        loc,
        messageId: 'missingAttribute',
        suggest: [
          {
            messageId: 'suggestReplaceWithNgSrc',
            fix: (fixer) => {
              const originalAttribute = sourceCode
                .getText()
                .slice(
                  srcAttribute.sourceSpan.start.offset,
                  srcAttribute.sourceSpan.end.offset,
                );

              let updatedAttribute: string;
              if (originalAttribute.startsWith('[attr.src]')) {
                updatedAttribute = originalAttribute.replace(
                  /^\[attr\.src]/,
                  '[ngSrc]',
                );
              } else if (originalAttribute.startsWith('[src]')) {
                updatedAttribute = originalAttribute.replace(
                  /^\[src]/,
                  '[ngSrc]',
                );
              } else {
                updatedAttribute = originalAttribute.replace(/^src/, 'ngSrc');
              }

              return fixer.replaceTextRange(
                [
                  srcAttribute.sourceSpan.start.offset,
                  srcAttribute.sourceSpan.end.offset,
                ],
                updatedAttribute,
              );
            },
          },
        ],
      });
    }

    function reportDoubleSrc(
      srcAttribute: TmplAstTextAttribute | TmplAstBoundAttribute,
    ) {
      const loc = parserServices.convertNodeSourceSpanToLoc(
        srcAttribute.sourceSpan,
      );

      context.report({
        loc,
        messageId: 'invalidDoubleSource',
        suggest: [
          {
            messageId: 'suggestRemoveSrc',
            fix: (fixer) => {
              const fullText = sourceCode.getText();
              let startOffset = srcAttribute.sourceSpan.start.offset;

              // Move back to include preceding whitespace
              while (startOffset > 0 && /\s/.test(fullText[startOffset - 1])) {
                startOffset--;
              }

              return fixer.removeRange([
                startOffset,
                srcAttribute.sourceSpan.end.offset,
              ]);
            },
          },
        ],
      });
    }

    return {
      'Element[name=/^img$/i]'(element: TmplAstElement) {
        const ngSrcAttribute = getNgSrcAttribute(element);
        const srcAttribute = getNormalSrcAttribute(element);

        if (
          !srcAttribute ||
          (!ngSrcAttribute && isSrcBase64Image(srcAttribute))
        ) {
          return;
        }

        if (!ngSrcAttribute) {
          reportMissingNgSrc(srcAttribute);
        } else {
          reportDoubleSrc(srcAttribute);
        }
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

export const RULE_DOCS_EXTENSION = {
  rationale:
    "The ngSrc directive (part of Angular's Image directive introduced in v15) provides significant performance and user experience benefits over the standard src attribute for images. Using ngSrc enables automatic lazy loading, responsive images with srcset generation, optimized loading priority hints, prevention of layout shift by enforcing width and height attributes, and automatic image optimization when using an image loader. These features dramatically improve Largest Contentful Paint (LCP) and other Core Web Vitals metrics. The directive also provides warnings for common mistakes like missing width/height. The rule allows data: URIs with src since those are inline base64 images that don't benefit from ngSrc optimizations. For best performance and user experience, all external images should use ngSrc.",
};
