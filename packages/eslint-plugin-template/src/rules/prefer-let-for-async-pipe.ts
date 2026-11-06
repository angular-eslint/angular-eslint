import type { BindingPipe } from '@angular-eslint/bundled-angular-compiler';
import { ensureTemplateParser } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import { areEquivalentASTs } from '../utils/are-equivalent-asts';

export type Options = [];
export type MessageIds = 'preferLetForAsyncPipe';
export const RULE_NAME = 'prefer-let-for-async-pipe';

type TemplateNodeWithParent = {
  type: string;
  parent?: TemplateNodeWithParent;
  children?: readonly TemplateNodeWithParent[];
};

const VIEW_NODE_TYPES = new Set([
  'Template',
  'IfBlockBranch',
  'ForLoopBlock',
  'ForLoopBlockEmpty',
  'SwitchBlockCaseGroup',
  'DeferredBlock',
  'DeferredBlockLoading',
  'DeferredBlockError',
  'DeferredBlockPlaceholder',
]);

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
    const asyncPipesByView = new Map<
      TemplateNodeWithParent | null,
      BindingPipe[]
    >();

    function getOwningView(pipe: BindingPipe): TemplateNodeWithParent | null {
      let child = pipe as unknown as TemplateNodeWithParent;
      let parent = child.parent;

      while (parent) {
        // Header expressions (e.g. @if conditions, @for iterables and
        // structural directive bindings) run in the enclosing view.
        // Only nodes reached through children belong to the new view.
        if (
          VIEW_NODE_TYPES.has(parent.type) &&
          parent.children?.includes(child)
        ) {
          return parent;
        }

        child = parent;
        parent = parent.parent;
      }

      return null;
    }

    return {
      'BindingPipe[name="async"]'(pipe: BindingPipe) {
        const view = getOwningView(pipe);
        const pipes = asyncPipesByView.get(view) ?? [];
        pipes.push(pipe);
        asyncPipesByView.set(view, pipes);
      },
      'Program:exit'() {
        for (const pipes of asyncPipesByView.values()) {
          const seen: BindingPipe[] = [];

          // Angular's visitor order is not always the template source order.
          for (const pipe of pipes.sort(
            (a, b) => a.sourceSpan.start - b.sourceSpan.start,
          )) {
            if (!seen.some((previous) => areEquivalentASTs(previous, pipe))) {
              seen.push(pipe);
              continue;
            }

            const { start, end } = pipe.sourceSpan;
            context.report({
              loc: {
                start: sourceCode.getLocFromIndex(start),
                end: sourceCode.getLocFromIndex(end),
              },
              messageId: 'preferLetForAsyncPipe',
            });
          }
        }
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Each async pipe instance manages its own subscription. Repeating the same async pipe expression in a template view can therefore create duplicate subscriptions and repeat side effects for cold observables. An `@let` declaration can evaluate the async pipe once and make its latest value available to the current view and nested views. This rule only compares async pipe expressions within the same template view so that it does not encourage moving subscriptions across view boundaries, which could change their lifetime.',
};
