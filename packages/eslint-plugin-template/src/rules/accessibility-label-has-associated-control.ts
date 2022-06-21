import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { isChildNodeOf } from '../utils/is-child-node-of';

type LabelComponent = {
  readonly inputs?: readonly string[];
  readonly selector: string;
};
type Options = [
  {
    readonly controlComponents?: readonly string[];
    readonly labelComponents?: readonly LabelComponent[];
  },
];
export type MessageIds = 'accessibilityLabelHasAssociatedControl';
export const RULE_NAME = 'accessibility-label-has-associated-control';
const DEFAULT_CONTROL_COMPONENTS = [
  'input',
  'meter',
  'output',
  'progress',
  'select',
  'textarea',
];
const DEFAULT_LABEL_COMPONENTS: readonly LabelComponent[] = [
  { inputs: ['for', 'htmlFor'], selector: 'label' },
];
const DEFAULT_OPTIONS: Options[0] = {
  controlComponents: DEFAULT_CONTROL_COMPONENTS,
  labelComponents: DEFAULT_LABEL_COMPONENTS,
};

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures that a label element/component is associated with a form element',
      recommended: false,
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          controlComponents: {
            items: { type: 'string' },
            type: 'array',
            uniqueItems: true,
          },
          labelComponents: {
            items: {
              additionalProperties: false,
              properties: {
                inputs: {
                  items: { type: 'string' },
                  type: 'array',
                  uniqueItems: true,
                },
                selector: { type: 'string' },
              },
              required: ['selector'],
              type: 'object',
            },
            type: 'array',
            uniqueItems: true,
          },
        },
        type: 'object',
      },
    ],
    messages: {
      accessibilityLabelHasAssociatedControl:
        'A label component must be associated with a form element',
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, [{ controlComponents, labelComponents }]) {
    const parserServices = getTemplateParserServices(context);
    const allControlComponents: ReadonlySet<string> = new Set([
      ...DEFAULT_CONTROL_COMPONENTS,
      ...(controlComponents ?? []),
    ]);
    const allLabelComponents = [
      ...DEFAULT_LABEL_COMPONENTS,
      ...(labelComponents ?? []),
    ] as const;
    const labelSelectors = allLabelComponents.map(({ selector }) => selector);
    const labelComponentsPattern = toPattern(labelSelectors);

    return {
      [`Element$1[name=${labelComponentsPattern}]`](node: TmplAstElement) {
        const element = allLabelComponents.find(
          ({ selector }) => selector === node.name,
        );

        if (!element) return;

        const attributesInputs: ReadonlySet<string> = new Set(
          [...node.attributes, ...node.inputs].map(({ name }) => name),
        );
        const hasInput = element.inputs?.some((input) =>
          attributesInputs.has(input),
        );

        if (hasInput || hasControlComponentIn(allControlComponents, node)) {
          return;
        }

        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);

        context.report({
          loc,
          messageId: 'accessibilityLabelHasAssociatedControl',
        });
      },
    };
  },
});

function hasControlComponentIn(
  controlComponents: ReadonlySet<string>,
  element: TmplAstElement,
): boolean {
  return Boolean(
    [...controlComponents].some((controlComponent) =>
      isChildNodeOf(element, controlComponent),
    ),
  );
}

function toPattern(value: readonly unknown[]): RegExp {
  return RegExp(`^(${value.join('|')})$`);
}
