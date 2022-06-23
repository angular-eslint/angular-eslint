import type {
  AST,
  ASTWithSource,
  Interpolation,
  ParseSourceSpan,
  TmplAstIcu,
  TmplAstText,
  TmplAstTextAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import {
  TmplAstBoundText,
  TmplAstElement,
} from '@angular-eslint/bundled-angular-compiler';
import type { Message } from '@angular-eslint/bundled-angular-compiler';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { getNearestNodeFrom } from '../utils/get-nearest-node-from';

// source: https://github.com/yury-dymov/js-regex-pl/blob/ff10757b2a98ad0bf0f62acebad085bab3748fc4/src/index.js#L7
const PL_PATTERN =
  /[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7C6\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB67\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/;
const DEFAULT_ALLOWED_BOUND_TEXT_PATTERN = new RegExp(`[^${PL_PATTERN}]`);
const DEFAULT_ALLOWED_ATTRIBUTES: ReadonlySet<string> = new Set([
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
  'ngClass',
  'ngProjectAs',
  'routerLink',
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
    readonly checkAttributes?: boolean;
    readonly checkDuplicateId?: boolean;
    readonly checkId?: boolean;
    readonly checkText?: boolean;
    readonly ignoreAttributes?: readonly string[];
    readonly ignoreTags?: readonly string[];
    readonly requireDescription?: boolean;
  },
];
export type MessageIds =
  | 'i18nAttribute'
  | 'i18nAttributeOnIcuOrText'
  | 'i18nCustomIdOnAttribute'
  | 'i18nCustomIdOnElement'
  | 'i18nDuplicateCustomId'
  | 'suggestAddI18nAttribute'
  | 'i18nMissingDescription';
type StronglyTypedElement = Omit<TmplAstElement, 'i18n'> & {
  i18n: Message;
  parent?: AST;
};
type StronglyTypedTextAttribute = Omit<TmplAstTextAttribute, 'i18n'> & {
  i18n?: Message;
  parent: TmplAstElement;
};
type StronglyTypedBoundText = TmplAstBoundText & {
  value: ASTWithSource & { ast: Interpolation };
};
type StronglyTypedBoundTextOrIcuOrText = (
  | StronglyTypedBoundText
  | TmplAstText
  | TmplAstIcu
) & {
  parent?: AST & { children: readonly AST[] };
};
export const RULE_NAME = 'i18n';
const DEFAULT_OPTIONS: Options[number] = {
  checkAttributes: true,
  checkId: true,
  checkDuplicateId: true,
  checkText: true,
  ignoreAttributes: [...DEFAULT_ALLOWED_ATTRIBUTES],
};
const STYLE_GUIDE_LINK = 'https://angular.io/guide/i18n';
const STYLE_GUIDE_LINK_ATTRIBUTES = `${STYLE_GUIDE_LINK}#mark-element-attributes-for-translations`;
const STYLE_GUIDE_LINK_ICU = `${STYLE_GUIDE_LINK}#mark-plurals-and-alternates-for-translation`;
const STYLE_GUIDE_LINK_TEXTS = `${STYLE_GUIDE_LINK}#mark-text-for-translations`;
const STYLE_GUIDE_LINK_CUSTOM_IDS = `${STYLE_GUIDE_LINK}#manage-marked-text-with-custom-ids`;
const STYLE_GUIDE_LINK_UNIQUE_CUSTOM_IDS = `${STYLE_GUIDE_LINK}#define-unique-custom-ids`;
const STYLE_GUIDE_LINK_COMMON_PREPARE = `${STYLE_GUIDE_LINK}-common-prepare`;
const STYLE_GUIDE_LINK_METADATA_FOR_TRANSLATION = `${STYLE_GUIDE_LINK_COMMON_PREPARE}#i18n-metadata-for-translation`;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures following best practices for i18n. ' +
        'Checks for missing i18n attributes on elements and attributes containing ' +
        'texts. ' +
        'Can also check for texts without i18n attribute, elements that do not ' +
        'use custom ID (@@) feature and duplicate custom IDs',
      recommended: false,
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          boundTextAllowedPattern: {
            type: 'string',
          },
          checkAttributes: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.checkAttributes,
          },
          checkDuplicateId: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.checkDuplicateId,
          },
          checkId: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.checkId,
          },
          checkText: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.checkText,
          },
          ignoreAttributes: {
            type: 'array',
            items: {
              type: 'string',
            },
            default: [...DEFAULT_ALLOWED_ATTRIBUTES],
          },
          ignoreTags: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          requireDescription: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.requireDescription,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      i18nAttribute: `Attribute "{{attributeName}}" has no corresponding i18n attribute. See more at ${STYLE_GUIDE_LINK_ATTRIBUTES}`,
      i18nAttributeOnIcuOrText: `Each element containing text node should have an i18n attribute. See more at ${STYLE_GUIDE_LINK_ICU} and ${STYLE_GUIDE_LINK_TEXTS}`,
      i18nCustomIdOnAttribute: `Missing custom ID on attribute "i18n-{{attributeName}}". See more at ${STYLE_GUIDE_LINK_CUSTOM_IDS}`,
      i18nCustomIdOnElement: `Missing custom ID on element. See more at ${STYLE_GUIDE_LINK_CUSTOM_IDS}`,
      i18nDuplicateCustomId: `Duplicate custom ID "@@{{customId}}". See more at ${STYLE_GUIDE_LINK_UNIQUE_CUSTOM_IDS}`,
      suggestAddI18nAttribute: 'Add the `i18n` attribute',
      i18nMissingDescription: `Missing i18n description on element. See more at ${STYLE_GUIDE_LINK_METADATA_FOR_TRANSLATION}`,
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
        checkDuplicateId,
        checkText,
        ignoreAttributes,
        ignoreTags,
        requireDescription,
      },
    ],
  ) {
    const parserServices = getTemplateParserServices(context);
    const sourceCode = context.getSourceCode();
    const allowedBoundTextPattern = boundTextAllowedPattern
      ? new RegExp(boundTextAllowedPattern)
      : DEFAULT_ALLOWED_BOUND_TEXT_PATTERN;
    const allowedAttributes: ReadonlySet<string> = new Set([
      ...DEFAULT_ALLOWED_ATTRIBUTES,
      ...(ignoreAttributes ?? []),
    ]);
    const allowedTags: ReadonlySet<string> = new Set(ignoreTags);
    const collectedCustomIds = new Map<string, readonly ParseSourceSpan[]>();

    function handleElement({
      i18n: { description, customId },
      name,
      parent,
      sourceSpan,
    }: StronglyTypedElement) {
      if (allowedTags.has(name) || isElementWithI18n(parent)) {
        return;
      }

      const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

      if (checkId) {
        if (isEmpty(customId)) {
          context.report({
            messageId: 'i18nCustomIdOnElement',
            loc,
          });
        } else {
          const sourceSpans = collectedCustomIds.get(customId) ?? [];
          collectedCustomIds.set(customId, [...sourceSpans, sourceSpan]);
        }
      }

      if (requireDescription && isEmpty(description)) {
        context.report({
          messageId: 'i18nMissingDescription',
          loc,
        });
      }
    }

    function handleTextAttribute({
      i18n,
      keySpan,
      name: attributeName,
      parent: { name: elementName },
      sourceSpan,
      value,
    }: StronglyTypedTextAttribute) {
      if (allowedTags.has(elementName)) {
        return;
      }

      const keyOrSourceSpanLoc = parserServices.convertNodeSourceSpanToLoc(
        keySpan ?? sourceSpan,
      );

      if (i18n) {
        const { customId, description } = i18n;

        if (checkId) {
          if (isEmpty(customId)) {
            context.report({
              messageId: 'i18nCustomIdOnAttribute',
              loc: keyOrSourceSpanLoc,
              data: { attributeName },
            });
          } else {
            const sourceSpans = collectedCustomIds.get(customId) ?? [];
            collectedCustomIds.set(customId, [...sourceSpans, sourceSpan]);
          }
        }

        if (requireDescription && isEmpty(description)) {
          context.report({
            messageId: 'i18nMissingDescription',
            loc: keyOrSourceSpanLoc,
            data: { attributeName },
          });
        }
      }

      if (
        i18n ||
        !checkAttributes ||
        isAttributeAllowed(allowedAttributes, elementName, attributeName, value)
      ) {
        return;
      }

      context.report({
        messageId: 'i18nAttribute',
        loc: keyOrSourceSpanLoc,
        data: { attributeName },
        fix: (fixer) => {
          const { end } = parserServices.convertNodeSourceSpanToLoc(sourceSpan);
          const endIndex = sourceCode.getIndexFromLoc(end);
          return fixer.insertTextAfterRange(
            [endIndex, endIndex],
            ` i18n-${attributeName}`,
          );
        },
      });
    }

    function handleBoundTextOrIcuOrText(
      node: StronglyTypedBoundTextOrIcuOrText,
    ) {
      const { parent, sourceSpan } = node;

      if (
        (isBoundText(node) &&
          isBoundTextAllowed(allowedBoundTextPattern, node)) ||
        (isElement(parent) && (parent.i18n || allowedTags.has(parent.name)))
      ) {
        return;
      }

      const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);
      const fix: TSESLint.ReportFixFunction = (fixer) =>
        getFixForIcuOrText(sourceCode, parserServices, fixer, loc, parent);
      context.report({
        messageId: 'i18nAttributeOnIcuOrText',
        loc,
        ...(parent?.children?.filter(isElement).length
          ? { suggest: [{ messageId: 'suggestAddI18nAttribute', fix }] }
          : { fix }),
      });
    }

    function reportDuplicatedCustomIds() {
      if (checkDuplicateId) {
        for (const [customId, sourceSpans] of collectedCustomIds) {
          if (sourceSpans.length <= 1) {
            break;
          }

          for (const sourceSpan of sourceSpans) {
            const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);
            context.report({
              messageId: 'i18nDuplicateCustomId',
              loc,
              data: { customId },
            });
          }
        }
      }

      collectedCustomIds.clear();
    }

    return {
      ...((checkId || requireDescription) && {
        'Element$1[i18n]'(node: StronglyTypedElement) {
          handleElement(node);
        },
      }),
      ...((checkAttributes || checkId || requireDescription) && {
        [`Element$1 > TextAttribute[value=${PL_PATTERN}]`](
          node: StronglyTypedTextAttribute,
        ) {
          handleTextAttribute(node);
        },
      }),
      ...(checkText && {
        [`BoundText, Icu$1, Text$3[value=${PL_PATTERN}]`](
          node: StronglyTypedBoundTextOrIcuOrText,
        ) {
          handleBoundTextOrIcuOrText(node);
        },
      }),
      'Program:exit'() {
        reportDuplicatedCustomIds();
      },
    };
  },
});

