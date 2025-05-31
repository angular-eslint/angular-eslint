import type {
  AST,
  TmplAstElement,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { isChildNodeOf } from '../utils/is-child-node-of';

type LabelComponent = {
  readonly inputs?: readonly string[];
  readonly selector: string;
};
export type Options = [
  {
    readonly controlComponents?: readonly string[];
    readonly labelComponents?: readonly LabelComponent[];
    readonly checkIds?: boolean;
  },
];
export type MessageIds = 'labelHasAssociatedControl';
export const RULE_NAME = 'label-has-associated-control';
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
  checkIds: false,
};

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        '[Accessibility] Ensures that a label element/component is associated with a form element',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          checkIds: { type: 'boolean' },
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
      labelHasAssociatedControl:
        'A label component must be associated with a form element',
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, [{ checkIds, controlComponents, labelComponents }]) {
    const parserServices = getTemplateParserServices(context);
    const allControlComponents: ReadonlySet<string> = new Set([
      ...DEFAULT_CONTROL_COMPONENTS,
      ...(controlComponents ?? []),
    ]);

    const labelMap = new Map(
      DEFAULT_LABEL_COMPONENTS.map(comp => [comp.selector, comp])
    );    
    // Add custom components, overriding defaults with same selector
    if (labelComponents) {
      labelComponents.forEach(comp => labelMap.set(comp.selector, comp));
    }
    
    const allLabelComponents = Array.from(labelMap.values());
    let inputItems: TmplAstElement[] = [];
    let labelItems: TmplAstElement[] = [];

    return {
      [`Element`](node: TmplAstElement) {
        if (allControlComponents.has(node.name)) {
          inputItems.push(node);
        }
        const element = allLabelComponents.find(
          ({ selector }) => selector === node.name,
        );
        if (element) {
          labelItems.push(node);
        }
      },

      onCodePathEnd() {
        for (const node of labelItems) {
          const element = allLabelComponents.find(
            ({ selector }) => selector === node.name,
          );

          if (!element) continue;
          const attributesInputs: ReadonlyMap<string, string | AST> = new Map(
            [...node.attributes, ...node.inputs].map(({ name, value }) => [
              name,
              value,
            ]),
          );
          const inputValues = (
            element.inputs?.map((input) => attributesInputs.get(input)) ?? []
          ).filter(filterUndefined);
          let hasFor = inputValues.length > 0;
          if (hasFor && checkIds) {
            const value = inputValues[0];
            hasFor = hasControlComponentWithId(inputItems, value);
          }
          if (hasFor || hasControlComponentIn(allControlComponents, node)) {
            continue;
          }
          const loc = parserServices.convertNodeSourceSpanToLoc(
            node.sourceSpan,
          );

          context.report({
            loc,
            messageId: 'labelHasAssociatedControl',
          });
        }

        inputItems = [];
        labelItems = [];
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

function hasControlComponentWithId(
  controlComponents: TmplAstElement[],
  id: string | AST,
) {
  return Boolean(
    [...controlComponents].some((node) => {
      return !![...node.attributes, ...node.inputs].find(
        (input) => input.name === 'id' && input.value === id,
      );
    }),
  );
}

function filterUndefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
