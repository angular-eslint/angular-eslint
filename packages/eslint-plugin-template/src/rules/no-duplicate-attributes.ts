import type {
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstElement,
  TmplAstTextAttribute,
} from '@angular/compiler';
import { BindingType, ParsedEventType } from '@angular/compiler';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';

type Options = [{ readonly allowTwoWayDataBinding?: boolean }];
export type MessageIds = 'noDuplicateAttributes' | 'suggestRemoveAttribute';
export const RULE_NAME = 'no-duplicate-attributes';
const DEFAULT_OPTIONS: Options[0] = { allowTwoWayDataBinding: true };

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensures that there are no duplicate input properties or output event listeners',
      category: 'Possible Errors',
      recommended: false,
      suggestion: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowTwoWayDataBinding: {
            type: 'boolean',
            default: DEFAULT_OPTIONS.allowTwoWayDataBinding,
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
      Element({ inputs, outputs, attributes }: TmplAstElement) {
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
            attributeName: getAttributeName(duplicate),
          } as const;

          context.report({
            messageId: 'noDuplicateAttributes',
            loc,
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

interface BoundAttribute extends Omit<TmplAstBoundAttribute, 'type'> {
  type: 'BoundAttribute';
  __originalType: BindingType;
}

interface BoundEvent extends Omit<TmplAstBoundEvent, 'type'> {
  type: 'BoundEvent';
  __originalType: ParsedEventType;
}

function getAttributeName(
  attribute:
    | BoundAttribute
    | TmplAstTextAttribute
    | BoundEvent
    | { name: string },
): string {
  if ('type' in attribute) {
    if (attribute.type === 'BoundAttribute') {
      switch (attribute.__originalType) {
        case BindingType.Class:
          return `class.${attribute.name}`;
        case BindingType.Style:
          return `style.${attribute.name}${
            attribute.unit ? '.' + attribute.unit : ''
          }`;
        case BindingType.Animation:
          return `@${attribute.name}`;
      }
    } else if (attribute.type === 'BoundEvent') {
      if (attribute.__originalType === ParsedEventType.Animation) {
        return `@${attribute.name}${
          attribute.phase ? '.' + attribute.phase : ''
        }`;
      }

      if (attribute.target) {
        return `${attribute.target}:${attribute.name}`;
      }
    }
  }

  return attribute.name;
}

function findDuplicates(
  elements: readonly TmplAstBoundEvent[],
): readonly TmplAstBoundEvent[];
function findDuplicates(
  elements: readonly (TmplAstBoundAttribute | TmplAstTextAttribute)[],
): readonly (TmplAstBoundAttribute | TmplAstTextAttribute)[];
function findDuplicates(
  elements: readonly { name: string }[],
): readonly { name: string }[] {
  return elements.filter((element) => {
    return elements.some(
      (otherElement) =>
        otherElement !== element &&
        getAttributeName(otherElement) === getAttributeName(element),
    );
  });
}
