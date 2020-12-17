import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'accessibilityAltText';
export const RULE_NAME = 'accessibility-alt-text';

const elements = ['img', 'object', 'area', 'input'];

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforces alternate text for elements which require the alt, aria-label, aria-labelledby attributes.',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      accessibilityAltText:
        '<{{element}}/> element must have a text alternative.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      Element(node: any) {
        if (elements.indexOf(node.name) === -1) {
          return;
        }

        const isValid = isValidNode(node);

        if (!isValid) {
          const loc = parserServices.convertElementSourceSpanToLoc(
            context,
            node,
          );

          context.report({
            loc,
            messageId: 'accessibilityAltText',
            data: {
              element: node.name,
            },
          });
        }
      },
    };
  },
});

function isValidNode(node: any): boolean {
  if (node.name === 'img') {
    return isValidImgNode(node);
  } else if (node.name === 'object') {
    return isValidObjectNode(node);
  } else if (node.name === 'area') {
    return isValidAreaNode(node);
  } else {
    return isValidInputNode(node);
  }
}

/**
 * In this case, we check that the `<img>` element has an `alt` attribute or `attr.alt` binding.
 */
function isValidImgNode(node: any): boolean {
  return (
    node.attributes.some((attribute: any) => isAlt(attribute.name)) ||
    node.inputs.some((input: any) => isAlt(input.name))
  );
}

/**
 * In this case, we check that the `<object>` element has a `title` or `aria-label` attribute.
 * Otherwise, we check for the presence of `attr.title` or `attr.aria-label` bindings.
 */
function isValidObjectNode(node: any): boolean {
  let hasTitleAttribute = false,
    hasAriaLabelAttribute = false;

  for (const attribute of node.attributes) {
    hasTitleAttribute = attribute.name === 'title';
    hasAriaLabelAttribute = isAriaLabel(attribute.name);
  }

  // Note that we return "early" before looping through `element.inputs`.
  // Because if the element has an attribute, then we don't need to iterate
  // over the inputs unnecessarily.
  if (hasTitleAttribute || hasAriaLabelAttribute) {
    return true;
  }

  let hasTitleBinding = false,
    hasAriaLabelBinding = false;

  for (const input of node.inputs) {
    hasTitleBinding = input.name === 'title';
    hasAriaLabelBinding = isAriaLabel(input.name);
  }

  if (hasTitleBinding || hasAriaLabelBinding) {
    return true;
  }

  return node.children.length > 0 && !!node.children[0].value;
}

/**
 * In this case, we check that the `<area>` element has an `alt` or `aria-label` attribute.
 * Otherwise, we check for the presence of `attr.alt` or `attr.aria-label` bindings.
 */
function isValidAreaNode(node: any): boolean {
  let hasAltAttribute = false,
    hasAriaLabelAttribute = false;

  for (const attribute of node.attributes) {
    hasAltAttribute = isAlt(attribute.name);
    hasAriaLabelAttribute = isAriaLabel(attribute.name);
  }

  // Note that we return "early" before looping through `element.inputs`.
  // Because if the element has an attribute, then we don't need to iterate
  // over the inputs unnecessarily.
  if (hasAltAttribute || hasAriaLabelAttribute) {
    return true;
  }

  let hasAltBinding = false,
    hasAriaLabelBinding = false;

  for (const input of node.inputs) {
    hasAltBinding = isAlt(input.name);
    hasAriaLabelBinding = isAriaLabel(input.name);
  }

  return hasAltBinding || hasAriaLabelBinding;
}

/**
 * In this case, we check that the `<input>` element has an `alt` or `aria-label` attribute.
 * Otherwise, we check for the presence of `attr.alt` or `attr.aria-label` bindings.
 */
function isValidInputNode(node: any): boolean {
  const typeAttribute = node.attributes.find(
    (attribute: any) => attribute.name === 'type',
  );

  const typeBinding = node.inputs.find((input: any) => input.name === 'type');

  const type: string | undefined = typeAttribute?.value || typeBinding?.value;
  // We are only interested in the `<input type="image">` elements.
  if (type !== 'image') {
    return true;
  } else {
    return isValidAreaNode(node);
  }
}

function isAriaLabel(name: string): name is 'aria-label' | 'aria-labelledby' {
  return name === 'aria-label' || name === 'aria-labelledby';
}

function isAlt(name: string): name is 'alt' {
  return name === 'alt';
}
