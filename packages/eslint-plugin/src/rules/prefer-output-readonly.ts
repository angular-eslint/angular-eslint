import { Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'preferOutputReadonly' | 'suggestAddReadonlyModifier';
export const RULE_NAME = 'prefer-output-readonly';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer to declare `@Output`, `OutputEmitterRef` and `OutputRef` as `readonly` since they are not supposed to be reassigned',
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      preferOutputReadonly:
        'Prefer to declare `{{type}}` as `readonly` since they are not supposed to be reassigned',
      suggestAddReadonlyModifier: 'Add `readonly` modifier',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [`PropertyDefinition:not([readonly=true]) > ${Selectors.OUTPUT_DECORATOR}`]({
        parent: { key },
      }: TSESTree.Decorator & { parent: TSESTree.PropertyDefinition }) {
        report(key, '@Output');
      },
      [`PropertyDefinition:not([readonly=true]):matches([typeAnnotation.typeAnnotation.typeName.name=OutputEmitterRef], [value.callee.name=output])`]({
        key,
      }: TSESTree.PropertyDefinition) {
        report(key, 'OutputEmitterRef');
      },
      [`PropertyDefinition:not([readonly=true]):matches([typeAnnotation.typeAnnotation.typeName.name=OutputRef], [value.callee.name=outputFromObservable])`]({
        key,
      }: TSESTree.PropertyDefinition) {
        report(key, 'OutputRef');
      },
    };

    function report(key: TSESTree.Node, type: string) {
      context.report({
        node: key,
        messageId: 'preferOutputReadonly',
        data: { type },
        suggest: [
          {
            messageId: 'suggestAddReadonlyModifier',
            fix: (fixer) => fixer.insertTextBefore(key, 'readonly '),
          },
        ],
      });
    }
  },
});
