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

export interface CustomGroup {
  readonly groupName: string;
  readonly attributeNamePattern: string;
}

export type Options = [
  {
    readonly alphabetical: boolean;
    /**
     * The built-in `OrderType` values, plus the `groupName` of each custom group.
     */
    readonly order: readonly string[];
    readonly customGroups?: readonly CustomGroup[];
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
  customGroups: [],
};

const BUILT_IN_ORDER_TYPES: readonly string[] = Object.values(OrderType);

const I18N_MARKER_PREFIX = /^i18n-/;

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
            description:
              'The expected order of groups. It must contain every built-in group exactly once, plus the `groupName` of every entry in `customGroups`.',
            items: {
              type: 'string',
              minLength: 1,
            },
            default: DEFAULT_OPTIONS.order as string[],
            minItems: DEFAULT_OPTIONS.order.length,
            uniqueItems: true,
          },
          customGroups: {
            type: 'array',
            description:
              'Extra groups that can be placed anywhere in `order`. An attribute or binding whose name matches `attributeNamePattern` moves out of its built-in group into the custom group, whatever its binding type. The pattern is tested against the name that the rule reports, without its binding syntax: `^neo` matches `neoSize`, `[neoSize]`, `(neoSizeChange)`, `*neoIf` and `#neoRef`, but not `[attr.neo-label]` or `let-neoItem`. An `i18n-*` marker is matched using the name of the attribute it annotates, so it always stays in the same group as that attribute. When several custom groups match, the first one in this list wins. Within a custom group, attributes are sorted alphabetically if `alphabetical` is `true`, and otherwise keep their source order.',
            items: {
              type: 'object',
              properties: {
                groupName: {
                  type: 'string',
                  description:
                    'The name to use for this group in `order`. It must not be a built-in group name.',
                  minLength: 1,
                  not: { type: 'string', enum: [...BUILT_IN_ORDER_TYPES] },
                },
                attributeNamePattern: {
                  type: 'string',
                  description:
                    'A regular expression, without flags, tested against the attribute or binding name. It is not anchored, so use `^` to match a prefix.',
                  minLength: 1,
                },
              },
              required: ['groupName', 'attributeNamePattern'],
              additionalProperties: false,
            },
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      attributesOrder: `The element's attributes/bindings did not match the expected order: expected {{expected}} instead of {{actual}}`,
    },
    defaultOptions: [DEFAULT_OPTIONS],
  },
  create(context, [{ alphabetical, order, customGroups = [] }]) {
    const getRank = createRankResolver(order, customGroups);
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

        const sortedAttributes = allAttributes.sort(byLocation);

        const expectedAttributes = sortedAttributes
          .map((attr, index) => toRankedAttribute(attr, index, getRank))
          .sort(alphabetical ? byRankThenName : byRankThenPosition)
          .map(({ attr }) => attr);

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

interface Rank {
  /** The index of the attribute's group in `order`. */
  readonly groupIndex: number;
  readonly isCustomGroup: boolean;
}

interface RankedAttribute extends Rank {
  readonly attr: SortableAttribute;
  /** The attribute's name with any `i18n-` marker prefix removed. */
  readonly normalizedName: string;
  readonly isI18nMarker: boolean;
  /** The attribute's index in source order, used as the tie-breaker. */
  readonly position: number;
}

/**
 * Validates `order` against `customGroups`, compiles each pattern once,
 * and returns a function that resolves the rank of an attribute name.
 *
 * The parts of the options that the JSON Schema can't express (pattern
 * syntax, unique group names, every built-in group being in `order`, and
 * the link between `order` and `customGroups`) are checked here when the
 * rule is created.
 */
function createRankResolver(
  order: readonly string[],
  customGroups: readonly CustomGroup[],
): (attr: SortableAttribute, lookupName: string) => Rank {
  const groupIndexes = new Map(order.map((entry, index) => [entry, index]));
  const compiledGroups: { groupIndex: number; pattern: RegExp }[] = [];
  const customGroupNames = new Set<string>();

  for (const { groupName, attributeNamePattern } of customGroups) {
    if (customGroupNames.has(groupName)) {
      throw new Error(
        `${RULE_NAME}: the custom group name "${groupName}" is used more than once in \`customGroups\`.`,
      );
    }
    customGroupNames.add(groupName);
    const groupIndex = groupIndexes.get(groupName);
    if (groupIndex === undefined) {
      throw new Error(
        `${RULE_NAME}: the custom group "${groupName}" must be listed in \`order\`.`,
      );
    }
    let pattern: RegExp;
    try {
      pattern = new RegExp(attributeNamePattern);
    } catch (error) {
      throw new Error(
        `${RULE_NAME}: the \`attributeNamePattern\` of the custom group "${groupName}" is not a valid regular expression: ${(error as Error).message}`,
        { cause: error },
      );
    }
    compiledGroups.push({ groupIndex, pattern });
  }

  for (const orderType of BUILT_IN_ORDER_TYPES) {
    if (!groupIndexes.has(orderType)) {
      throw new Error(
        `${RULE_NAME}: \`order\` must include the built-in group "${orderType}".`,
      );
    }
  }

  for (const entry of order) {
    if (!BUILT_IN_ORDER_TYPES.includes(entry) && !customGroupNames.has(entry)) {
      throw new Error(
        `${RULE_NAME}: "${entry}" in \`order\` is neither a built-in group nor a \`groupName\` from \`customGroups\`.`,
      );
    }
  }

  const builtInRanks = new Map(
    BUILT_IN_ORDER_TYPES.map((orderType) => [
      orderType,
      {
        groupIndex: groupIndexes.get(orderType) as number,
        isCustomGroup: false,
      },
    ]),
  );

  if (compiledGroups.length === 0) {
    return (attr) => builtInRanks.get(attr.orderType) as Rank;
  }

  // Names repeat a lot across a template (`class`, `id`, `(click)` and so
  // on), so test each distinct name against the patterns only once.
  const customRanks = new Map<string, Rank | null>();

  return (attr, lookupName) => {
    let rank = customRanks.get(lookupName);
    if (rank === undefined) {
      const group = compiledGroups.find(({ pattern }) =>
        pattern.test(lookupName),
      );
      rank = group
        ? { groupIndex: group.groupIndex, isCustomGroup: true }
        : null;
      customRanks.set(lookupName, rank);
    }
    return rank ?? (builtInRanks.get(attr.orderType) as Rank);
  };
}

function toRankedAttribute(
  attr: SortableAttribute,
  position: number,
  getRank: (attr: SortableAttribute, lookupName: string) => Rank,
): RankedAttribute {
  const name = attr.keySpan?.details ?? attr.name;
  // Only plain `i18n-*` attributes are translation markers. A binding such
  // as `(i18n-save)` keeps its full name.
  const isI18nMarker = attr.isI18nForAttribute === true;
  const normalizedName = isI18nMarker
    ? name.replace(I18N_MARKER_PREFIX, '')
    : name;
  // An `i18n-*` marker is looked up by the name of the attribute it
  // annotates, so the two always end up in the same custom group.
  const rank = getRank(attr, normalizedName);
  return {
    attr,
    ...rank,
    normalizedName,
    isI18nMarker,
    position,
  };
}

function byRankThenPosition(one: RankedAttribute, other: RankedAttribute) {
  return one.groupIndex - other.groupIndex || one.position - other.position;
}

function byRankThenName(one: RankedAttribute, other: RankedAttribute) {
  const orderComparison = one.groupIndex - other.groupIndex;
  if (orderComparison !== 0) {
    return orderComparison;
  }
  if (one.normalizedName !== other.normalizedName) {
    return one.normalizedName > other.normalizedName ? 1 : -1;
  }
  // Attributes with the same name can come from different binding types
  // once a custom group pulls them together, e.g. `#neoValue` and
  // `neoValue`. Put the kinds an `i18n-*` marker can annotate last and the
  // marker after them, so the marker stays next to its attribute, and fall
  // back to position so that the order is stable.
  return (
    sameNameRank(one) - sameNameRank(other) || one.position - other.position
  );
}

function sameNameRank({ attr, isI18nMarker }: RankedAttribute): number {
  if (isI18nMarker) {
    return 2;
  }
  return attr.orderType === OrderType.AttributeBinding ||
    attr.orderType === OrderType.InputBinding
    ? 1
    : 0;
}

function getAllAttributes(
  node: ExtendedTmplAstElement | TmplAstTemplate,
  filename: string,
  sourceCode: Readonly<TSESLint.SourceCode>,
): SortableAttribute[] {
  // If there are any i18n attributes (either associated with the
  // element itself, or with any attribute or input), then we need
  // to use the HTML parser to get the attributes because the template
  // AST drops them. Angular only attaches i18n metadata to the inputs
  // and attributes that it translates, so an `i18n-*` marker for a
  // bound input such as `[title]` has to be found in the source text.
  if (node.i18n || node.startSourceSpan.toString().includes('i18n-')) {
    return getAttributesFromHtmlParser(node, filename);
  }
  const { attributes, inputs, outputs, references } = node;
  const extendedInputs: ExtendedTmplAstBoundAttribute[] = [];
  const attributeBindings: ExtendedTmplAstTextAttribute[] = [];

  for (const input of inputs) {
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
    (node.tagName === null ||
      !/^(:svg:)?ng-template$/.test(node.tagName.toLowerCase()))
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
   * will be parsed as two attributes (`ngFor` and `ngForOf`)
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
  if (!element) {
    return [];
  }
  const attributes: SortableAttribute[] = element.attrs.map((attribute) => ({
    ...getHtmlAttributeNameAndOrderType(attribute),
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

  // Put each `i18n-*` marker in the same group as the attribute or input
  // that it annotates, so that the two stay next to each other. This is
  // `InputBinding` for `[title]`, but `AttributeBinding` for an
  // interpolated `title="{{ x }}"`, even though Angular parses both as
  // inputs. A marker whose attribute isn't on the element stays an
  // `AttributeBinding`.
  return attributes.map((attr) => {
    if (!attr.isI18nForAttribute) {
      return attr;
    }
    const annotatedName = attr.name.replace(I18N_MARKER_PREFIX, '');
    const annotated = attributes.find(
      (other) =>
        other.name === annotatedName &&
        (other.orderType === OrderType.AttributeBinding ||
          other.orderType === OrderType.InputBinding),
    );
    return annotated ? { ...attr, orderType: annotated.orderType } : attr;
  });
}

function getHtmlAttributeNameAndOrderType(
  attr: Attribute,
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

  return {
    name: attr.name,
    orderType: OrderType.AttributeBinding,
    isI18nForAttribute: I18N_MARKER_PREFIX.test(attr.name),
  };
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Consistent ordering of template attributes makes templates easier to read and scan visually. When attributes are always ordered the same way across a codebase (for example: structural directives first, then template references, then inputs, then outputs), developers can quickly locate specific attributes without having to scan randomly-ordered attribute lists. This is especially valuable for elements with many attributes. The rule supports both semantic ordering (grouping by attribute type) and alphabetical sorting within groups, allowing teams to choose the organizational pattern that works best for them. The `customGroups` option adds named groups, matched by a regular expression on the attribute or binding name, that can be placed anywhere in `order`. This keeps related attributes together, such as the inputs and attributes of a design system or component library.',
};
