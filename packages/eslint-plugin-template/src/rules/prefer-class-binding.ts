import type { TmplAstBoundAttribute } from '@angular-eslint/bundled-angular-compiler';
import {
  ASTWithSource,
  Lexer,
  LiteralMap,
  Parser,
} from '@angular-eslint/bundled-angular-compiler';
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
      description:
        'Suggests using [class] bindings over ngClass where applicable',
    },
    schema: [],
    messages: {
      preferClassBinding:
        'Consider using [class] bindings instead of [ngClass] where applicable.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'BoundAttribute[name="ngClass"]'(
        node: TmplAstBoundAttribute & { value?: ASTWithSource },
      ) {
        // Skip if ngClass is necessary (e.g., uses space-separated class names)
        if (requiresNgClass(node)) {
          return;
        }

        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);
        context.report({
          messageId: 'preferClassBinding',
          loc,
        });
      },
    };
  },
});

let parser: Parser | null = null;

/**
 * Instantiate the `Parser` class lazily only when this rule is applied.
 */
function getParser(): Parser {
  return parser || (parser = new Parser(new Lexer()));
}

/**
 * Checks if a string contains space-separated class names
 */
function hasSpaceSeparatedClasses(str: string): boolean {
  return /\s/.test(str.trim());
}

/**
 * Checks if the ngClass binding uses features that class bindings don't support:
 * - Object keys with space-separated class names
 */
function requiresNgClass(
  node: TmplAstBoundAttribute & { value?: ASTWithSource },
): boolean {
  // Check if we have a value with source code
  if (!node.value?.source || !node.valueSpan) {
    return false;
  }

  // Parse the binding to get the AST
  const parsedAst = getParser().parseBinding(
    node.value.source,
    node.valueSpan,
    0,
  ).ast;

  if (parsedAst instanceof LiteralMap) {
    for (const astKey of parsedAst.keys) {
      // Skip spread keys as they don't have a key property
      if (astKey.kind === 'spread') {
        continue;
      }
      const className = astKey.key;
      if (
        typeof className === 'string' &&
        hasSpaceSeparatedClasses(className)
      ) {
        return true;
      }
    }
  }

  return false;
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    'For simple cases, [class] bindings offer a more straightforward syntax with better performance than ngClass. However, ngClass should still be used when you need: (1) space-separated class names in a single key, or (2) mutations on objects, as class bindings do not support these use cases (the reference must change for class bindings to detect updates). See https://angular.dev/guide/templates/binding#css-class-and-style-property-bindings for more information. This rule helps identify potential simplification opportunities but should be applied judiciously based on your specific needs.',
};