function getFixForIcuOrTextWithParent(
  sourceCode: Readonly<TSESLint.SourceCode>,
  fixer: TSESLint.RuleFixer,
  { start }: TSESTree.SourceLocation,
  elementName: string,
): TSESLint.RuleFix {
  const startIndex = sourceCode.getIndexFromLoc(start);
  const insertIndex = startIndex + elementName.length + 1;
  return fixer.insertTextAfterRange([insertIndex, insertIndex], ' i18n');
}

function getFixForIcuOrTextWithoutParent(
  sourceCode: Readonly<TSESLint.SourceCode>,
  fixer: TSESLint.RuleFixer,
  { start, end }: TSESTree.SourceLocation,
): TSESLint.RuleFix[] {
  const startIndex = sourceCode.getIndexFromLoc(start);
  const endIndex = sourceCode.getIndexFromLoc(end);
  return [
    fixer.insertTextBeforeRange(
      [startIndex, startIndex],
      '<ng-container i18n>',
    ),
    fixer.insertTextAfterRange([endIndex, endIndex], '</ng-container>'),
  ];
}

function getFixForIcuOrText(
  sourceCode: Readonly<TSESLint.SourceCode>,
  parserServices: ReturnType<typeof getTemplateParserServices>,
  fixer: TSESLint.RuleFixer,
  loc: TSESTree.SourceLocation,
  parent?: AST,
) {
  if (!isElement(parent)) {
    return getFixForIcuOrTextWithoutParent(sourceCode, fixer, loc);
  }

  if (getNearestNodeFrom(parent, isElementWithI18n)) {
    return [];
  }

  const parentLoc = parserServices.convertNodeSourceSpanToLoc(
    parent.sourceSpan,
  );
  return getFixForIcuOrTextWithParent(
    sourceCode,
    fixer,
    parentLoc,
    parent.name,
  );
}

