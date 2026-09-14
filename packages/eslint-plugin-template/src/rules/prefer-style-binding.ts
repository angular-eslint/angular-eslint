import type {
  AST,
  ASTWithSource,
  TmplAstBoundAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import type { RuleFix, RuleFixer } from '@typescript-eslint/utils/ts-eslint';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  isStringLiteralPrimitive,
  isTemplateLiteral,
} from '../utils/literal-primitive';
import { unwrapParenthesizedExpression } from '../utils/unwrap-parenthesized-expression';

export type Options = [
  {
    readonly bindUnits?: boolean;
  },
];
const DEFAULT_OPTIONS: Options[number] = {
  bindUnits: false,
};

export type MessageIds = 'preferStyleBinding' | 'preferStyleUnitBinding';
export const RULE_NAME = 'prefer-style-binding';

const CSS_UNITS = [
  'px',
  'em',
  'rem',
  '%',
  'vh',
  'vw',
  'vmin',
  'vmax',
  'cm',
  'mm',
  'in',
  'pt',
  'pc',
  'ex',
  'ch',
  'fr',
  'deg',
  'rad',
  'grad',
  'turn',
  's',
  'ms',
  'Hz',
  'kHz',
  'dpi',
  'dpcm',
  'dppx',
  'cap',
  'ic',
  'lh',
  'rlh',
  'vi',
  'vb',
  'svw',
  'svh',
  'lvw',
  'lvh',
  'dvw',
  'dvh',
  'cqw',
  'cqh',
  'cqi',
  'cqb',
  'cqmin',
  'cqmax',
  'svmin',
  'svmax',
  'lvmin',
  'lvmax',
  'dvmin',
  'dvmax',
] as const;
const CSS_UNITS_PATTERN = CSS_UNITS.join('|');
const NUMBER_WITH_UNIT = new RegExp(
  '^(?<value>-?\\d+(?:\\.\\d+)?)(?<unit>' + CSS_UNITS_PATTERN + ')$',
);
const UNIT_ONLY = new RegExp('^(?:' + CSS_UNITS_PATTERN + ')$');

const STYLE_KEY_PREFIX = 'style.';

interface UnitBinding {
  readonly unit: string;
  /** `null` when the expression cannot be recovered verbatim, so no fix is offered. */
  readonly value: string | null;
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Suggests using [style] bindings over ngStyle where applicable',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          bindUnits: {
            type: 'boolean',
            description:
              'Whether to also report `[style.property]` bindings whose bound value embeds the CSS unit, such as `[style.width]="\'30px\'"` or a template literal interpolating a single expression before the unit, which are better expressed with the unit in the binding name (e.g. `[style.width.px]="30"`).',
            default: DEFAULT_OPTIONS.bindUnits,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferStyleBinding:
        'Consider using [style] or [style.property] bindings instead of [ngStyle] where applicable.',
      preferStyleUnitBinding:
        'Consider using [style.{{property}}.{{unit}}] instead of embedding the unit in the bound value.',
    },
    defaultOptions: [DEFAULT_OPTIONS],
  },
  create(context, [{ bindUnits }]) {
    const parserServices = getTemplateParserServices(context);
    // Angular hoists the inputs of an element carrying a structural directive
    // onto the wrapping `Template` node, reusing the same node instances, so
    // every binding on such an element is visited twice.
    const alreadyReported = new Set<string>();
    const isFirstReportFor = (
      messageId: MessageIds,
      { sourceSpan }: TmplAstBoundAttribute,
    ): boolean => {
      const key = `${messageId}:${sourceSpan.start.offset}`;
      if (alreadyReported.has(key)) {
        return false;
      }
      alreadyReported.add(key);
      return true;
    };

    return {
      'BoundAttribute[name="ngStyle"]'(node: TmplAstBoundAttribute) {
        if (!isFirstReportFor('preferStyleBinding', node)) {
          return;
        }

        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);
        context.report({
          messageId: 'preferStyleBinding',
          loc,
        });
      },
      BoundAttribute(node: TmplAstBoundAttribute) {
        if (!bindUnits) {
          return;
        }

        const property = getStyleProperty(node);
        if (!property) {
          return;
        }

        const unitBinding = getUnitBinding(node, context.sourceCode.text);
        if (!unitBinding || !isFirstReportFor('preferStyleUnitBinding', node)) {
          return;
        }

        context.report({
          messageId: 'preferStyleUnitBinding',
          loc: parserServices.convertNodeSourceSpanToLoc(node.sourceSpan),
          data: {
            property,
            unit: unitBinding.unit,
          },
          fix: (fixer) => createUnitBindingFix(fixer, node, unitBinding),
        });
      },
    };
  },
});

