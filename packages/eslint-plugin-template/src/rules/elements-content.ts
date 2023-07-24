import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { isHiddenFromScreenReader } from '../utils/is-hidden-from-screen-reader';

type Options = [
  {
    readonly allowList?: readonly string[];
  },
];
export type MessageIds = 'elementsContent';
export const RULE_NAME = 'elements-content';
const DEFAULT_SAFELIST_ATTRIBUTES: readonly string[] = [
  'aria-label',
  'innerHtml',
  'innerHTML',
  'innerText',
  'outerHTML',
  'title',
];
const DEFAULT_OPTIONS: Options[0] = {
  allowList: DEFAULT_SAFELIST_ATTRIBUTES,
};

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        '[Accessibility] Ensures that the heading, anchor and button elements have content in it',
      recommended: false,
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowList: {
            items: { type: 'string' },
            type: 'array',
            uniqueItems: true,
          },
        },
        type: 'object',
      },
    ],
    messages: {
      elementsContent: '<{{element}}> should have content',
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, [{ allowList }]) {
    const parserServices = getTemplateParserServices(context);

    return {
      'Element$1[name=/^(a|button|h1|h2|h3|h4|h5|h6)$/][children.length=0]'(
        node: TmplAstElement,
      ) {
        if (isHiddenFromScreenReader(node)) return;

        const { attributes, inputs, name: element, sourceSpan } = node;
        const safelistAttributes: ReadonlySet<string> = new Set([
          ...DEFAULT_SAFELIST_ATTRIBUTES,
          ...(allowList ?? []),
        ]);
        const hasAttributeSafelisted = [...attributes, ...inputs]
          .map(({ name }) => name)
          .some((inputName) => safelistAttributes.has(inputName));

        if (hasAttributeSafelisted) return;

        const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

        context.report({
          loc,
          messageId: 'elementsContent',
          data: { element },
        });
      },
    };
  },
});
