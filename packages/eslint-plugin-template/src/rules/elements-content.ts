import type { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { isHiddenFromScreenReader } from '../utils/is-hidden-from-screen-reader';

export type Options = [
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
  'textContent',
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
        '[Accessibility] Ensures that the heading, anchor and button elements have content in them',
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
      'Element[name=/^(a|button|h1|h2|h3|h4|h5|h6)$/i][children.length=0]'(
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

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Interactive elements like buttons, anchors (links), and headings must have accessible text content for screen readers. For example, '<button><mat-icon>delete</mat-icon></button>' is not accessible because screen readers will just announce 'button' without explaining what it does. Solutions include adding visible text, using aria-label, or including visually-hidden text with CSS. This ensures all users, including those using screen readers, know the purpose of each interactive element. This is a fundamental WCAG requirement for web accessibility.",
};
