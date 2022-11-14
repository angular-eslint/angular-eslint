import type {
  TmplAstTextAttribute,
  TmplAstElement,
} from '@angular-eslint/bundled-angular-compiler';
import type { ARIARoleDefinitionKey } from 'aria-query';
import { roles } from 'aria-query';
import {
  createESLintRule,
  getTemplateParserServices,
} from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { toPattern } from '../utils/to-pattern';
import { isSemanticRoleElement } from '../utils/is-semantic-role-element';

type Options = [];
export type MessageIds = 'roleHasRequiredAria' | 'suggestRemoveRole';
export const RULE_NAME = 'accessibility-role-has-required-aria';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures elements with ARIA roles have all required properties for that role.',
      recommended: false,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      roleHasRequiredAria:
        'The {{element}} with role="{{role}}" does not have required ARIA properties: {{missingProps}}',
      suggestRemoveRole: 'Remove role `{{role}}`',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getTemplateParserServices(context);
    const elementNamePattern = toPattern([...getDomElements()]);

    return {
      [`Element$1[name=${elementNamePattern}] > TextAttribute[name='role']`](
        node: TmplAstTextAttribute & {
          parent: TmplAstElement;
        },
      ) {
        const { value: role, sourceSpan } = node;
        const { attributes, inputs, name: element } = node.parent;
        const props = [...attributes, ...inputs];

        const roleDef = roles.get(role as ARIARoleDefinitionKey);

        const requiredProps = Object.keys(roleDef?.requiredProps || {});
        if (!requiredProps.length) return;

        if (isSemanticRoleElement(element, role, props)) return;

        const missingProps = requiredProps
          .filter(
            (requiredProp) => !props.find((prop) => prop.name === requiredProp),
          )
          .join(', ');

        if (missingProps) {
          const loc = parserServices.convertNodeSourceSpanToLoc(sourceSpan);

          context.report({
            loc,
            messageId: 'roleHasRequiredAria',
            data: {
              element,
              role,
              missingProps,
            },
            suggest: [
              {
                messageId: 'suggestRemoveRole',
                data: {
                  element,
                  role,
                  missingProps,
                },
                fix: (fixer) =>
                  fixer.removeRange([
                    sourceSpan?.start.offset - 1,
                    sourceSpan?.end.offset,
                  ]),
              },
            ],
          });
        }
      },
    };
  },
});
