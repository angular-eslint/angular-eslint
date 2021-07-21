import type {
  TmplAstElement,
  BindingType,
  TmplAstTextAttribute,
} from '@angular/compiler';
import {
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstReference,
} from '@angular/compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { Template } from '@angular/compiler/src/render3/r3_ast';

export enum OrderAttributeType {
  TEMPLATE_REFERENCE = 'TEMPLATE_REFERENCE',
  STRUCTURAL_DIRECTIVE = 'STRUCTURAL_DIRECTIVE',
  ATTRIBUTE_BINDING = 'ATTRIBUTE_BINDING',
  INPUT_BINDING = 'INPUT_BINDING',
  OUTPUT_BINDING = 'OUTPUT_BINDING',
  TWO_WAY_BINDING = 'TWO_WAY_BINDING',
}

type Options = [
  {
    order: OrderAttributeType[];
  },
];

interface HasOrderType {
  orderType: OrderAttributeType;
}

interface HasTemplateParent {
  parent: Template;
}

interface HasOriginalType {
  __originalType: BindingType;
}

type InputsOutputsHash = Record<
  string,
  { input: ExtendedTmplAstBoundAttribute; output?: ExtendedTmplAstBoundEvent }
>;

type ExtendedTmplAstBoundAttribute = TmplAstBoundAttribute &
  HasOrderType &
  HasOriginalType;
type ExtendedTmplAstBoundEvent = TmplAstBoundEvent & HasOrderType;
type ExtendedTmplAstTextAttribute = TmplAstTextAttribute & HasOrderType;
type ExtendedTmplAstReference = TmplAstReference & HasOrderType;
type ExtendedTmplAstElement = TmplAstElement & HasTemplateParent;
type OrderAttributeNode =
  | ExtendedTmplAstBoundAttribute
  | ExtendedTmplAstBoundEvent
  | ExtendedTmplAstTextAttribute
  | ExtendedTmplAstReference;
export type MessageIds = 'attributesOrder';
export const RULE_NAME = 'attributes-order';

const DEFAULT_ORDER = [
  OrderAttributeType.STRUCTURAL_DIRECTIVE,
  OrderAttributeType.TEMPLATE_REFERENCE,
  OrderAttributeType.ATTRIBUTE_BINDING,
  OrderAttributeType.INPUT_BINDING,
  OrderAttributeType.TWO_WAY_BINDING,
  OrderAttributeType.OUTPUT_BINDING,
];

const defaultOptions: Options[number] = {
  order: [...DEFAULT_ORDER],
};

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensures that html attributes are sorted correctly',
      category: 'Possible Errors',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          order: {
            type: 'array',
            uniqueItems: true,
            minimum: 6,
            items: {
              enum: [...DEFAULT_ORDER],
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      attributesOrder:
        'Attributes order is incorrect, expected {{types}} at this position',
    },
  },
  defaultOptions: [defaultOptions],
  create(context, [{ order }]) {
    const parserServices = getTemplateParserServices(context);

    return {
      Element(element: TmplAstElement) {
        const { attributes, inputs, outputs, references } = element;

        const structuralAttrs = extractTemplateAttrs(
          element as ExtendedTmplAstElement,
        );
        const attrs = [...attributes, ...references] as OrderAttributeNode[];
        const typedAttrs = attrs.map((attr) => ({
          ...attr,
          orderType: getOrderAttributeType(attr),
        })) as OrderAttributeNode[];
        const { extractedBananaBoxes, extractedInputs, extractedOutputs } =
          extractBananaBoxes(
            inputs as ExtendedTmplAstBoundAttribute[],
            outputs as ExtendedTmplAstBoundEvent[],
          );
        const sortedTypedAttrs = sortAttrsByLocation([
          ...structuralAttrs,
          ...typedAttrs,
          ...extractedInputs,
          ...extractedOutputs,
          ...extractedBananaBoxes,
        ]);

        if (sortedTypedAttrs.length < 2) {
          return;
        }

        const filteredOrder = order.filter((orderType) =>
          sortedTypedAttrs.some((attr) => attr.orderType === orderType),
        );

        let expectedOrderTypeStartIndex = 0;
        let expectedOrderTypeEndIndex = 1;
        let prevType;

        console.log(
          '>>>> inspect',
          filteredOrder,
          'attrs:',
          sortedTypedAttrs.map((attr) => attr.name).join(', '),
        );

        for (let i = 0; i < sortedTypedAttrs.length; i++) {
          const expectedOrderTypes = filteredOrder.slice(
            expectedOrderTypeStartIndex,
            expectedOrderTypeEndIndex,
          );

          if (!expectedOrderTypes.length) {
            return;
          }

          const attr = sortedTypedAttrs[i];

          if (!expectedOrderTypes.includes(attr.orderType)) {
            const loc = parserServices.convertNodeSourceSpanToLoc(
              attr.sourceSpan,
            );

            context.report({
              loc,
              messageId: 'attributesOrder',
              data: { types: expectedOrderTypes.join(' or ') },
            });
            break;
          }

          if (i === 0) {
            expectedOrderTypeEndIndex++;
          } else if (attr.orderType !== prevType) {
            expectedOrderTypeStartIndex++;
            expectedOrderTypeEndIndex++;
          }
          prevType = attr.orderType;
        }
      },
    };
  },
});

