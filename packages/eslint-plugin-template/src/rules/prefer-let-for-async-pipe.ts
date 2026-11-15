import {
  type BindingPipe,
  ImplicitReceiver,
  PropertyRead,
  RecursiveAstVisitor,
  SafePropertyRead,
  ThisReceiver,
} from '@angular-eslint/bundled-angular-compiler';
import { ensureTemplateParser } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';
import {
  type AreEquivalentASTsOptions,
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

type AsyncPipe = {
  readonly pipe: BindingPipe;
  /**
   * The `@error` block whose `when` expression contains the pipe, if any.
   */
  readonly errorBlock: TemplateNodeWithParent | null;
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
  'BoundaryBlock',
  'BoundaryErrorBlock',
  // `<ng-content>` fallback content is rendered in its own view.
  'Content',
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
    const asyncPipesByView = new Map<View, AsyncPipe[]>();
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

    // An `@error (when ...)` expression runs in the view that contains the
    // `@boundary` block, but Angular resolves its names in the `@error`
    // block's scope, so it can read `$error`, `$reset` and their aliases.
    function getErrorBlockOfWhenExpression(
      node: TemplateNodeWithParent,
    ): TemplateNodeWithParent | null {
      let child = node;
      let parent = child.parent;

      while (parent) {
        if (VIEW_NODE_TYPES.has(parent.type) && isChildOfView(parent, child)) {
          return null;
        }
        // An `@error` block's only expression outside its children is the
        // `when` expression.
        if (parent.type === 'BoundaryErrorBlock') {
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
        const node = pipe as unknown as TemplateNodeWithParent;
        const view = getOwningView(node);
        const pipes = asyncPipesByView.get(view) ?? [];
        pipes.push({ pipe, errorBlock: getErrorBlockOfWhenExpression(node) });
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
        const optionsByScope = new Map<View, AreEquivalentASTsOptions>();
        function getOptions(scope: View): AreEquivalentASTsOptions {
          let options = optionsByScope.get(scope);
          if (!options) {
            options = { templateLocals: getTemplateLocalsInScope(scope) };
            optionsByScope.set(scope, options);
          }
          return options;
        }

        for (const [view, pipes] of asyncPipesByView) {
          // Pipes can only be equivalent when they resolve names in the same
          // scope and have the same key, so bucket them by both to avoid
          // comparing every pair of pipes in the view.
          const seenByScopeAndKey = new Map<View, Map<string, BindingPipe[]>>();

          // Angular's visitor order is not always the template source order.
          for (const { pipe, errorBlock } of pipes.sort(
            (a, b) => a.pipe.sourceSpan.start - b.pipe.sourceSpan.start,
          )) {
            // An `@error (when ...)` pipe that reads none of the `@error`
            // block's own locals resolves every name as the rest of the
            // view does, so it can be compared with the view's other pipes.
            const scope =
              errorBlock &&
              readsAnyName(pipe, localsDeclaredByView.get(errorBlock))
                ? errorBlock
                : view;
            let seenByKey = seenByScopeAndKey.get(scope);
            if (!seenByKey) {
              seenByKey = new Map();
              seenByScopeAndKey.set(scope, seenByKey);
            }

            const key = getEquivalenceKey(pipe);
            const seen = seenByKey.get(key);
            if (!seen) {
              seenByKey.set(key, [pipe]);
              continue;
            }
            const options = getOptions(scope);
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

/**
 * Checks whether an expression implicitly reads (without `this.`) any of the
 * given names.
 */
function readsAnyName(
  ast: BindingPipe,
  names: ReadonlySet<string> | undefined,
): boolean {
  if (!names?.size) {
    return false;
  }
  const visitor = new ImplicitReadVisitor(names);
  ast.visit(visitor);
  return visitor.found;
}

class ImplicitReadVisitor extends RecursiveAstVisitor {
  found = false;

  constructor(private readonly names: ReadonlySet<string>) {
    super();
  }

  override visitPropertyRead(ast: PropertyRead, context: unknown): void {
    this.check(ast);
    super.visitPropertyRead(ast, context);
  }

  override visitSafePropertyRead(
    ast: SafePropertyRead,
    context: unknown,
  ): void {
    this.check(ast);
    super.visitSafePropertyRead(ast, context);
  }

  private check(ast: PropertyRead | SafePropertyRead): void {
    if (
      ast.receiver instanceof ImplicitReceiver &&
      !(ast.receiver instanceof ThisReceiver) &&
      this.names.has(ast.name)
    ) {
      this.found = true;
    }
  }
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Each async pipe instance manages its own subscription. Repeating the same async pipe expression in a template view can therefore create duplicate subscriptions and repeat side effects for cold observables. An `@let` declaration can evaluate the async pipe once and make its latest value available to the current view and nested views. This rule only compares async pipe expressions within the same template view so that it does not encourage moving subscriptions across view boundaries, which could change their lifetime.',
};
