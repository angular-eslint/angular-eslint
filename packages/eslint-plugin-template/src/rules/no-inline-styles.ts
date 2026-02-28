import type {
  ParseSourceSpan,
  TmplAstElement,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [
  {
    readonly allowNgStyle?: boolean;
    readonly allowBindToStyle?: boolean;
  },
];
const DEFAULT_OPTIONS: Options[number] = {
  allowNgStyle: false,
  allowBindToStyle: false,
};
export type MessageIds = 'noInlineStyles';
export const RULE_NAME = 'no-inline-styles';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows the use of inline styles in HTML templates',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowNgStyle: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.allowNgStyle,
          },
          allowBindToStyle: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.allowBindToStyle,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noInlineStyles:
        '<{{element}}/> element should not have inline styles via style attribute. Please use classes instead.',
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, [{ allowNgStyle, allowBindToStyle }]) {
    const parserServices = getTemplateParserServices(context);

    return {
      Element(node: TmplAstElement) {
        let isInvalid: boolean;

        if (!allowNgStyle && !allowBindToStyle) {
          isInvalid =
            isNodeHasStyleAttribute(node) ||
            isNodeHasNgStyleAttribute(node) ||
            isNodeHasBindingToStyleAttribute(node);
        } else {
          const ngStyle = allowNgStyle
            ? false
            : isNodeHasNgStyleAttribute(node);
          const bindToStyle = allowBindToStyle
            ? false
            : isNodeHasBindingToStyleAttribute(node);

          isInvalid = isNodeHasStyleAttribute(node) || ngStyle || bindToStyle;
        }

        if (isInvalid) {
          const loc = parserServices.convertElementSourceSpanToLoc(
            context,
            node,
          );

          context.report({
            loc,
            messageId: 'noInlineStyles',
            data: {
              element: node.name,
            },
          });
        }
      },
    };
  },
});

/**
 *  Check that an element (for example `<img>`) has a `style` attribute or `attr.style` binding.
 */
function isNodeHasStyleAttribute(node: TmplAstElement): boolean {
  return (
    node.attributes.some(({ name }) => isStyle(name)) ||
    node.inputs.some(({ name }) => isStyle(name))
  );
}
/**
 *  Check that an element (for example `<img>`) has a `ngStyle` attribute binding.
 */
function isNodeHasNgStyleAttribute(node: TmplAstElement): boolean {
  return node.inputs.some(({ name }) => isNgStyle(name));
}

/**
 *  Check that an element (for example `<img>`) has a `[style.background-color]` attribute binding.
 */
function isNodeHasBindingToStyleAttribute(node: TmplAstElement): boolean {
  return node.inputs.some(({ keySpan }) => isStyleBound(keySpan));
}

/**
 *  Check element is style
 */
function isStyle(name: string): name is 'style' {
  return name === 'style';
}

function isNgStyle(name: string): name is 'ngStyle' {
  return name === 'ngStyle';
}

function isStyleBound(keySpan: ParseSourceSpan): boolean {
  return keySpan?.details ? keySpan.details.includes('style.') : false;
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Inline styles in templates (style attribute, ngStyle directive, or [style.property] bindings) make it difficult to maintain consistent styling across an application and can violate Content Security Policy (CSP) restrictions. Styles should be defined in component stylesheets or CSS classes where they can be managed centrally, reused, cached by browsers, and easily modified. Inline styles also mix presentation concerns with template structure, making templates harder to read. Using CSS classes with [class] or [ngClass] bindings provides the same dynamic styling capabilities while keeping styles organized and maintainable. This rule can be configured to allow ngStyle or style bindings if needed for specific use cases.',
};
