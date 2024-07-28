import type {
  TmplAstTemplate,
  TmplAstTextAttribute,
  TmplAstBoundAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [{ readonly alias: readonly string[] }];
export type MessageIds = 'useTrackByFunction';
export const RULE_NAME = 'use-track-by-function';

const DEFAULT_ALIAS = [] as const;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures trackBy function is used',
    },
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useTrackByFunction: 'Missing trackBy function in ngFor directive',
    },
  },
  defaultOptions: [{ alias: DEFAULT_ALIAS }],
  create(context, [{ alias }]) {
    const isNgForTrackBy = isNgForTrackByFactory(alias);
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

const DEFAULT_NG_FOR_TRACK_BY_ATTRIBUTE_NAME = 'ngForTrackBy';

function isNgForTrackByFactory(alias: readonly string[]) {
  const names = [...alias, DEFAULT_NG_FOR_TRACK_BY_ATTRIBUTE_NAME];
  return (attribute: TmplAstBoundAttribute | TmplAstTextAttribute) =>
    names.includes(attribute.name);
}
