import type {
  TmplAstElement,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstReference,
  TmplAstTextAttribute,
  TmplAstNode,
} from '@angular-eslint/bundled-angular-compiler';
import { TmplAstTemplate } from '@angular-eslint/bundled-angular-compiler';
import type { TSESTree } from '@typescript-eslint/utils';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { isOnSameLocation } from '../utils/is-on-same-location';

export const enum OrderType {
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
      description: 'Ensures that HTML attributes and Angular bindings are sorted based on an expected order',
      recommended: false,
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
              enum: DEFAULT_OPTIONS.order,
            },
            default: DEFAULT_OPTIONS.order,
            minItems: DEFAULT_OPTIONS.order.length,
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      attributesOrder:
        'Attributes order is incorrect, expected {{expected}} instead of {{actual}}',
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
              column: loc.end.column + 1,
            },
          };
        default:
          return loc;
      }
    }

    return {
      Element$1(node: ExtendedTmplAstElement) {
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
      return one.name > other.name ? 1 : -1;
    }

    return orderComparison;
  };
}

function getOrderIndex(attr: ExtendedAttribute, order: readonly OrderType[]) {
  return order.indexOf(attr.orderType);
}

function toAttributeBindingOrderType(attribute: TmplAstTextAttribute) {
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

function extractTemplateAttrs(
  node: ExtendedTmplAstElement,
): (ExtendedTmplAstBoundAttribute | ExtendedTmplAstTextAttribute)[] {
  return isTmplAstTemplate(node.parent)
    ? node.parent.templateAttrs.map(toStructuralDirectiveOrderType)
    : [];
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

function getMessageName(expected: ExtendedAttribute): string {
  switch (expected.orderType) {
    case OrderType.StructuralDirective:
      return `*${expected.name}`;
    case OrderType.TemplateReferenceVariable:
      return `#${expected.name}`;
    case OrderType.InputBinding:
      return `[${expected.name}]`;
    case OrderType.OutputBinding:
      return `(${expected.name})`;
    case OrderType.TwoWayBinding:
      return `[(${expected.name})]`;
    default:
      return expected.name;
  }
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
      return expected.sourceSpan.end.offset + 1;
    default:
      return expected.sourceSpan.end.offset;
  }
}
