import {
  type AST,
  BindingType,
  type TmplAstElement,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { isConstantExpression } from '../utils/is-constant-expression';

/**
 * - `false`: never allowed.
 * - `true`: always allowed.
 * - `'dynamic'`: allowed only when the bound value is not a constant
 *   (a literal, or an expression built exclusively from literals). Constant
 *   values could live in a stylesheet, so they are still reported.
 */
export type AllowOption = boolean | 'dynamic';

export type Options = [
  {
    readonly allowNgStyle?: AllowOption;
    readonly allowBindToStyle?: AllowOption;
  },
];
const DEFAULT_OPTIONS: Options[number] = {
  allowNgStyle: false,
  allowBindToStyle: false,
};
export type MessageIds = 'noInlineStyles';
export const RULE_NAME = 'no-inline-styles';

type InputWithOriginalType = TmplAstElement['inputs'][number] & {
  readonly __originalType?: BindingType;
};

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
            oneOf: [{ type: 'boolean' }, { type: 'string', enum: ['dynamic'] }],
            description:
              'Whether `[ngStyle]` bindings are allowed. `true` allows them unconditionally. `"dynamic"` allows them only when the bound value is not a constant (e.g. `{ color: textColor }` is allowed, but `{ color: \'red\' }` is reported because it could be a class).',
            default: DEFAULT_OPTIONS.allowNgStyle,
          },
          allowBindToStyle: {
            oneOf: [{ type: 'boolean' }, { type: 'string', enum: ['dynamic'] }],
            description:
              'Whether `[style]`, `[style.property]` and `style="{{ }}"` bindings are allowed. `true` allows them unconditionally. `"dynamic"` allows them only when the bound value is not a constant (e.g. `[style.width.px]="column.width"` is allowed, but `[style.color]="\'red\'"` is reported because it could be a class).',
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
    defaultOptions: [DEFAULT_OPTIONS],
  },
  create(context, [{ allowNgStyle, allowBindToStyle }]) {
    const parserServices = getTemplateParserServices(context);

    return {
      Element(node: TmplAstElement) {
        const hasDisallowedInput = node.inputs.some((input) => {
          const { __originalType: originalType, type } =
            input as InputWithOriginalType;

          switch (originalType ?? type) {
            case BindingType.Attribute:
              return input.name === 'style';
            case BindingType.Style:
              return !isAllowed(allowBindToStyle, input.value);
            case BindingType.Property:
              if (input.name === 'style') {
                return !isAllowed(allowBindToStyle, input.value);
              }
              if (input.name === 'ngStyle') {
                return !isAllowed(allowNgStyle, input.value);
              }
              return false;
            default:
              return false;
          }
        });
        const isInvalid =
          node.attributes.some(({ name }) => name === 'style') ||
          hasDisallowedInput;

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

function isAllowed(option: AllowOption | undefined, value: AST): boolean {
  if (option === 'dynamic') {
    return !isConstantExpression(value);
  }
  return option === true;
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Inline styles in templates (style attribute, ngStyle directive, [style] bindings, or [style.property] bindings) make it difficult to maintain consistent styling across an application and can violate Content Security Policy (CSP) restrictions. Styles should be defined in component stylesheets or CSS classes where they can be managed centrally, reused, cached by browsers, and easily modified. Inline styles also mix presentation concerns with template structure, making templates harder to read. Using CSS classes with [class] or [ngClass] bindings provides the same dynamic styling capabilities while keeping styles organized and maintainable. This rule can be configured to allow ngStyle or style bindings if needed for specific use cases. Setting an option to "dynamic" allows a binding only when its value cannot be known ahead of time (for example `[style.width.px]="column.width"`), while still reporting bindings whose value is a constant (for example `[style.color]="\'red\'"`), since those could be expressed as a class instead.',
};
