import {
  Node,
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
  TmplAstIfBlock,
  TmplAstForLoopBlock,
  TmplAstSwitchBlock,
  TmplAstSwitchBlockCase,
  ParseSourceSpan,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [
  { maxComplexity?: number; variant?: 'classic' | 'modified' },
];
export type MessageIds = 'cyclomaticComplexity';
export const RULE_NAME = 'cyclomatic-complexity';

const DEFAULT_OPTIONS = {
  maxComplexity: 5,
  variant: 'classic',
} as const satisfies Options[number];

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Checks cyclomatic complexity against a specified limit. It is a quantitative measure of the number of linearly independent paths through a program's source code`,
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxComplexity: {
            type: 'number',
            minimum: 1,
          },
          variant: {
            type: 'string',
            enum: ['classic', 'modified'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      cyclomaticComplexity:
        'The cyclomatic complexity {{totalComplexity}} exceeds the defined limit {{maxComplexity}}',
    },
  },
  defaultOptions: [
    {
      maxComplexity: DEFAULT_OPTIONS.maxComplexity,
      variant: DEFAULT_OPTIONS.variant,
    },
  ],
  create(
    context,
    [
      {
        maxComplexity = DEFAULT_OPTIONS.maxComplexity,
        variant = DEFAULT_OPTIONS.variant,
      },
    ],
  ) {
    let totalComplexity = 0;
    const parserServices = getTemplateParserServices(context);

    function increment(node: { sourceSpan: ParseSourceSpan }): void {
      totalComplexity += 1;

      if (totalComplexity <= maxComplexity) return;

      const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);

      context.report({
        messageId: 'cyclomaticComplexity',
        loc,
        data: { maxComplexity, totalComplexity },
      });
    }

    const isModified = variant === 'modified';

    // Checks *ngIf, *ngFor, and *ngSwitchCase ('classic' variant) or *ngSwitch ('modified' variant)
    function isLegacyStructuralDirective(node: Node): boolean {
      const legacyStructuralDirectiveRegex = isModified
        ? /^(ngForOf|ngIf|ngSwitch)$/
        : /^(ngForOf|ngIf|ngSwitchCase)$/;

      return (
        node instanceof TmplAstBoundAttribute &&
        legacyStructuralDirectiveRegex.test(node.name)
      );
    }

    // Checks *ngSwitchDefault ('classic' variant)
    function isLegacySwitchDefault(node: Node): boolean {
      return (
        !isModified &&
        node instanceof TmplAstTextAttribute &&
        node.name === 'ngSwitchDefault'
      );
    }

    // Checks @if and @for
    function isControlFlowBlock(node: Node): boolean {
      return (
        node instanceof TmplAstIfBlock || node instanceof TmplAstForLoopBlock
      );
    }

    // Checks @switch ('modified' variant) or @switchCase ('classic' variant)
    function isSwitchComplexity(node: Node): boolean {
      return isModified
        ? node instanceof TmplAstSwitchBlock
        : node instanceof TmplAstSwitchBlockCase;
    }

    return {
      '*': (node: Node) => {
        if (
          isLegacyStructuralDirective(node) ||
          isLegacySwitchDefault(node) ||
          isControlFlowBlock(node) ||
          isSwitchComplexity(node)
        ) {
          increment(node);
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Cyclomatic complexity measures the number of independent paths through code by counting control flow statements (if, for, while, etc.). High complexity in templates indicates too much logic in the template, making it hard to read, test, and maintain. Templates with high complexity often contain nested *ngIf/*ngFor combinations, complex ternary expressions, or multiple structural directives. This logic should be moved to the component class or into separate components. Component classes can be unit tested, but template logic is harder to test and reason about. Breaking complex templates into smaller, focused components also improves reusability and follows the single responsibility principle.',
};
