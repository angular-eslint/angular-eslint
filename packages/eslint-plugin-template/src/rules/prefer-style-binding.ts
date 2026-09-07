import type { TmplAstBoundAttribute } from '@angular-eslint/bundled-angular-compiler';
import {
  ASTWithSource,
  BindingType,
  LiteralPrimitive,
  TemplateLiteral,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import type { RuleFix, RuleFixer } from '@typescript-eslint/utils/ts-eslint';
import { createESLintRule } from '../utils/create-eslint-rule';

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
/** A static CSS value made of a number immediately followed by a unit, e.g. `30px`. */
const NUMBER_WITH_UNIT = new RegExp(
  '^(?<value>-?\\d+(?:\\.\\d+)?)(?<unit>' + CSS_UNITS_PATTERN + ')$',
);
const UNIT_ONLY = new RegExp('^(?:' + CSS_UNITS_PATTERN + ')$');

type BoundAttributeWithOriginalType = TmplAstBoundAttribute & {
  readonly __originalType?: BindingType;
};

interface UnitBinding {
  readonly unit: string;
  readonly value: string;
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

    return {
      'BoundAttribute[name="ngStyle"]'(node: TmplAstBoundAttribute) {
        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);
        context.report({
          messageId: 'preferStyleBinding',
          loc,
        });
      },
      BoundAttribute(node: BoundAttributeWithOriginalType) {
        if (!bindUnits || !isUnitlessStyleBinding(node)) {
          return;
        }

        const unitBinding = getUnitBinding(node, context.sourceCode.text);
        if (!unitBinding) {
          return;
        }

        context.report({
          messageId: 'preferStyleUnitBinding',
          loc: parserServices.convertNodeSourceSpanToLoc(node.sourceSpan),
          data: {
            property: node.name,
            unit: unitBinding.unit,
          },
          fix: (fixer) => createUnitBindingFix(fixer, node, unitBinding),
        });
      },
    };
  },
});

function isUnitlessStyleBinding(node: BoundAttributeWithOriginalType): boolean {
  const { __originalType: originalType, type } = node;
  return (originalType ?? type) === BindingType.Style && !node.unit;
}

function getUnitBinding(
  node: TmplAstBoundAttribute,
  templateText: string,
): UnitBinding | null {
  const value =
    node.value instanceof ASTWithSource ? node.value.ast : node.value;

  if (value instanceof LiteralPrimitive) {
    if (typeof value.value !== 'string') {
      return null;
    }
    const groups = NUMBER_WITH_UNIT.exec(value.value)?.groups;
    return groups?.['unit'] && groups['value']
      ? { unit: groups['unit'], value: groups['value'] }
      : null;
  }

  if (value instanceof TemplateLiteral) {
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
      value: templateText.slice(sourceSpan.start, sourceSpan.end),
    };
  }

  return null;
}

function createUnitBindingFix(
  fixer: RuleFixer,
  node: TmplAstBoundAttribute,
  { unit, value }: UnitBinding,
): RuleFix[] | null {
  const { keySpan, valueSpan } = node;
  if (!valueSpan) {
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
