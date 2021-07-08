import type { TmplAstElement } from '@angular/compiler';
import {
  BindingType,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstReference,
  TmplAstTextAttribute,
} from '@angular/compiler';
import { createESLintRule, getTemplateParserServices } from '../utils/create-eslint-rule';
import { Template } from '@angular/compiler/src/render3/r3_ast';

enum OrderAttributeType {
  TEMPLATE_REFERENCE = 1,
  STRUCTURAL,
  CLASS,
  STYLE,
  ID,
  NAME,
  DATA,
  SRC,
  FOR,
  TYPE,
  HREF,
  VALUE,
  TITLE,
  ALT,
  ROLE,
  ARIA,
  INPUT,
  OUTPUT,
  BANANA,
  ANIMATION,
  OTHER_ATTRIBUTES
}

type Options = [
  {
    order: OrderAttributeType[]
  },
];

interface HasOrderType {
  orderType: OrderAttributeType;
}

interface HasParent {
  parent: any;
}

interface HasOriginalType {
  __originalType: BindingType
}

type ExtendedTmplAstBoundAttribute = TmplAstBoundAttribute & HasOrderType & HasParent & HasOriginalType;
type ExtendedTmplAstBoundEvent = TmplAstBoundEvent & HasOrderType & HasParent;
type ExtendedTmplAstTextAttribute = TmplAstTextAttribute & HasOrderType & HasParent;
type ExtendedTmplAstReference = TmplAstReference & HasOrderType & HasParent;
type ExtendedTmplAstElement = TmplAstElement & HasParent;
type OrderAttributeNode =
  ExtendedTmplAstBoundAttribute
  | ExtendedTmplAstBoundEvent
  | ExtendedTmplAstTextAttribute
  | ExtendedTmplAstReference
export type MessageIds = 'attributesOrder';
export const RULE_NAME = 'attributes-order';

const defaultOptions: Options[number] = {
  order: [
    OrderAttributeType.TEMPLATE_REFERENCE,
    OrderAttributeType.STRUCTURAL,
    OrderAttributeType.ID,
    OrderAttributeType.CLASS,
    OrderAttributeType.NAME,
    OrderAttributeType.DATA,
    OrderAttributeType.SRC,
    OrderAttributeType.FOR,
    OrderAttributeType.TYPE,
    OrderAttributeType.HREF,
    OrderAttributeType.VALUE,
    OrderAttributeType.TITLE,
    OrderAttributeType.STYLE,
    OrderAttributeType.ALT,
    OrderAttributeType.ROLE,
    OrderAttributeType.ARIA,
    OrderAttributeType.INPUT,
    OrderAttributeType.OUTPUT,
    OrderAttributeType.BANANA,
    OrderAttributeType.ANIMATION,
    OrderAttributeType.OTHER_ATTRIBUTES,
  ],
};

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensures that html attributes are sorted correctly',
      category: 'Possible Errors',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          order: {
            type: 'array',
            of: 'string',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      attributesOrder: 'Attributes order is incorrect',
    },
  },
  defaultOptions: [defaultOptions],
  create(context, [{ order }]) {
    const parserServices = getTemplateParserServices(context);

    return {
      Element(element: TmplAstElement) {
        const { attributes, inputs, outputs, references } = element;

        const structuralAttrs = extractTemplateAttrs(element as ExtendedTmplAstElement);
        const attrs = [...attributes, ...inputs, ...outputs, ...references] as OrderAttributeNode[];
        const typedAttrs = attrs.map(attr => ({
          ...attr,
          orderType: getOrderAttributeType(attr),
        })) as OrderAttributeNode[];
        const sortedTypedAttrs = sortAttrs([...typedAttrs, ...structuralAttrs]);

        if (sortedTypedAttrs.length < 2) {
          return;
        }

        const filteredOrder = order.filter(orderType => sortedTypedAttrs.some(attr => attr.orderType === orderType));

        let expectedOrderTypeStartIndex = 0;
        let expectedOrderTypeEndIndex = 1;
        const getExpectedOrderTypes = () => filteredOrder.slice(expectedOrderTypeStartIndex, expectedOrderTypeEndIndex);

        sortedTypedAttrs.forEach((attr, index) => {
          if (index === 1) {
            expectedOrderTypeEndIndex += 1;
          } else {
            const orderTypes = getExpectedOrderTypes();

            if (!orderTypes.length) {
              return;
            }

            if (orderTypes.includes(attr.orderType)) {
              if (attr.orderType !== filteredOrder[expectedOrderTypeStartIndex]) {
                expectedOrderTypeStartIndex += 1;
                expectedOrderTypeEndIndex += 1;
              }
            } else {
              const loc = parserServices.convertNodeSourceSpanToLoc(attr.sourceSpan);

              context.report({
                loc,
                messageId: 'attributesOrder',
              });

              return;
            }
          }
        });
      },
    };
  },
});

