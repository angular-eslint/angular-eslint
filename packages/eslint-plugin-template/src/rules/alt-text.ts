import type {
  Node,
  TmplAstElement,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getAttributeValue } from '../utils/get-attribute-value';

export type Options = [];
export type MessageIds = 'altText';
export const RULE_NAME = 'alt-text';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        '[Accessibility] Enforces alternate text for elements which require the alt, aria-label, aria-labelledby attributes.',
    },
    schema: [],
    messages: {
      altText: '<{{element}}/> element must have a text alternative.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'Element[name=/^(img|area|object|input)$/i]'(node: TmplAstElement) {
        const isValid = isValidNode(node);

        if (!isValid) {
          const loc = parserServices.convertElementSourceSpanToLoc(
            context,
            node,
          );

          context.report({
            loc,
            messageId: 'altText',
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
  const tagName = node.name.toLowerCase();
  if (tagName === 'img') {
    return isValidImgNode(node);
  } else if (tagName === 'object') {
    return isValidObjectNode(node);
  } else if (tagName === 'area') {
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
    hasTitleAttribute = hasTitleAttribute || attribute.name === 'title';
    hasAriaLabelAttribute =
      hasAriaLabelAttribute || isAriaLabel(attribute.name);
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
    hasTitleBinding = hasTitleBinding || input.name === 'title';
    hasAriaLabelBinding = hasAriaLabelBinding || isAriaLabel(input.name);
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
    hasAltAttribute = hasAltAttribute || isAlt(attribute.name);
    hasAriaLabelAttribute =
      hasAriaLabelAttribute || isAriaLabel(attribute.name);
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
    hasAltBinding = hasAltBinding || isAlt(input.name);
    hasAriaLabelBinding = hasAriaLabelBinding || isAriaLabel(input.name);
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

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Images, area elements, and input buttons must have alternative text for accessibility. Screen readers used by blind and visually impaired users rely on alt text to describe images. Without alt text, these users miss important content and context. Decorative images should have an empty alt attribute (alt=\"\") to signal they can be safely ignored by screen readers. Meaningful images require descriptive alt text that conveys the image\'s content and purpose. This is a WCAG Level A requirement, meaning it\'s a basic accessibility standard.',
};
