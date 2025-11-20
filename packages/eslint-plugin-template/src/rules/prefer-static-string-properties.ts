import {
  TmplAstBoundAttribute,
  ASTWithSource,
  LiteralPrimitive,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'preferStaticStringProperties';
export const RULE_NAME = 'prefer-static-string-properties';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description:
        'Ensures that static string values use property assignment instead of property binding.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferStaticStringProperties:
        'Using a property is more efficient than binding a static string.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      ['BoundAttribute.inputs']({
        name,
        sourceSpan,
        keySpan,
        value,
      }: TmplAstBoundAttribute) {
        // Exclude @xxx (Animation) and xx.color
        // When attribute start with "*", keySpan details is null so *ngSwitchCase is excluded
        const isBindingProperty =
          keySpan?.details &&
          !keySpan.details.includes('@') &&
          !keySpan.details.includes('.');
        if (
          isBindingProperty &&
          value instanceof ASTWithSource &&
          value.ast instanceof LiteralPrimitive &&
          typeof value.ast.value === 'string'
        ) {
          // If the string literal is quoted with a double quote,
          // then the property binding must be using single quotes
          // to quote the value, and we should keep using single
          // quotes when we convert it to a property assignment.
          const quote = value.source?.trimStart().at(0) === '"' ? "'" : '"';
          const literal = value.ast.value;

          context.report({
            loc: parserServices.convertNodeSourceSpanToLoc(sourceSpan),
            messageId: 'preferStaticStringProperties',
            fix: (fixer) =>
              fixer.replaceTextRange(
                [sourceSpan.start.offset, sourceSpan.end.offset],
                `${name}=${quote}${literal}${quote}`,
              ),
          });
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'When binding a static string literal to a property, using attribute syntax (property="value") is more efficient and simpler than property binding syntax ([property]="\'value\'"). Property binding with a static string creates unnecessary overhead because Angular evaluates it as an expression during change detection, even though the value never changes. Attribute syntax makes it immediately clear that the value is static and will never be updated. For example, [alt]="\'Profile image\'" should be alt="Profile image". This rule helps identify performance opportunities and makes templates more readable by distinguishing truly dynamic bindings from static values. The rule excludes animation bindings (@xxx), style/class sub-properties (style.color), and structural directives (*ngIf) where property binding syntax is required.',
};
