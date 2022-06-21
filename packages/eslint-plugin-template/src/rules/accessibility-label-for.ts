import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { isChildNodeOf } from '../utils/is-child-node-of';

type Options = [
  {
    readonly controlComponents?: readonly string[];
    readonly labelAttributes?: readonly string[];
    readonly labelComponents?: readonly string[];
  },
];
export type MessageIds = 'accessibilityLabelFor';
export const RULE_NAME = 'accessibility-label-for';
const OPTION_SCHEMA_VALUE = {
  items: { type: 'string' },
  type: 'array',
  uniqueItems: true,
} as const;
const DEFAULT_ELEMENTS = [
  'button',
  'input',
  'meter',
  'output',
  'progress',
  'select',
  'textarea',
] as const;
const DEFAULT_LABEL_ATTRIBUTES = ['for', 'htmlFor'] as const;
const DEFAULT_LABEL_COMPONENTS = ['label'] as const;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    deprecated: true,
    replacedBy: ['accessibility-label-has-associated-control'],
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
          // NOTE: These need to be unique objects for documentation generation purposes
          controlComponents: { ...OPTION_SCHEMA_VALUE },
          labelAttributes: { ...OPTION_SCHEMA_VALUE },
          labelComponents: { ...OPTION_SCHEMA_VALUE },
        },
        type: 'object',
      },
    ],
    messages: {
      accessibilityLabelFor:
        'A label element/component must be associated with a form element',
    },
  },
  defaultOptions: [
    {
      controlComponents: DEFAULT_ELEMENTS,
      labelAttributes: DEFAULT_LABEL_ATTRIBUTES,
      labelComponents: DEFAULT_LABEL_COMPONENTS,
    },
  ],
  create(context, [options]) {
    const parserServices = getTemplateParserServices(context);
    const { controlComponents, labelAttributes, labelComponents } =
      getParsedOptions(options);
    const labelComponentsPattern = toPattern([...labelComponents]);

    return {
      [`Element$1[name=${labelComponentsPattern}]`](node: TmplAstElement) {
        const attributesInputs: ReadonlySet<string> = new Set(
          [...node.attributes, ...node.inputs].map(({ name }) => name),
        );
        const hasLabelAttribute = [...labelAttributes].some((labelAttribute) =>
          attributesInputs.has(labelAttribute),
        );

        if (
          hasLabelAttribute ||
          hasControlComponentIn(controlComponents, node)
        ) {
          return;
        }

        const loc = parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);

        context.report({
          loc,
          messageId: 'accessibilityLabelFor',
        });
      },
    };
  },
});

function getParsedOptions({
  controlComponents,
  labelAttributes,
  labelComponents,
}: Options[0]) {
  return {
    controlComponents: new Set([
      ...DEFAULT_ELEMENTS,
      ...(controlComponents ?? []),
    ]) as ReadonlySet<string>,
    labelAttributes: new Set([
      ...DEFAULT_LABEL_ATTRIBUTES,
      ...(labelAttributes ?? []),
    ]) as ReadonlySet<string>,
    labelComponents: new Set([
      ...DEFAULT_LABEL_COMPONENTS,
      ...(labelComponents ?? []),
    ]) as ReadonlySet<string>,
  } as const;
}

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
