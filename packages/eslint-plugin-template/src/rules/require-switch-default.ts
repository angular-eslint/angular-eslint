import type { TmplAstSwitchBlock } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'requireSwitchDefault';
export const RULE_NAME = 'require-switch-default';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Requires a `@default` block on every `@switch` to ensure all cases are handled. This is the template equivalent of the `@typescript-eslint/switch-exhaustiveness-check` rule.',
    },
    schema: [],
    messages: {
      requireSwitchDefault:
        'Switch should have a default block. Add `@default { ... }`, or `@default never` to enforce a compile-time exhaustive switch.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      SwitchBlock({ exhaustiveCheck, groups, nameSpan }: TmplAstSwitchBlock) {
        if (exhaustiveCheck) {
          return;
        }

        const hasDefaultCase = groups.some(({ cases }) =>
          cases.some(({ expression }) => expression === null),
        );

        if (hasDefaultCase) {
          return;
        }

        context.report({
          loc: parserServices.convertNodeSourceSpanToLoc(nameSpan),
          messageId: 'requireSwitchDefault',
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    "A `@switch` without a `@default` silently renders nothing when the value matches none of the `@case` branches, which is rarely intended and easy to miss. Because Angular templates are not type-checked the way TypeScript code is, the linter cannot determine whether the listed cases are exhaustive over a union or enum. Requiring an explicit `@default` block ensures unhandled values are always accounted for. For genuine compile-time exhaustiveness over a union or enum, use Angular's `@default never` form, which fails the template type-check if any case is missing.",
};
