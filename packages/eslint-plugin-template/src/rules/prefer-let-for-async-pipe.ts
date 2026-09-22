import type { BindingPipe } from '@angular-eslint/bundled-angular-compiler';
import { ensureTemplateParser } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { areEquivalentASTs } from '../utils/are-equivalent-asts';

export type Options = [];
export type MessageIds = 'preferLetForAsyncPipe';
export const RULE_NAME = 'prefer-let-for-async-pipe';

const VIEW_SELECTOR = [
  'Template',
  'IfBlockBranch',
  'ForLoopBlock',
  'ForLoopBlockEmpty',
  'SwitchBlockCaseGroup',
  'DeferredBlock',
  'DeferredBlockLoading',
  'DeferredBlockError',
  'DeferredBlockPlaceholder',
].join(',');

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer using `@let` to reuse the result of an async pipe when the same expression is subscribed to multiple times in a template view.',
    },
    schema: [],
    messages: {
      preferLetForAsyncPipe:
        'The same async pipe expression is used more than once in this template view. Assign its result to an `@let` variable and reuse it.',
    },
    defaultOptions: [],
  },
  create(context) {
    ensureTemplateParser(context);
    const sourceCode = context.sourceCode;
    const asyncPipesByView: BindingPipe[][] = [[]];

    function checkAsyncPipe(bindingPipe: BindingPipe): void {
      const currentView = asyncPipesByView.at(-1);

      if (!currentView) {
        return;
      }

      if (
        !currentView.some((previous) =>
          areEquivalentASTs(previous, bindingPipe),
        )
      ) {
        currentView.push(bindingPipe);
        return;
      }

      const { start, end } = bindingPipe.sourceSpan;

      context.report({
        loc: {
          start: sourceCode.getLocFromIndex(start),
          end: sourceCode.getLocFromIndex(end),
        },
        messageId: 'preferLetForAsyncPipe',
      });
    }

    return {
      [VIEW_SELECTOR]() {
        asyncPipesByView.push([]);
      },
      [`${VIEW_SELECTOR}:exit`]() {
        asyncPipesByView.pop();
      },
      'BindingPipe[name="async"]': checkAsyncPipe,
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Each async pipe instance manages its own subscription. Repeating the same async pipe expression in a template view can therefore create duplicate subscriptions and repeat side effects for cold observables. An `@let` declaration can evaluate the async pipe once and make its latest value available to the current view and nested views. This rule only compares async pipe expressions within the same template view so that it does not encourage moving subscriptions across view boundaries, which could change their lifetime.',
};
