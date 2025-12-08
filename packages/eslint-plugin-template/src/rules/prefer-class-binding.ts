import type { TmplAstBoundAttribute } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];

export type MessageIds = 'preferClassBinding';
export const RULE_NAME = 'prefer-class-binding';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows the use of ngClass in HTML templates',
      recommended: 'recommended',
    },
    schema: [],
    messages: {
      preferClassBinding: 'Use [class] bindings instead of [ngClass].',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'BoundAttribute[name="ngClass"]'({ sourceSpan }: TmplAstBoundAttribute) {
        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);
        context.report({
          messageId: 'preferClassBinding',
          loc,
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "The ngClass directive is under soft deprecation in Angular. The Angular style guide recommends using [class] bindings directly instead of [ngClass] for better performance and simpler syntax. Modern [class] binding supports objects, arrays, and strings just like ngClass, but with better type safety and less overhead. Using [class] binding also aligns with Angular's direction toward simpler, more performant APIs. While ngClass remains supported for backward compatibility, new code should use [class] binding for consistency with Angular best practices.",
};