/**
 * `keySpan.details` is preferred over `node.name`, which Angular rewrites for
 * custom properties (`--gap` becomes `--%NS%gap`), and over `__originalType`,
 * which the hoisting described above overwrites.
 */
function getStyleProperty(node: TmplAstBoundAttribute): string | null {
  const details = node.keySpan?.details;
  if (node.unit || !details?.startsWith(STYLE_KEY_PREFIX)) {
    return null;
  }
  return details.slice(STYLE_KEY_PREFIX.length) || null;
}

function getUnitBinding(
  node: TmplAstBoundAttribute,
  templateText: string,
): UnitBinding | null {
  const withSource = asASTWithSource(node.value);
  const value = unwrapParenthesizedExpression(withSource?.ast ?? node.value);

  if (isStringLiteralPrimitive(value)) {
    const groups = NUMBER_WITH_UNIT.exec(value.value)?.groups;
    return groups?.['unit'] && groups['value']
      ? { unit: groups['unit'], value: groups['value'] }
      : null;
  }

  if (isTemplateLiteral(value)) {
    const { elements, expressions } = value;
    // Only `` `${expression}unit` `` can be expressed as a unit binding.
    if (
      expressions.length !== 1 ||
      elements.length !== 2 ||
      elements[0].text !== '' ||
      !UNIT_ONLY.test(elements[1].text)
    ) {
      return null;
    }

    const { sourceSpan } = expressions[0];
    return {
      unit: elements[1].text,
      value: hasVerbatimSource(node, withSource, templateText)
        ? templateText.slice(sourceSpan.start, sourceSpan.end)
        : null,
    };
  }

  return null;
}

/**
 * Angular parses attribute values after decoding HTML entities, so expression
 * source spans index the decoded value, not the raw template.
 */
function hasVerbatimSource(
  { valueSpan }: TmplAstBoundAttribute,
  withSource: ASTWithSource | null,
  templateText: string,
): boolean {
  return (
    !!valueSpan &&
    templateText.slice(valueSpan.start.offset, valueSpan.end.offset) ===
      withSource?.source
  );
}

function asASTWithSource(value: AST): ASTWithSource | null {
  return 'ast' in value && 'source' in value ? (value as ASTWithSource) : null;
}

function createUnitBindingFix(
  fixer: RuleFixer,
  node: TmplAstBoundAttribute,
  { unit, value }: UnitBinding,
): RuleFix[] | null {
  const { keySpan, valueSpan } = node;
  if (!valueSpan || value === null) {
    return null;
  }

  return [
    fixer.insertTextAfterRange(
      [keySpan.start.offset, keySpan.end.offset],
      `.${unit}`,
    ),
    fixer.replaceTextRange(
      [valueSpan.start.offset, valueSpan.end.offset],
      value,
    ),
  ];
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    'For simple cases, [style] and [style.property] bindings offer a more straightforward syntax with better performance than ngStyle, and the Angular style guide recommends them over the NgStyle directive. However, ngStyle should still be used when you need mutations on objects, as style bindings compare the bound object by reference and only apply updates when a new object instance is provided. Note that ngStyle also accepts unit suffixes on object keys (for example `{ "max-width.px": width }`), which [style] object bindings do not support; express these as [style.max-width.px] bindings instead. See https://angular.dev/style-guide#prefer-class-and-style-over-ngclass-and-ngstyle and https://angular.dev/guide/templates/binding#css-class-and-style-property-bindings for more information. This rule helps identify potential simplification opportunities but should be applied judiciously based on your specific needs. The opt-in `bindUnits` option additionally flags `[style.property]` bindings that embed the CSS unit in the bound value, such as `[style.width]="\'30px\'"` or a template literal interpolating a single expression before the unit, which Angular can express as `[style.property.unit]` bindings instead, avoiding the string concatenation on every change detection cycle.',
};
