import type {
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstElement,
  TmplAstNode,
  TmplAstReference,
  TmplAstTextAttribute,
  TmplAstVariable,
} from '@angular-eslint/bundled-angular-compiler';
import {
  ParseSourceSpan,
  TmplAstTemplate,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export enum OrderType {
  TemplateReferenceVariable = 'TEMPLATE_REFERENCE',
  StructuralDirective = 'STRUCTURAL_DIRECTIVE',
  AttributeBinding = 'ATTRIBUTE_BINDING',
  InputBinding = 'INPUT_BINDING',
  OutputBinding = 'OUTPUT_BINDING',
  TwoWayBinding = 'TWO_WAY_BINDING',
}

type Options = [
  {
    readonly alphabetical: boolean;
    readonly order: readonly OrderType[];
  },
];

type HasOrderType<Type extends OrderType> = Readonly<{
  orderType: Type;
}>;

interface HasTemplateParent {
  parent: TmplAstTemplate;
}

type ExtendedTmplAstBoundAttribute = TmplAstBoundAttribute &
  HasOrderType<
    | OrderType.InputBinding
    | OrderType.TwoWayBinding
    | OrderType.StructuralDirective
  >;
type ExtendedTmplAstBoundEvent = TmplAstBoundEvent &
  HasOrderType<OrderType.OutputBinding>;
type ExtendedTmplAstTextAttribute = TmplAstTextAttribute &
  HasOrderType<OrderType.AttributeBinding | OrderType.StructuralDirective>;
type ExtendedTmplAstReference = TmplAstReference &
  HasOrderType<OrderType.TemplateReferenceVariable>;
type ExtendedTmplAstElement = TmplAstElement & HasTemplateParent;
type ExtendedAttribute =
  | ExtendedTmplAstBoundAttribute
  | ExtendedTmplAstBoundEvent
  | ExtendedTmplAstTextAttribute
  | ExtendedTmplAstReference;

export type MessageIds = 'attributesOrder';
export const RULE_NAME = 'attributes-order';

const DEFAULT_ORDER = [
  OrderType.StructuralDirective,
  OrderType.TemplateReferenceVariable,
  OrderType.AttributeBinding,
  OrderType.InputBinding,
  OrderType.TwoWayBinding,
  OrderType.OutputBinding,
];

const DEFAULT_OPTIONS: Options[number] = {
  alphabetical: false,
  order: [...DEFAULT_ORDER],
};

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description:
        'Ensures that HTML attributes and Angular bindings are sorted based on an expected order',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          alphabetical: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.alphabetical,
          },
          order: {
            type: 'array',
            items: {
              type: 'string',
              enum: DEFAULT_OPTIONS.order as string[],
            },
            default: DEFAULT_OPTIONS.order as string[],
            minItems: DEFAULT_OPTIONS.order.length,
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      attributesOrder: `The element's attributes/bindings did not match the expected order: expected {{expected}} instead of {{actual}}`,
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, [{ alphabetical, order }]) {
    const parserServices = getTemplateParserServices(context);

    function getLocation(attr: ExtendedAttribute): TSESTree.SourceLocation {
      const loc = parserServices.convertNodeSourceSpanToLoc(attr.sourceSpan);

      switch (attr.orderType) {
        case OrderType.StructuralDirective:
          return {
            start: {
              line: loc.start.line,
              column: loc.start.column - 1,
            },
            end: {
              line: loc.end.line,
              column:
                loc.end.column + (isValuelessStructuralDirective(attr) ? 0 : 1),
            },
          };
        default:
          return loc;
      }
    }

    return {
      ['Element$1, Template'](node: ExtendedTmplAstElement | TmplAstTemplate) {
        if (isImplicitTemplate(node)) {
          return;
        }

        const { attributes, inputs, outputs, references } = node;
        const { extractedBananaBoxes, extractedInputs, extractedOutputs } =
          normalizeInputsOutputs(
            inputs.map(toInputBindingOrderType),
            outputs.map(toOutputBindingOrderType),
          );
        const allAttributes = [
          ...extractTemplateAttrs(node),
          ...attributes.map(toAttributeBindingOrderType),
          ...references.map(toTemplateReferenceVariableOrderType),
          ...extractedBananaBoxes,
          ...extractedInputs,
          ...extractedOutputs,
        ] as const;

        if (allAttributes.length < 2) {
          return;
        }

        const sortedAttributes = [...allAttributes].sort(byLocation);

        const expectedAttributes = [...allAttributes].sort(
          byOrder(order, alphabetical),
        );

        let errorRange: [number, number] | undefined;

        for (let i = 0; i < sortedAttributes.length; i++) {
          if (sortedAttributes[i] !== expectedAttributes[i]) {
            errorRange = [errorRange?.[0] ?? i, i];
          }
        }

        if (errorRange) {
          const [startIndex, endIndex] = errorRange;
          const sourceCode = context.getSourceCode();

          const { start } = getLocation(sortedAttributes[startIndex]);
          const { end } = getLocation(sortedAttributes[endIndex]);
          const loc = { start, end };

          const range = [
            getStartPos(sortedAttributes[startIndex]),
            getEndPos(sortedAttributes[endIndex]),
          ] as const;

          let replacementText = '';
          let lastPos = range[0];
          for (let i = startIndex; i <= endIndex; i++) {
            const oldAttr = sortedAttributes[i];
            const oldStart = getStartPos(oldAttr);
            const oldEnd = getEndPos(oldAttr);
            const newAttr = expectedAttributes[i];
            const newStart = getStartPos(newAttr);
            const newEnd = getEndPos(newAttr);

            replacementText += sourceCode.text.slice(lastPos, oldStart);
            replacementText += sourceCode.text.slice(newStart, newEnd);

            lastPos = oldEnd;
          }

          context.report({
            loc,
            messageId: 'attributesOrder',
            data: {
              expected: expectedAttributes
                .slice(startIndex, endIndex + 1)
                .map((a) => `\`${getMessageName(a)}\``)
                .join(', '),
              actual: sortedAttributes
                .slice(startIndex, endIndex + 1)
                .map((a) => `\`${getMessageName(a)}\``)
                .join(', '),
            },
            fix: (fixer) => fixer.replaceTextRange(range, replacementText),
          });
        }
      },
    };
  },
});

