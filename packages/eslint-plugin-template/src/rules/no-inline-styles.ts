import type {
  ParseSourceSpan,
  TmplAstElement,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [
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
      recommended: false,
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
      Element$1(node: TmplAstElement) {
        let isInvalid = false;

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
 *  Check that the any element for example `<img>` has a `style` attribute or `attr.style` binding.
 */
function isNodeHasStyleAttribute(node: TmplAstElement): boolean {
  return (
    node.attributes.some(({ name }) => isStyle(name)) ||
    node.inputs.some(({ name }) => isStyle(name))
  );
}
/**
 *  Check that the any element for example `<img>` has a `ngStyle` attribute binding.
 */
function isNodeHasNgStyleAttribute(node: TmplAstElement): boolean {
  return node.inputs.some(({ name }) => isNgStyle(name));
}

/**
 *  Check that the any element for example `<img>` has a `[style.background-color]` attribute binding.
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
