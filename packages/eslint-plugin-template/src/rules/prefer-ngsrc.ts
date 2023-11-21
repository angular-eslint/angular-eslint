import type {
  TmplAstBoundAttribute,
  TmplAstElement,
} from '@angular-eslint/bundled-angular-compiler';
import { TmplAstTextAttribute } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
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
      'Element$1[name=img]'(element: TmplAstElement) {
        const ngSrcAttribute = hasNgSrcAttribute(element);
        const srcAttribute = hasNormalSrcAttribute(element);

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

function hasNgSrcAttribute({
  inputs,
  attributes,
}: TmplAstElement): TmplAstTextAttribute | TmplAstBoundAttribute | undefined {
  return [...inputs, ...attributes].find(({ name }) => name === 'ngSrc');
}

function hasNormalSrcAttribute({
  inputs,
  attributes,
}: TmplAstElement): TmplAstTextAttribute | TmplAstBoundAttribute | undefined {
  return [...inputs, ...attributes].find(({ name }) => name === 'src');
}

// Adheres to angular's assertion that ngSrc value is not a data URL.
// https://github.com/angular/angular/blob/17.0.3/packages/common/src/directives/ng_optimized_image/ng_optimized_image.ts#L585
function isSrcBase64Image(
  attribute: TmplAstTextAttribute | TmplAstBoundAttribute,
) {
  if (attribute instanceof TmplAstTextAttribute) {
    return attribute.value.trim().startsWith('data:');
  }

  return false;
}