function sortAttrsByLocation(list: OrderAttributeNode[]): OrderAttributeNode[] {
  return list.sort((a, b) => {
    if (a.sourceSpan.start.line != b.sourceSpan.start.line) {
      return a.sourceSpan.start.line - b.sourceSpan.start.line;
    }

    return a.sourceSpan.start.col - b.sourceSpan.start.col;
  });
}

function getOrderAttributeType(node: OrderAttributeNode): OrderAttributeType {
  switch (node.constructor.name) {
    case TmplAstBoundAttribute.name:
      return OrderAttributeType.INPUT_BINDING;
    case TmplAstBoundEvent.name:
      return OrderAttributeType.OUTPUT_BINDING;
    case TmplAstReference.name:
      return OrderAttributeType.TEMPLATE_REFERENCE;
    default:
      return OrderAttributeType.ATTRIBUTE_BINDING;
  }
}

function extractTemplateAttrs(
  node: ExtendedTmplAstElement,
): (ExtendedTmplAstBoundAttribute | ExtendedTmplAstTextAttribute)[] {
  if (
    node.parent.constructor.name === Template.name &&
    node.name === node.parent.tagName &&
    node.parent.templateAttrs.length
  ) {
    return node.parent.templateAttrs.map(
      (attr) =>
        ({
          ...attr,
          orderType: OrderAttributeType.STRUCTURAL_DIRECTIVE,
        } as ExtendedTmplAstBoundAttribute | ExtendedTmplAstTextAttribute),
    );
  }

  return [];
}

function extractBananaBoxes(
  inputs: ExtendedTmplAstBoundAttribute[],
  outputs: ExtendedTmplAstBoundEvent[],
): any {
  const extractedBananaBoxes: ExtendedTmplAstBoundAttribute[] = [];
  const extractedInputs: ExtendedTmplAstBoundAttribute[] = [];
  const extractedOutputs: ExtendedTmplAstBoundEvent[] = [];

  const { hash, notMatchedOutputs } = getInputsOutputsHash(inputs, outputs);
  const extractedOutputsFromHash = notMatchedOutputs.map((output) => {
    return {
      ...output,
      orderType: OrderAttributeType.OUTPUT_BINDING,
    } as ExtendedTmplAstBoundEvent;
  });

  extractedOutputs.push(...extractedOutputsFromHash);

  Object.keys(hash).forEach((inputKey) => {
    const { input, output } = hash[inputKey];

    if (!output) {
      extractedInputs.push({
        ...input,
        orderType: OrderAttributeType.INPUT_BINDING,
      } as ExtendedTmplAstBoundAttribute);
      return;
    }

    if ((input.value as any).location === (output.handler as any).location) {
      extractedBananaBoxes.push({
        ...input,
        orderType: OrderAttributeType.TWO_WAY_BINDING,
      } as ExtendedTmplAstBoundAttribute);
    } else {
      extractedInputs.push({
        ...input,
        orderType: OrderAttributeType.INPUT_BINDING,
      } as ExtendedTmplAstBoundAttribute);
      extractedOutputs.push({
        ...output,
        orderType: OrderAttributeType.OUTPUT_BINDING,
      } as ExtendedTmplAstBoundEvent);
    }
  });

  return {
    extractedBananaBoxes,
    extractedInputs,
    extractedOutputs,
  };
}

function getInputsOutputsHash(
  inputs: ExtendedTmplAstBoundAttribute[],
  outputs: ExtendedTmplAstBoundEvent[],
): { hash: InputsOutputsHash; notMatchedOutputs: ExtendedTmplAstBoundEvent[] } {
  const hash: InputsOutputsHash = {};
  const notMatchedOutputs: ExtendedTmplAstBoundEvent[] = [];

  inputs.forEach((input) => {
    hash[input.name] = { input };
  });
  outputs.forEach((output) => {
    if (!output.name.endsWith('Change')) {
      notMatchedOutputs.push(output);
      return;
    }

    const name = output.name.substring(0, output.name.lastIndexOf('Change'));

    if (!hash[name]) {
      notMatchedOutputs.push(output);
      return;
    }

    hash[name].output = output;
  });

  return { hash, notMatchedOutputs };
}
