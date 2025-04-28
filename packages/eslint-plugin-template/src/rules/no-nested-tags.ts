import { TmplAstElement } from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

export type Options = [];
export type MessageIds = 'noNestedTags';
export const RULE_NAME = 'no-nested-tags';

type TmplAstElementWithAncestor = TmplAstElement & {
  parent?: TmplAstElementWithAncestor;
};

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevents nesting of <p> and <a>.',
    },
    schema: [],
    messages: {
      noNestedTags:
        '<{{tag}}> elements must not be nested! This breaks angular incremental hydration as all browsers will convert "<{{tag}}>1<{{tag}}>2</{{tag}}>3</{{tag}}>" into "<{{tag}}>1</{{tag}}><{{tag}}>2</{{tag}}>3", creating a DOM mismatch between SSR and Angular',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'Element[name=/^(p|a)$/]'(node: TmplAstElementWithAncestor) {
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
  let parent = node.parent;

  while (parent) {
    if (parent instanceof TmplAstElement && parent.name === node.name) {
      return true;
    }

    parent = parent.parent;
  }

  return false;
}
