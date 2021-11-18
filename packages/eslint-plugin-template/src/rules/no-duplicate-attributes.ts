import type {
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstElement,
  TmplAstTextAttribute,
} from '@angular-eslint/bundled-angular-compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { getOriginalAttributeName } from '../utils/get-original-attribute-name';

type Options = [{ readonly allowTwoWayDataBinding?: boolean }];
export type MessageIds = 'noDuplicateAttributes' | 'suggestRemoveAttribute';
export const RULE_NAME = 'no-duplicate-attributes';
const DEFAULT_OPTIONS: Options[number] = { allowTwoWayDataBinding: true };

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensures that there are no duplicate input properties or output event listeners',
      recommended: false,
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          allowTwoWayDataBinding: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.allowTwoWayDataBinding,
            description: `Whether or not two-way data binding is allowed as an exception to the rule.`,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noDuplicateAttributes: 'Duplicate attribute `{{attributeName}}`',
      suggestRemoveAttribute: 'Remove attribute `{{attributeName}}`',
    },
  },
  defaultOptions: [DEFAULT_OPTIONS],
  create(context, [{ allowTwoWayDataBinding }]) {
    const parserServices = getTemplateParserServices(context);

    return {
      Element$1({ inputs, outputs, attributes }: TmplAstElement) {
        const duplicateInputsAndAttributes = findDuplicates([
          ...inputs,
          ...attributes,
        ]);
        const filteredOutputs = allowTwoWayDataBinding
          ? outputs.filter((output) => {
              return !inputs.some(
                (input) =>
                  input.sourceSpan.start === output.sourceSpan.start &&
                  input.sourceSpan.end === output.sourceSpan.end,
              );
            })
          : outputs;
        const duplicateOutputs = findDuplicates(filteredOutputs);
        const allDuplicates = [
          ...duplicateInputsAndAttributes,
          ...duplicateOutputs,
        ] as const;

        allDuplicates.forEach((duplicate) => {
          const loc = parserServices.convertNodeSourceSpanToLoc(
            duplicate.sourceSpan,
          );
          const data = {
            attributeName: getOriginalAttributeName(duplicate),
          } as const;

          context.report({
            loc,
            messageId: 'noDuplicateAttributes',
            data,
            suggest: [
              {
                messageId: 'suggestRemoveAttribute',
                fix: (fixer) =>
                  fixer.removeRange([loc.start.column, loc.end.column + 1]),
                data,
              },
            ],
          });
        });
      },
    };
  },
});

function findDuplicates<
  TAttributeType extends
    | TmplAstBoundEvent
    | TmplAstBoundAttribute
    | TmplAstTextAttribute,
>(elements: readonly TAttributeType[]): readonly TAttributeType[] {
  return elements.filter((element) => {
    return elements.some(
      (otherElement) =>
        otherElement !== element &&
        getOriginalAttributeName(otherElement) ===
          getOriginalAttributeName(element),
    );
  });
}