function byLocation(one: ExtendedAttribute, other: ExtendedAttribute) {
  return one.sourceSpan.start.line === other.sourceSpan.start.line
    ? one.sourceSpan.start.col - other.sourceSpan.start.col
    : one.sourceSpan.start.line - other.sourceSpan.start.line;
}

function byOrder(order: readonly OrderType[], alphabetical: boolean) {
  return function (one: ExtendedAttribute, other: ExtendedAttribute) {
    const orderComparison =
      getOrderIndex(one, order) - getOrderIndex(other, order);

    if (alphabetical && orderComparison === 0) {
      const oneName = one.keySpan?.details ?? one.name;
      const oneNormalised = oneName.replace(/^i18n-/, '');
      const otherName = other.keySpan?.details ?? other.name;
      const otherNormalised = otherName.replace(/^i18n-/, '');

      if (oneNormalised === otherNormalised) {
        return /^i18n-/.test(oneName) ? 1 : -1;
      }

      return oneNormalised > otherNormalised ? 1 : -1;
    }

    return orderComparison;
  };
}

function getOrderIndex(attr: ExtendedAttribute, order: readonly OrderType[]) {
  return order.indexOf(attr.orderType);
}

function toAttributeBindingOrderType(
  attribute: TmplAstTextAttribute | TmplAstVariable,
) {
  return {
    ...attribute,
    orderType: OrderType.AttributeBinding,
  } as ExtendedTmplAstTextAttribute;
}
function toInputBindingOrderType(input: TmplAstBoundAttribute) {
  return {
    ...input,
    orderType: OrderType.InputBinding,
  } as ExtendedTmplAstBoundAttribute;
}
function toStructuralDirectiveOrderType(
  attributeOrInput: TmplAstBoundAttribute | TmplAstTextAttribute,
) {
  return {
    ...attributeOrInput,
    orderType: OrderType.StructuralDirective,
  } as ExtendedTmplAstBoundAttribute | ExtendedTmplAstTextAttribute;
}
function toOutputBindingOrderType(output: TmplAstBoundEvent) {
  return {
    ...output,
    orderType: OrderType.OutputBinding,
  } as ExtendedTmplAstBoundEvent;
}
function toTwoWayBindingOrderType(output: TmplAstBoundAttribute) {
  return {
    ...output,
    orderType: OrderType.TwoWayBinding,
  } as ExtendedTmplAstBoundAttribute;
}
function toTemplateReferenceVariableOrderType(reference: TmplAstReference) {
  return {
    ...reference,
    orderType: OrderType.TemplateReferenceVariable,
  } as ExtendedTmplAstReference;
}

function isImplicitTemplate(
  node: TmplAstNode,
): node is TmplAstTemplate & { tagName: null } {
  return isTmplAstTemplate(node) && node.tagName !== 'ng-template';
}

