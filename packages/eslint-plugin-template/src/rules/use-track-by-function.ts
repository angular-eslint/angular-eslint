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
      description: 'Ensures trackBy function is used.',
      category: 'Best Practices',
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

    return parserServices.defineTemplateBodyVisitor({
      ['BoundAttribute.inputs[name="ngForOf"]'](node: any) {
        if (
          node.parent.inputs.some(
            (attr: { type: string; name: string }) =>
              attr.type === 'BoundAttribute' && attr.name === 'ngForTrackBy',
          )
        ) {
          return;
        }
        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);
        context.report({
          messageId: 'useTrackByFunction',
          loc,
        });
      },
      ['BoundAttribute.templateAttrs[name="ngForOf"]'](node: any) {
        const attrs = node.parent.templateAttrs;
        if (
          attrs.some(
            (attr: { type: string; name: string }) =>
              attr.type === 'BoundAttribute' && attr.name === 'ngForTrackBy',
          )
        ) {
          return;
        }
        const start = parserServices.convertNodeSourceSpanToLoc(
          attrs[0].sourceSpan,
        ).start;
        const end = parserServices.convertNodeSourceSpanToLoc(
          attrs[attrs.length - 1].sourceSpan,
        ).end;
        const loc = {
          start: {
            ...start,
            column: start.column - 1,
          },
          end: {
            ...end,
            column: end.column + 1,
          },
        };
        context.report({
          messageId: 'useTrackByFunction',
          loc,
        });
      },
    });
  },
});