function isBoundText(ast: unknown): ast is TmplAstBoundText {
  return ast instanceof TmplAstBoundText;
}

function isElement(ast: unknown): ast is TmplAstElement {
  return ast instanceof TmplAstElement;
}

function isElementWithI18n(ast: unknown): ast is StronglyTypedElement {
  return Boolean(isElement(ast) && ast.i18n);
}

function isBooleanLike(value: string): value is 'false' | 'true' {
  return value === 'false' || value === 'true';
}

function isEmpty(value: string) {
  if (value) {
    return value.trim().length === 0;
  }

  return true;
}

function isNumeric(value: string) {
  const valueAsFloat = Number.parseFloat(value);
  return !Number.isNaN(valueAsFloat) && Number.isFinite(valueAsFloat);
}

function isAttributeAllowed(
  allowedAttributes: ReadonlySet<string>,
  elementName: string,
  attributeName: string,
  attributeValue: string,
) {
  return (
    allowedAttributes.has(attributeName) ||
    allowedAttributes.has(`${elementName}[${attributeName}]`) ||
    isEmpty(attributeValue) ||
    isBooleanLike(attributeValue) ||
    isNumeric(attributeValue)
  );
}

// A `BoundText` is considered "allowed" if it doesn't contain letters (including latin characters) or if it was deliberately allowed via `boundTextAllowedPattern` option.
function isBoundTextAllowed(
  allowedBoundTextPattern: RegExp,
  {
    value: {
      ast: { strings },
    },
  }: StronglyTypedBoundText,
) {
  const text = strings.join('').trim();
  return !PL_PATTERN.test(text) || allowedBoundTextPattern.test(text);
}
