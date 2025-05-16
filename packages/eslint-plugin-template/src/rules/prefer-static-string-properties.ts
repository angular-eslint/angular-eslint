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
