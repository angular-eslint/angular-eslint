import type {
  Attribute,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstElement,
  TmplAstNode,
  TmplAstReference,
  TmplAstTextAttribute,
  TmplAstVariable,
} from '@angular-eslint/bundled-angular-compiler';
import {
  Element,
  HtmlParser,
  ParseSourceSpan,
  TmplAstTemplate,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import type { TSESTree, TSESLint } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export enum OrderType {
  TemplateReferenceVariable = 'TEMPLATE_REFERENCE',
  StructuralDirective = 'STRUCTURAL_DIRECTIVE',
  AttributeBinding = 'ATTRIBUTE_BINDING',
  InputBinding = 'INPUT_BINDING',
  OutputBinding = 'OUTPUT_BINDING',
  TwoWayBinding = 'TWO_WAY_BINDING',
}

export type Options = [
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

interface SortableAttribute {
  readonly name: string;
  readonly sourceSpan: ParseSourceSpan;
  readonly keySpan: ParseSourceSpan | undefined;
  readonly orderType: OrderType;
  readonly fromHtmlParser?: boolean;
  readonly isI18nForAttribute?: boolean;
  readonly isBracketed?: boolean;
}

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

    function getLocation(attr: SortableAttribute): TSESTree.SourceLocation {
      return adjustLocation(
        parserServices.convertNodeSourceSpanToLoc(attr.sourceSpan),
        'location',
        attr,
      );
    }

    return {
      ['Element, Template'](node: ExtendedTmplAstElement | TmplAstTemplate) {
        if (isImplicitTemplate(node)) {
          return;
        }
        const allAttributes = getAllAttributes(
          node,
          context.filename,
          context.sourceCode,
        );

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
          const sourceCode = context.sourceCode;

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

function byLocation(one: SortableAttribute, other: SortableAttribute) {
  return one.sourceSpan.start.line === other.sourceSpan.start.line
    ? one.sourceSpan.start.col - other.sourceSpan.start.col
    : one.sourceSpan.start.line - other.sourceSpan.start.line;
}

function byOrder(order: readonly OrderType[], alphabetical: boolean) {
  return function (one: SortableAttribute, other: SortableAttribute) {
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

function getOrderIndex(attr: SortableAttribute, order: readonly OrderType[]) {
  return order.indexOf(attr.orderType);
}

function getAllAttributes(
  node: ExtendedTmplAstElement | TmplAstTemplate,
  filename: string,
  sourceCode: Readonly<TSESLint.SourceCode>,
): SortableAttribute[] {
  // If there are any i18n attributes (either associated with the
  // element itself, or with any attribute or input), then we need
  // to use the HTML parser to get the attributes because the i18n
  // metadata does not contain the spans of the i18n attributes.
  if (node.i18n) {
    return getAttributesFromHtmlParser(node, filename, node.inputs);
  }
  const { attributes, inputs, outputs, references } = node;
  const extendedInputs: ExtendedTmplAstBoundAttribute[] = [];
  const attributeBindings: ExtendedTmplAstTextAttribute[] = [];

  for (const input of inputs) {
    if (input.i18n) {
      return getAttributesFromHtmlParser(node, filename, node.inputs);
    }

    // Some attributes are parsed as inputs by the Angular template parser,
    // but they don't have square brackets. We don't want those attributes
    // to be classified as inputs because they look like regular attributes.
    // The name of the input will never include the square brackets, so we
    // need to look at the source. Unfortunately, the key span also doesn't
    // include the square brackets, so the source span is what we need to use.
    if (sourceCode.text.at(input.sourceSpan.start.offset) === '[') {
      extendedInputs.push(toInputBindingOrderType(input));
    } else {
      attributeBindings.push(toAttributeBindingOrderType(input));
    }
  }

  for (const attribute of attributes) {
    if (attribute.i18n) {
      return getAttributesFromHtmlParser(node, filename, node.inputs);
    }
    attributeBindings.push(toAttributeBindingOrderType(attribute));
  }

  const { extractedBananaBoxes, extractedInputs, extractedOutputs } =
    normalizeInputsOutputs(
      extendedInputs,
      outputs.map(toOutputBindingOrderType),
    );
  return [
    ...extractTemplateAttrs(node),
    ...attributeBindings,
    ...references.map(toTemplateReferenceVariableOrderType),
    ...extractedBananaBoxes,
    ...extractedInputs,
    ...extractedOutputs,
  ];
}

function toAttributeBindingOrderType(
  attribute: TmplAstTextAttribute | TmplAstVariable | TmplAstBoundAttribute,
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
  return (
    isTmplAstTemplate(node) &&
    (node.tagName === null || !/^(:svg:)?ng-template$/.test(node.tagName))
  );
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

function getMessageName(expected: SortableAttribute): string {
  const fullName = expected.keySpan?.details ?? expected.name;
  switch (expected.orderType) {
    case OrderType.StructuralDirective:
      return `*${fullName}`;
    case OrderType.TemplateReferenceVariable:
      return `#${fullName}`;
    case OrderType.InputBinding:
      return expected.isI18nForAttribute ? fullName : `[${fullName}]`;
    case OrderType.OutputBinding:
      return `(${fullName})`;
    case OrderType.TwoWayBinding:
      return `[(${fullName})]`;
    default:
      return fullName;
  }
}

function isValuelessStructuralDirective(attr: SortableAttribute): boolean {
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

function getStartPos(expected: SortableAttribute): number {
  return adjustLocation(expected.sourceSpan.start.offset, 'start', expected);
}

function getEndPos(expected: SortableAttribute): number {
  return adjustLocation(expected.sourceSpan.end.offset, 'end', expected);
}

function adjustLocation(
  loc: TSESTree.SourceLocation,
  kind: 'location',
  attr: SortableAttribute,
): TSESTree.SourceLocation;
function adjustLocation(
  offset: number,
  kind: 'start' | 'end',
  attr: SortableAttribute,
): number;
function adjustLocation(
  locOrOffset: TSESTree.SourceLocation | number,
  kind: 'location' | 'start' | 'end',
  attr: SortableAttribute,
): TSESTree.SourceLocation | number {
  // Spans for structural directives created from the
  // template parser will exclude the leading "*", so
  // we need to move the start back to include it.
  if (
    !attr.fromHtmlParser &&
    attr.orderType === OrderType.StructuralDirective
  ) {
    if (typeof locOrOffset === 'number') {
      if (kind === 'start') {
        return locOrOffset - 1;
      } else {
        return locOrOffset + (isValuelessStructuralDirective(attr) ? 0 : 1);
      }
    } else {
      return {
        start: {
          line: locOrOffset.start.line,
          column: locOrOffset.start.column - 1,
        },
        end: {
          line: locOrOffset.end.line,
          column:
            locOrOffset.end.column +
            (isValuelessStructuralDirective(attr) ? 0 : 1),
        },
      };
    }
  }
  return locOrOffset;
}

function getAttributesFromHtmlParser(
  node: ExtendedTmplAstElement | TmplAstTemplate,
  filename: string,
  inputs: TmplAstBoundAttribute[],
): SortableAttribute[] {
  // The template AST does not include the spans for i18n attributes.
  // To get their spans, we can re-parse just the element as HTML.
  // We only need the spans of the attributes, so take only the
  // start element and the end element (if there is one) so that
  // we don't waste time parsing the element's content.
  let html = node.startSourceSpan.toString();
  if (node.endSourceSpan) {
    html += node.endSourceSpan.toString();
  }
  const parser = new HtmlParser();
  const tree = parser.parse(html, filename, { preserveLineEndings: true });
  const element = tree.rootNodes.find((n) => n instanceof Element);
  if (element) {
    return element.attrs.map((attribute) => ({
      ...getHtmlAttributeNameAndOrderType(attribute, inputs),
      fromHtmlParser: true,
      // The HTML element was at the start of the string which means the
      // offset of each element will be relative to the start of the element.
      // To get the offset of the attribute in the template, we need to
      // move each span forward by the offset of the span in the template.
      sourceSpan: new ParseSourceSpan(
        node.startSourceSpan.start.moveBy(attribute.sourceSpan.start.offset),
        node.startSourceSpan.start.moveBy(attribute.sourceSpan.end.offset),
      ),
      keySpan: attribute.keySpan
        ? new ParseSourceSpan(
            node.startSourceSpan.start.moveBy(attribute.keySpan.start.offset),
            node.startSourceSpan.start.moveBy(attribute.keySpan.end.offset),
          )
        : undefined,
    }));
  }
  return [];
}

function getHtmlAttributeNameAndOrderType(
  attr: Attribute,
  inputs: TmplAstBoundAttribute[],
): Pick<SortableAttribute, 'name' | 'orderType' | 'isI18nForAttribute'> {
  if (attr.name.startsWith('#')) {
    return {
      name: attr.name.slice(1),
      orderType: OrderType.TemplateReferenceVariable,
    };
  }

  if (attr.name.startsWith('*')) {
    return {
      name: attr.name.slice(1),
      orderType: OrderType.StructuralDirective,
    };
  }

  if (attr.name.startsWith('[(') && attr.name.endsWith(')]')) {
    return {
      name: attr.name.slice(2, -2),
      orderType: OrderType.TwoWayBinding,
    };
  }

  if (attr.name.startsWith('[') && attr.name.endsWith(']')) {
    return {
      name: attr.name.slice(1, -1),
      orderType: OrderType.InputBinding,
    };
  }

  if (attr.name.startsWith('(') && attr.name.endsWith(')')) {
    return {
      name: attr.name.slice(1, -1),
      orderType: OrderType.OutputBinding,
    };
  }

  const isI18nForAttribute = attr.name.startsWith('i18n-');
  let orderType = OrderType.AttributeBinding;

  // If the attribute is an i18n attribute, and it is associated with
  // an input binding, then treat it as an input binding for ordering,
  // even though it is a regular attribute. This will keep the i18n
  // attribute immediately after its corresponding input binding.
  if (inputs.length > 0 && isI18nForAttribute) {
    const correspondingName = attr.name.slice(5);
    if (inputs.some((input) => input.name === correspondingName)) {
      orderType = OrderType.InputBinding;
    }
  }

  return {
    name: attr.name,
    orderType,
    isI18nForAttribute,
  };
}
