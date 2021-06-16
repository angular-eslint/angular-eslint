import type {
  TmplAstBoundAttribute,
  TmplAstTextAttribute,
} from '@angular/compiler';
import { TmplAstElement } from '@angular/compiler';
import type { TSESLint } from '@typescript-eslint/experimental-utils';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { hasAccessibleChild } from '../utils/has-accessible-child';
import {
  attribute,
  binaryOrNullableAttribute,
  emptyOrNullableAttribute,
} from '../utils/selectors';

type Options = [];
export type MessageIds =
  | 'altTextArea'
  | 'altTextImg'
  | 'altTextImgWithPresentationRole'
  | 'altTextInput'
  | 'altTextObject'
  | 'altTextWithBinaryOrEmptyOrNullableAriaLabel'
  | 'altTextWithBinaryOrNullableAlt'
  | 'suggestReplaceWithEmptyAlt';
export const RULE_NAME = 'accessibility-alt-text';
const STYLE_GUIDE_AREA_LINK =
  'https://www.w3.org/TR/WCAG20-TECHS/H24.html and https://dequeuniversity.com/rules/axe/3.2/area-alt';
const STYLE_GUIDE_IMG_LINK =
  'https://www.w3.org/TR/WCAG20-TECHS/H37.html and https://dequeuniversity.com/rules/axe/3.2/image-alt';
const STYLE_GUIDE_INPUT_LINK =
  'https://www.w3.org/TR/WCAG20-TECHS/H36.html and https://dequeuniversity.com/rules/axe/3.2/input-image-alt';
