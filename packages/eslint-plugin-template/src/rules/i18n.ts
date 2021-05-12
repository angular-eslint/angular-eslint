import type { AST } from '@angular/compiler';
import {
  ASTWithSource,
  Interpolation,
  TmplAstBoundText,
  TmplAstElement,
  TmplAstTemplate,
  TmplAstText,
} from '@angular/compiler';
import type {
  Message,
  Node as I18nNode,
} from '@angular/compiler/src/i18n/i18n_ast';
import type { Node } from '@angular/compiler/src/render3/r3_ast';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

const DEFAULT_BOUND_TEXT_ALLOWED_PATTERN = /[a-z]/i;
const SAFELIST_ATTRIBUTES: ReadonlySet<string> = new Set([
  'charset',
  'class',
  'color',
  'colspan',
  'fill',
  'formControlName',
  'height',
  'href',
  'id',
  'lang',
  'src',
  'stroke',
  'stroke-width',
  'style',
  'svgIcon',
  'tabindex',
  'target',
  'type',
  'viewBox',
  'width',
  'xmlns',
]);

type Options = [
  {
    readonly boundTextAllowedPattern?: string;
    readonly checkId?: boolean;
    readonly checkText?: boolean;
    readonly checkAttributes?: boolean;
    readonly ignoreAttributes?: readonly string[];
    readonly ignoreTags?: readonly string[];
  },
];
export type MessageIds =
  | 'i18nAttribute'
  | 'i18nId'
  | 'i18nIdOnAttribute'
  | 'i18nSuggestIgnore'
  | 'i18nText';
export const RULE_NAME = 'i18n';
const DEFAULT_OPTIONS: Options[0] = {
  checkAttributes: true,
  checkId: true,
  checkText: true,
  ignoreAttributes: [...SAFELIST_ATTRIBUTES],
};
const STYLE_GUIDE_LINK = 'https://angular.io/guide/i18n';
const STYLE_GUIDE_I18N_ATTRIBUTE_LINK = `${STYLE_GUIDE_LINK}#translate-attributes`;
const STYLE_GUIDE_I18N_ATTRIBUTE_ID_LINK = `${STYLE_GUIDE_LINK}#use-a-custom-id-with-a-description`;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Helps to ensure following best practices for i18n. ' +
        'Checks for missing i18n attributes on elements and non-ignored attributes ' +
        'containing text. Can also highlight tags that do not use custom ID (@@) feature. ',
      category: 'Best Practices',
      recommended: false,
      suggestion: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          boundTextAllowedPattern: {
            type: 'string',
          },
          checkId: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.checkId,
          },
          checkText: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.checkText,
          },
          checkAttributes: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.checkAttributes,
          },
          ignoreAttributes: {
            type: 'array',
            items: {
              type: 'string',
            },
            default: [...SAFELIST_ATTRIBUTES],
          },
          ignoreTags: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      i18nAttribute: `Attribute '{{attributeName}}' has no corresponding i18n attribute. See more at ${STYLE_GUIDE_I18N_ATTRIBUTE_LINK}`,
      i18nId: `Missing custom message identifier. See more at ${STYLE_GUIDE_I18N_ATTRIBUTE_ID_LINK}`,
      i18nIdOnAttribute: `Missing custom message identifier on attribute "{{attributeName}}". See more at ${STYLE_GUIDE_I18N_ATTRIBUTE_ID_LINK}`,
      i18nSuggestIgnore:
        'Add the attribute name "{{attributeName}}" to the `ignoreAttributes` option in the eslint config',
      i18nText: `Each element containing text node should have an i18n attribute. See more at ${STYLE_GUIDE_LINK}`,
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(
    context,
    [
      {
        boundTextAllowedPattern,
        checkAttributes,
        checkId,
        checkText,
        ignoreAttributes,
        ignoreTags,
      },
    ],
  ) {
    const parserServices = getTemplateParserServices(context);
    const sourceCode = context.getSourceCode();
    const safeBoundTextAllowedPattern = RegExp(
      boundTextAllowedPattern ?? DEFAULT_BOUND_TEXT_ALLOWED_PATTERN,
    );
    const safeAttributes: ReadonlySet<string> = new Set([
      ...SAFELIST_ATTRIBUTES,
      ...(ignoreAttributes ?? []),
    ]);
    const safeTags: ReadonlySet<string> = new Set(ignoreTags);

    function hasI18nCustomId(node: Message | I18nNode) {
      return (node as Message).customId;
    }

    function isValidIdNode(node: AST | undefined, i18n: Message | I18nNode) {
      return !(
        (node instanceof TmplAstElement || node instanceof TmplAstTemplate) &&
        !node?.i18n &&
        !hasI18nCustomId(i18n)
      );
    }

    function isInvalidTextNode(node: Node) {
      return (
        (node instanceof TmplAstText && /\S/.test(node.value)) ||
        (node instanceof TmplAstBoundText &&
          node.value instanceof ASTWithSource &&
          node.value.ast instanceof Interpolation &&
          safeBoundTextAllowedPattern.test(
            node.value.ast.strings.join('').trim(),
          ))
      );
    }

    function isSafeAttribute(
      tagName: string,
      attributeName: string,
      attributeValue: string,
    ) {
      return (
        safeAttributes.has(attributeName) ||
        safeAttributes.has(`${tagName}[${attributeName}]`) ||
        attributeValue.trim().length === 0 ||
        attributeValue === 'true' ||
        attributeValue === 'false'
      );
    }

    function handleNode(
      {
        attributes,
        children,
        i18n,
        parent,
        sourceSpan,
      }: (TmplAstElement | TmplAstTemplate) & { parent?: AST },
      tagName: string,
    ) {
      const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

      for (const {
        i18n: attributeI18n,
        name: attributeName,
        value: attributeValue,
      } of attributes) {
        if (attributeI18n) {
          if (checkId && !hasI18nCustomId(attributeI18n)) {
            context.report({
              messageId: 'i18nIdOnAttribute',
              loc,
              data: { attributeName },
            });
          }

          continue;
        }

        if (
          checkAttributes &&
          isSafeAttribute(tagName, attributeName, attributeValue)
        ) {
          continue;
        }

        context.report({
          messageId: 'i18nAttribute',
          loc,
          data: { attributeName },
          fix: (fixer) => {
            const startIndex = sourceCode.getIndexFromLoc(loc.start);
            const insertIndex = startIndex + 1 + tagName.length;
            return fixer.replaceTextRange(
              [insertIndex, insertIndex],
              ` i18n-${attributeName}`,
            );
          },
          suggest: [
            {
              messageId: 'i18nSuggestIgnore',
              data: { attributeName },
              // Little bit of a hack as VSCode ignores suggestions with no fix!?
              fix: (fixer) => fixer.insertTextBeforeRange([0, 0], ''),
            },
          ],
        });
      }

      if (i18n) {
        if (checkId && !isValidIdNode(parent, i18n)) {
          context.report({
            messageId: 'i18nId',
            loc,
          });
        }
      } else if (checkText && children.some(isInvalidTextNode)) {
        context.report({
          messageId: 'i18nText',
          loc,
        });
      }
    }

    return {
      Element(node: TmplAstElement & { parent?: AST }) {
        if (safeTags.has(node.name)) return;
        handleNode(node, node.name);
      },
      Template(node: TmplAstTemplate & { parent?: AST }) {
        handleNode(node, node.tagName);
      },
    };
  },
});
