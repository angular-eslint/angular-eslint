import {
  TmplAstElement,
  TmplAstTemplate,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noNestedTags';
export const RULE_NAME = 'no-nested-tags';

type NodeWithParent = {
  parent?: NodeWithParent;
};

type TmplAstElementWithAncestor = TmplAstElement & NodeWithParent;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Denies nesting of `<p>` and `<a>` tags.',
    },
    schema: [],
    messages: {
      noNestedTags:
        '<{{tag}}> elements must not be nested! This breaks angular incremental hydration as all browsers will convert "<{{tag}}>1<{{tag}}>2</{{tag}}>3</{{tag}}>" into "<{{tag}}>1</{{tag}}><{{tag}}>2</{{tag}}>3", creating a DOM mismatch between SSR and Angular',
    },
    defaultOptions: [],
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'Element[name=/^(p|a)$/i]'(node: TmplAstElementWithAncestor) {
        const hasInvalidNesting = hasAncestorOfSameType(node);

        if (hasInvalidNesting) {
          const loc = parserServices.convertElementSourceSpanToLoc(
            context,
            node,
          );
          context.report({
            loc,
            messageId: 'noNestedTags',
            data: {
              tag: node.name,
            },
          });
        }
      },
    };
  },
});

function hasAncestorOfSameType(node: TmplAstElementWithAncestor) {
  let parent: NodeWithParent | undefined = node.parent;

  while (parent) {
    // Explicit <ng-template> is not rendered in-place, so tags inside it
    // are not nested in the parent element's DOM. Structural directives
    // like *ngFor compile to implicit templates and must still be reported.
    if (isExplicitNgTemplate(parent)) {
      return false;
    }

    if (
      parent instanceof TmplAstElement &&
      parent.name.toLowerCase() === node.name.toLowerCase()
    ) {
      return true;
    }

    parent = parent.parent;
  }

  return false;
}

function isExplicitNgTemplate(node: NodeWithParent): node is TmplAstTemplate {
  return (
    node instanceof TmplAstTemplate &&
    typeof node.tagName === 'string' &&
    /^(:svg:)?ng-template$/i.test(node.tagName)
  );
}

export const RULE_DOCS_EXTENSION = {
  rationale:
    "Nesting `<p>` tags inside other `<p>` tags, or `<a>` tags inside other `<a>` tags, is invalid HTML and causes serious issues with Angular hydration. All browsers automatically close the outer tag when they encounter the inner tag, transforming `<p>1<p>2</p>3</p>` into `<p>1</p><p>2</p>3` in the DOM. This creates a mismatch between the server-rendered HTML and what Angular expects during hydration, breaking incremental hydration and potentially causing runtime errors. The browser's automatic correction of invalid HTML happens before Angular processes the template, so Angular cannot fix or work around it. Always use different elements (like `<p>` and `<span>`, or nested `<div>` tags) or restructure your template to avoid nesting these specific tags. Explicit `<ng-template>` elements are an exception because they are not rendered in-place; tags inside them are not nested in the parent element's DOM.",
};
