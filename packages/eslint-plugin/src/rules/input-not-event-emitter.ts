import { Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'inputNotEventEmitter' | 'suggestChangeInputToOutput';
export const RULE_NAME = 'input-not-event-emitter';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer to not declare `@Input` with an `EventEmitter`',
      recommended: false,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      inputNotEventEmitter:
        'Prefer to not declare `@Input` with an `EventEmitter`',
      suggestChangeInputToOutput: 'Change `@Input` to `@Output`',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [`${Selectors.INPUT_DECORATOR} > ${Selectors.OUTPUT_DECORATOR}`]({
        parent: type,
      }: {
        parent: TSESTree.Decorator;
      }) {
        context.report({
          node: type,
          messageId: 'inputNotEventEmitter',
          suggest: [
            {
              messageId: 'suggestChangeInputToOutput',
              fix: (fixer) => fixer.replaceText(type, '@Output '),
            },
          ],
        });
      },
    };
  },
});
