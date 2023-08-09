import type {
  ASTWithSource,
  TmplAstElement,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'noTargetBlank';
export const RULE_NAME = 'no-target-blank';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows the use of target="_blank" without rel="noreferrer" in HTML templates',
      recommended: false,
    },
    schema: [],
    messages: {
      noTargetBlank:
        '<{{element}}/> element should have rel="noreferrer" where target="_blank" exist.',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);

    return {
      'Element$1[name="a"]'(node: TmplAstElement) {
        let isInvalid = false;

        if (isNodeHasTargetBlankAttribute(node)) {
          isInvalid = !isNodeHasNoReferrerAttribute(node);
        } else {
          isInvalid = true;
        }

        if (isInvalid) {
          const loc = parserServices.convertElementSourceSpanToLoc(
            context,
            node,
          );

          context.report({
            loc,
            messageId: 'noTargetBlank',
            data: {
              element: node.name,
            },
          });
        }
      },
    };
  },
});

/**
 *  Check that the `<a>` element has a `target` attribute or `[attr.target]` binding.
 */
function isNodeHasTargetBlankAttribute(node: TmplAstElement): boolean {
  return (
    node.attributes.some(({ name, value }) => isTarget(name, value)) ||
    node.inputs.some(({ name, value }) =>
      isTarget(name, (value as ASTWithSource).source),
    )
  );
}

/**
 *  Check that the `<a>` element has a `rel="noreferrer"` attribute or `[attr.rel]="noreferrer"` binding.
 */
function isNodeHasNoReferrerAttribute(node: TmplAstElement): boolean {
  return (
    node.attributes.some(({ name, value }) => isRelNoReferrer(name, value)) ||
    node.inputs.some(({ name, value }) =>
      isRelNoReferrer(name, (value as ASTWithSource).source),
    )
  );
}

/**
 *  Check element is target
 */
function isTarget(name: string, value: string | null): name is 'target' {
  return name === 'target' && value === '_blank';
}

/**
 *  Check element is rel="noreferrer"
 */
function isRelNoReferrer(name: string, value: string | null) {
  return name === 'rel' && value === 'noreferrer';
}