const STYLE_GUIDE_OBJECT_LINK =
  'https://dequeuniversity.com/rules/axe/3.2/object-alt';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures alternate text for elements which require the `alt`, `aria-label`, `aria-labelledby` or `title` attribute',
      category: 'Best Practices',
      recommended: false,
      suggestion: true,
    },
    schema: [],
    messages: {
      altTextArea: `Each \`area\` within an image map should have alternate text by providing a meaningful text through \`alt\` (can be empty for decorative images), \`aria-label\` or \`aria-labelledby\` attribute. See more at ${STYLE_GUIDE_AREA_LINK}`,
      altTextImg: `\`<img>\` element should have alternate text by providing a meaningful text through \`alt\` (can be empty for decorative images), \`aria-label\` or \`aria-labelledby\` attribute. See more at ${STYLE_GUIDE_IMG_LINK}`,
      altTextWithBinaryOrEmptyOrNullableAriaLabel: `The \`{{ariaAttributeName}}\` attribute should have a value. The \`alt\` attribute is preferred over \`{{ariaAttributeName}}\` for images`,
      altTextWithBinaryOrNullableAlt:
        'The `alt` attribute should have a value (use `alt=""` for decorative images)',
      altTextImgWithPresentationRole: `Prefer \`alt=""\` over a presentation role. First rule of aria is to not use aria if it can be achieved via native HTML`,
      altTextInput: `\`<input type="image">\` element should have alternate text by providing a meaningful text through \`alt\` (can be empty for decorative images), \`aria-label\` or \`aria-labelledby\` attribute. See more at ${STYLE_GUIDE_INPUT_LINK}`,
      altTextObject: `Embedded \`<object>\` element should have  alternate text by either providing a meaningful text through \`aria-label\`, \`aria-labelledby\` or \`title\` attribute, inner text or accessible child. See more at ${STYLE_GUIDE_OBJECT_LINK}`,
      suggestReplaceWithEmptyAlt: 'Use `alt=""`',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const ariaLabelPattern = /^aria-label(ledby)?$/;
    const objectContentPattern =
      /^(aria-label(ledby)?|(inner)(Html|HTML|Text)|outerHTML|title)$/;
    const presentationRolePattern = /^(none|presentation)$/;
    const altAttribute = attribute('alt');
    const ariaLabelAttribute = attribute(ariaLabelPattern);
    const contentObjectAttribute = attribute(objectContentPattern);
    const inputImageAttribute = attribute('type', 'image');
    const binaryOrNullableAltAttribute = binaryOrNullableAttribute('alt');
    const binaryOrNullableAriaLabelAttribute =
      binaryOrNullableAttribute(ariaLabelPattern);
    const presentationRoleAttribute = attribute(
      'role',
      presentationRolePattern,
    );
    const emptyOrNullableAriaLabelAttribute =
      emptyOrNullableAttribute(ariaLabelPattern);
    const emptyOrNullableObjectContentAttribute =
      emptyOrNullableAttribute(objectContentPattern);
    const areaSelector = 'Element[name="area"]';
    const imgSelector = 'Element[name="img"]';
    const inputImageSelector =
      `Element[name='input']:has(${inputImageAttribute})` as const;
    const areaWithoutAccessibilitySelector =
      `${areaSelector}:not(:has(${altAttribute}, ${ariaLabelAttribute}))` as const;
    const imgWithoutAccessibilitySelector =
      `${imgSelector}:not(:has(${presentationRoleAttribute}, ${altAttribute}, ${ariaLabelAttribute}))` as const;
    const imgWithPresentationRoleSelector =
      `${imgSelector}:not(:has(${altAttribute})) > ${presentationRoleAttribute}` as const;
    const inputImageWithoutAccessibilitySelector =
      `${inputImageSelector}:not(:has(${altAttribute}, ${ariaLabelAttribute}))` as const;
    const objectSelector =
      `:matches(Element[name='object'] > ${emptyOrNullableObjectContentAttribute}, Element[name='object']:not(:has(${contentObjectAttribute})))` as const;
    const withBinaryOrEmptyOrNullableAriaLabelSelector =
      `:matches(${imgSelector}:not(:has(${altAttribute}, ${presentationRoleAttribute})) > ${emptyOrNullableAriaLabelAttribute}, :matches(${areaSelector}, ${inputImageSelector}) > :matches(${emptyOrNullableAriaLabelAttribute}, ${binaryOrNullableAriaLabelAttribute}))` as const;
    const withBinaryOrNullableAltSelector =
      `:matches(${areaSelector}, ${imgSelector}, ${inputImageSelector}) > ${binaryOrNullableAltAttribute}` as const;

    function reportFor(
      node: TmplAstElement | TmplAstBoundAttribute | TmplAstTextAttribute,
      messageId: MessageIds,
      reportDescriptor?: Omit<
        TSESLint.ReportDescriptor<MessageIds>,
        'loc' | 'messageId' | 'node'
      >,
    ) {
      const loc =
        node instanceof TmplAstElement
          ? parserServices.convertElementSourceSpanToLoc(context, node)
          : parserServices.convertNodeSourceSpanToLoc(node.sourceSpan);
      context.report({ ...reportDescriptor, loc, messageId });
    }

    return {
      [areaWithoutAccessibilitySelector](node: TmplAstElement) {
        reportFor(node, 'altTextArea');
      },
      [imgWithoutAccessibilitySelector](node: TmplAstElement) {
        reportFor(node, 'altTextImg');
      },
      [imgWithPresentationRoleSelector](
        node: TmplAstBoundAttribute | TmplAstTextAttribute,
      ) {
        reportFor(node, 'altTextImgWithPresentationRole', {
          suggest: [
            {
              messageId: 'suggestReplaceWithEmptyAlt',
              fix: (fixer) => getFix(fixer, node),
            },
          ],
        });
      },
      [inputImageWithoutAccessibilitySelector](node: TmplAstElement) {
        reportFor(node, 'altTextInput');
      },
      [objectSelector](
        node: TmplAstElement | TmplAstBoundAttribute | TmplAstTextAttribute,
      ) {
        if (node instanceof TmplAstElement && hasAccessibleChild(node)) {
          return;
        }

        reportFor(node, 'altTextObject');
      },
      [withBinaryOrEmptyOrNullableAriaLabelSelector](
        node: TmplAstBoundAttribute | TmplAstTextAttribute,
      ) {
        reportFor(node, 'altTextWithBinaryOrEmptyOrNullableAriaLabel', {
          data: {
            ariaAttributeName: node.name,
          },
          suggest: [
            {
              messageId: 'suggestReplaceWithEmptyAlt',
              fix: (fixer) => getFix(fixer, node),
            },
          ],
        });
      },
      [withBinaryOrNullableAltSelector](
        node: TmplAstBoundAttribute | TmplAstTextAttribute,
      ) {
        reportFor(node, 'altTextWithBinaryOrNullableAlt', {
          suggest: [
            {
              messageId: 'suggestReplaceWithEmptyAlt',
              fix: (fixer) => getFix(fixer, node),
            },
          ],
        });
      },
    };
  },
});

function getFix(
  fixer: TSESLint.RuleFixer,
  { sourceSpan: { start, end } }: TmplAstBoundAttribute | TmplAstTextAttribute,
) {
  return fixer.replaceTextRange([start.offset - 1, end.offset], ' alt=""');
}
