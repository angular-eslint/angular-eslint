import type { TmplAstBoundAttribute } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];

export type MessageIds = 'preferStyleBinding';
export const RULE_NAME = 'prefer-style-binding';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Suggests using [style] bindings over ngStyle where applicable',
    },
    schema: [],
    messages: {
      preferStyleBinding:
        'Consider using [style] or [style.property] bindings instead of [ngStyle] where applicable.',
    },
    defaultOptions: [],
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'BoundAttribute[name="ngStyle"]'(node: TmplAstBoundAttribute) {
        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);
        context.report({
          messageId: 'preferStyleBinding',
          loc,
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'For simple cases, [style] and [style.property] bindings offer a more straightforward syntax with better performance than ngStyle, and the Angular style guide recommends them over the NgStyle directive. However, ngStyle should still be used when you need mutations on objects, as style bindings compare the bound object by reference and only apply updates when a new object instance is provided. Note that ngStyle also accepts unit suffixes on object keys (for example `{ "max-width.px": width }`), which [style] object bindings do not support; express these as [style.max-width.px] bindings instead. See https://angular.dev/style-guide#prefer-class-and-style-over-ngclass-and-ngstyle and https://angular.dev/guide/templates/binding#css-class-and-style-property-bindings for more information. This rule helps identify potential simplification opportunities but should be applied judiciously based on your specific needs.',
};