function sortAttrs(
  list: OrderAttributeNode[],
): OrderAttributeNode[] {
  return list.sort((a, b) => {
    if (a.sourceSpan.start.line != b.sourceSpan.start.line) {
      return a.sourceSpan.start.line - b.sourceSpan.start.line;
    }

    return a.sourceSpan.start.col - b.sourceSpan.start.col;
  });
}

function getOrderAttributeType(node: OrderAttributeNode): OrderAttributeType {
  switch (node.constructor.name) {
    case TmplAstTextAttribute.name:
      return getTextAttributeOrderType(node as ExtendedTmplAstTextAttribute);
    case TmplAstBoundAttribute.name:
      return getBoundAttributeOrderType(node as ExtendedTmplAstBoundAttribute);
    case TmplAstBoundEvent.name:
      return OrderAttributeType.OUTPUT;
    case TmplAstReference.name:
      return OrderAttributeType.TEMPLATE_REFERENCE;
  }

  return OrderAttributeType.OTHER_ATTRIBUTES;
}

function getTextAttributeOrderType(
  node: ExtendedTmplAstTextAttribute | ExtendedTmplAstBoundAttribute,
): OrderAttributeType {
  if (node.name.startsWith('data-')) {
    return OrderAttributeType.DATA;
  }
  if (node.name.startsWith('aria-')) {
    return OrderAttributeType.ARIA;
  }
  switch (node.name) {
    case 'id':
      return OrderAttributeType.ID;
    case 'class':
      return OrderAttributeType.CLASS;
    case 'style':
      return OrderAttributeType.STYLE;
    case 'src':
      return OrderAttributeType.SRC;
    case 'type':
      return OrderAttributeType.TYPE;
    case 'for':
      return OrderAttributeType.FOR;
    case 'href':
      return OrderAttributeType.HREF;
    case 'value':
      return OrderAttributeType.VALUE;
    case 'title':
      return OrderAttributeType.TITLE;
    case 'alt':
      return OrderAttributeType.ALT;
    case 'role':
      return OrderAttributeType.ROLE;
    default:
      return OrderAttributeType.OTHER_ATTRIBUTES;
  }
}

function getBoundAttributeOrderType(node: ExtendedTmplAstBoundAttribute): OrderAttributeType {
  switch (node.__originalType) {
    case BindingType.Class:
      return OrderAttributeType.CLASS;
    case BindingType.Style:
      return OrderAttributeType.STYLE;
    case BindingType.Animation:
      return OrderAttributeType.ANIMATION;
    case BindingType.Attribute:
      return getTextAttributeOrderType(node);
    case BindingType.Property:
      return getTextAttributeOrderType(node);
    default:
      return OrderAttributeType.INPUT;
  }
}

function extractTemplateAttrs(node: ExtendedTmplAstElement): (ExtendedTmplAstBoundAttribute | ExtendedTmplAstTextAttribute)[] {
  if (node.parent.constructor.name === Template.name && node.name === node.parent.tagName && node.parent.templateAttrs.length) {
    return node.parent.templateAttrs.map((attr: any) => ({ ...attr, orderType: OrderAttributeType.STRUCTURAL }));
  }

  return [];
}
