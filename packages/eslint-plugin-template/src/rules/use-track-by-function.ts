import type {
  TmplAstTemplate,
  TmplAstTextAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import { TmplAstBoundAttribute } from '@angular-eslint/bundled-angular-compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'useTrackByFunction';
export const RULE_NAME = 'use-track-by-function';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures trackBy function is used',
      recommended: false,
    },
    schema: [],
    messages: {
      useTrackByFunction: 'Missing trackBy function in ngFor directive',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'BoundAttribute.inputs[name="ngForOf"]'({
        parent: { inputs },
        sourceSpan,
      }: TmplAstBoundAttribute & { parent: TmplAstTemplate }) {
        if (inputs.some(isNgForTrackBy)) {
          return;
        }
        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);
        context.report({
          messageId: 'useTrackByFunction',
          loc,
        });
      },
      'BoundAttribute.templateAttrs[name="ngForOf"]'({
        parent: { templateAttrs },
      }: TmplAstBoundAttribute & { parent: TmplAstTemplate }) {
        if (templateAttrs.some(isNgForTrackBy)) {
          return;
        }
        const { start } = parserServices.convertNodeSourceSpanToLoc(
          templateAttrs[0].sourceSpan,
        );
        const { end } = parserServices.convertNodeSourceSpanToLoc(
          templateAttrs[templateAttrs.length - 1].sourceSpan,
        );
        const loc = {
          start: {
            ...start,
            column: start.column - 1,
          },
          end: {
            ...end,
            column: end.column + 1,
          },
        } as const;
        context.report({
          messageId: 'useTrackByFunction',
          loc,
        });
      },
    };
  },
});

function isNgForTrackBy(
  attribute: TmplAstBoundAttribute | TmplAstTextAttribute,
): attribute is TmplAstBoundAttribute & { name: 'ngForTrackBy' } {
  return (
    attribute instanceof TmplAstBoundAttribute &&
    attribute.name === 'ngForTrackBy'
  );
}
