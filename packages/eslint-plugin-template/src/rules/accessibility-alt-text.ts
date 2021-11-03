import type {
  Node,
  TmplAstElement,
} from '@angular-eslint/bundled-angular-compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { getAttributeValue } from '../utils/get-attribute-value';

type Options = [];
export type MessageIds = 'accessibilityAltText';
export const RULE_NAME = 'accessibility-alt-text';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforces alternate text for elements which require the alt, aria-label, aria-labelledby attributes.',
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
      'Element$1[name=/^(img|area|object|input)$/]'(node: TmplAstElement) {
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

function isValidNode(node: TmplAstElement): boolean {
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
function isValidImgNode(node: TmplAstElement): boolean {
  return (
    node.attributes.some(({ name }) => isAlt(name)) ||
    node.inputs.some(({ name }) => isAlt(name))
  );
}

/**
 * In this case, we check that the `<object>` element has a `title` or `aria-label` attribute.
 * Otherwise, we check for the presence of `attr.title` or `attr.aria-label` bindings.
 */
function isValidObjectNode(node: TmplAstElement): boolean {
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

  return (
    node.children.length > 0 &&
    !!(node.children[0] as unknown as Node & { value?: unknown }).value
  );
}

/**
 * In this case, we check that the `<area>` element has an `alt` or `aria-label` attribute.
 * Otherwise, we check for the presence of `attr.alt` or `attr.aria-label` bindings.
 */
function isValidAreaNode(node: TmplAstElement): boolean {
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
function isValidInputNode(node: TmplAstElement): boolean {
  const type = getAttributeValue(node, 'type');
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