function extractTemplateAttrs(
  node: ExtendedTmplAstElement | TmplAstTemplate,
): (ExtendedTmplAstBoundAttribute | ExtendedTmplAstTextAttribute)[] {
  if (isTmplAstTemplate(node)) {
    return node.templateAttrs.map(toStructuralDirectiveOrderType).concat(
      node.variables.map((x) => {
        return {
          ...toAttributeBindingOrderType(x),
          // `let-` is excluded from the keySpan and name - add it back in
          keySpan: new ParseSourceSpan(
            x.keySpan.start.moveBy(-4),
            x.keySpan.end,
          ),
          name: 'let-' + x.name,
        } as ExtendedTmplAstTextAttribute;
      }),
    );
  }

  if (!isImplicitTemplate(node.parent)) {
    return [];
  }

  /*
   * There may be multiple "attributes" for a structural directive even though
   * there is only a single HTML attribute:
   * e.g. `<ng-container *ngFor="let foo of bar"></ng-container>`
   * will parsed as two attributes (`ngFor` and `ngForOf`)
   */

  const attrs = node.parent.templateAttrs.map(toStructuralDirectiveOrderType);

  let keyEnd = attrs[0].keySpan?.end;
  if (keyEnd?.getContext(0, 0)?.after === '=') {
    keyEnd = keyEnd.moveBy(1);
    const apos = keyEnd.getContext(0, 0)?.after;
    if (apos === "'" || apos === '"') {
      do {
        keyEnd = keyEnd.moveBy(1);
      } while (keyEnd.getContext(0, 0)?.after !== apos);
    } else {
      while (!/[\s>]/.test(keyEnd.getContext(0, 0)?.after ?? '')) {
        keyEnd = keyEnd.moveBy(1);
      }
    }
    return [
      {
        ...attrs[0],
        sourceSpan: new ParseSourceSpan(attrs[0].sourceSpan.start, keyEnd),
      } as ExtendedTmplAstBoundAttribute | ExtendedTmplAstTextAttribute,
    ];
  }

  return [attrs[0]];
}

function normalizeInputsOutputs(
  inputs: readonly TmplAstBoundAttribute[],
  outputs: readonly TmplAstBoundEvent[],
) {
  const extractedInputs: readonly ExtendedTmplAstBoundAttribute[] = inputs
    .filter(
      (input) => !outputs.some((output) => isOnSameLocation(input, output)),
    )
    .map(toInputBindingOrderType);
  const { extractedBananaBoxes, extractedOutputs } = outputs.reduce<{
    extractedOutputs: readonly ExtendedTmplAstBoundEvent[];
    extractedBananaBoxes: readonly ExtendedTmplAstBoundAttribute[];
  }>(
    ({ extractedBananaBoxes, extractedOutputs }, output) => {
      const boundInput = inputs.find((input) =>
        isOnSameLocation(input, output),
      );

      return {
        extractedBananaBoxes: extractedBananaBoxes.concat(
          boundInput ? toTwoWayBindingOrderType(boundInput) : [],
        ),
        extractedOutputs: extractedOutputs.concat(
          boundInput ? [] : toOutputBindingOrderType(output),
        ),
      };
    },
    { extractedBananaBoxes: [], extractedOutputs: [] },
  );

  return { extractedBananaBoxes, extractedInputs, extractedOutputs } as const;
}

function isTmplAstTemplate(node: TmplAstNode): node is TmplAstTemplate {
  return node instanceof TmplAstTemplate;
}

function isOnSameLocation(
  input: TmplAstBoundAttribute,
  output: TmplAstBoundEvent,
) {
  return (
    input.sourceSpan.start === output.sourceSpan.start &&
    input.sourceSpan.end === output.sourceSpan.end
  );
}

function getMessageName(expected: ExtendedAttribute): string {
  const fullName = expected.keySpan?.details ?? expected.name;
  switch (expected.orderType) {
    case OrderType.StructuralDirective:
      return `*${fullName}`;
    case OrderType.TemplateReferenceVariable:
      return `#${fullName}`;
    case OrderType.InputBinding:
      return `[${fullName}]`;
    case OrderType.OutputBinding:
      return `(${fullName})`;
    case OrderType.TwoWayBinding:
      return `[(${fullName})]`;
    default:
      return fullName;
  }
}

function isValuelessStructuralDirective(attr: ExtendedAttribute): boolean {
  if (attr.orderType !== OrderType.StructuralDirective || !attr.keySpan) {
    return false;
  }

  const attrSpan = attr.sourceSpan;
  const keySpan = attr.keySpan;

  /**
   * A valueless structural directive will have the same span as its key.
   * TextAttribute[value=''] is not always a reliable selector, because
   * a *structuralDirective with `let var = something` will have value = ''
   */
  return (
    attrSpan.start.offset === keySpan.start.offset &&
    attrSpan.start.line === keySpan.start.line &&
    attrSpan.start.col === keySpan.start.col &&
    attrSpan.end.offset === keySpan.end.offset &&
    attrSpan.end.line === keySpan.end.line &&
    attrSpan.end.col === keySpan.end.col
  );
}

function getStartPos(expected: ExtendedAttribute): number {
  switch (expected.orderType) {
    case OrderType.StructuralDirective:
      return expected.sourceSpan.start.offset - 1;
    default:
      return expected.sourceSpan.start.offset;
  }
}

function getEndPos(expected: ExtendedAttribute): number {
  switch (expected.orderType) {
    case OrderType.StructuralDirective:
      return (
        expected.sourceSpan.end.offset +
        (isValuelessStructuralDirective(expected) ? 0 : 1)
      );
    default:
      return expected.sourceSpan.end.offset;
  }
}
