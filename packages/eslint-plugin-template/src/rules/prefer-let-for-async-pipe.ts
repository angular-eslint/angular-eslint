import type { BindingPipe } from '@angular-eslint/bundled-angular-compiler';
import { ensureTemplateParser } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  areEquivalentASTs,
  getEquivalenceKey,
} from '../utils/are-equivalent-asts';

export type Options = [];
export type MessageIds = 'preferLetForAsyncPipe';
export const RULE_NAME = 'prefer-let-for-async-pipe';

type NamedNode = { readonly name: string };

type TemplateNodeWithParent = {
  type: string;
  parent?: TemplateNodeWithParent;
  children?: readonly TemplateNodeWithParent[];
};

type View = TemplateNodeWithParent | null;

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
  'BoundaryBlock',
  'BoundaryErrorBlock',
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
    const asyncPipesByView = new Map<View, BindingPipe[]>();
    // Names of the template locals declared directly in each view.
    const localsDeclaredByView = new Map<View, Set<string>>();
    const childrenByView = new WeakMap<
      TemplateNodeWithParent,
      ReadonlySet<TemplateNodeWithParent>
    >();

    function isChildOfView(
      view: TemplateNodeWithParent,
      child: TemplateNodeWithParent,
    ): boolean {
      let children = childrenByView.get(view);
      if (!children) {
        children = new Set(view.children);
        childrenByView.set(view, children);
      }
      return children.has(child);
    }

    function getOwningView(node: TemplateNodeWithParent): View {
      let child = node;
      let parent = child.parent;

      while (parent) {
        // Header expressions (e.g. @if conditions, @for iterables and
        // structural directive bindings) run in the enclosing view.
        // Only nodes reached through children belong to the new view.
        if (VIEW_NODE_TYPES.has(parent.type) && isChildOfView(parent, child)) {
          return parent;
        }

        child = parent;
        parent = parent.parent;
      }

      return null;
    }

    function declareLocals(
      view: View,
      declarations: readonly (NamedNode | null | undefined)[] | undefined,
    ): void {
      if (!declarations?.length) {
        return;
      }

      let locals = localsDeclaredByView.get(view);
      if (!locals) {
        locals = new Set();
        localsDeclaredByView.set(view, locals);
      }
      for (const declaration of declarations) {
        if (declaration) {
          locals.add(declaration.name);
        }
      }
    }

    // Template references (on elements, templates, components and
    // directives) are visible to the view that contains them.
    function declareReferences(node: {
      references?: readonly NamedNode[];
      directives?: readonly { references?: readonly NamedNode[] }[];
    }): void {
      const view = getOwningView(node as unknown as TemplateNodeWithParent);
      declareLocals(view, node.references);
      for (const directive of node.directives ?? []) {
        declareLocals(view, directive.references);
      }
    }

    // A view can read the template locals declared in it and in every view
    // that encloses it.
    function getTemplateLocalsInScope(view: View): ReadonlySet<string> {
      const locals = new Set<string>();
      let current = view;

      while (true) {
        for (const name of localsDeclaredByView.get(current) ?? []) {
          locals.add(name);
        }
        if (!current) {
          return locals;
        }
        current = getOwningView(current);
      }
    }

    return {
      'BindingPipe[name="async"]'(pipe: BindingPipe) {
        const view = getOwningView(pipe as unknown as TemplateNodeWithParent);
        const pipes = asyncPipesByView.get(view) ?? [];
        pipes.push(pipe);
        asyncPipesByView.set(view, pipes);
      },
      LetDeclaration(node: NamedNode) {
        declareLocals(
          getOwningView(node as unknown as TemplateNodeWithParent),
          [node],
        );
      },
      Element: declareReferences,
      Component: declareReferences,
      Template(node: {
        variables: readonly NamedNode[];
        references?: readonly NamedNode[];
        directives?: readonly { references?: readonly NamedNode[] }[];
      }) {
        // `let-` variables (and structural directive variables such as
        // `*ngFor="let item of items"`) belong to the template's own view.
        declareLocals(
          node as unknown as TemplateNodeWithParent,
          node.variables,
        );
        declareReferences(node);
      },
      ForLoopBlock(node: {
        item: NamedNode;
        contextVariables: readonly NamedNode[];
      }) {
        declareLocals(node as unknown as TemplateNodeWithParent, [
          node.item,
          ...node.contextVariables,
        ]);
      },
      IfBlockBranch(node: { expressionAlias: NamedNode | null }) {
        declareLocals(node as unknown as TemplateNodeWithParent, [
          node.expressionAlias,
        ]);
      },
      BoundaryErrorBlock(node: { contextVariables: readonly NamedNode[] }) {
        declareLocals(
          node as unknown as TemplateNodeWithParent,
          node.contextVariables,
        );
      },
      'Program:exit'() {
        for (const [view, pipes] of asyncPipesByView) {
          const options = { templateLocals: getTemplateLocalsInScope(view) };
          // Only pipes with the same key can be equivalent, so bucket them
          // to avoid comparing every pair of pipes in the view.
          const seenByKey = new Map<string, BindingPipe[]>();

          // Angular's visitor order is not always the template source order.
          for (const pipe of pipes.sort(
            (a, b) => a.sourceSpan.start - b.sourceSpan.start,
          )) {
            const key = getEquivalenceKey(pipe);
            const seen = seenByKey.get(key);
            if (!seen) {
              seenByKey.set(key, [pipe]);
              continue;
            }
            if (
              !seen.some((previous) =>
                areEquivalentASTs(previous, pipe, options),
              )
            ) {
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
