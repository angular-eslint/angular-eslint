import type {
  TmplAstTextAttribute,
  TmplAstElement,
} from '@angular-eslint/bundled-angular-compiler';
import { getTemplateParserServices } from '@angular-eslint/utils';
import type { ARIARoleDefinitionKey } from 'aria-query';
import { roles } from 'aria-query';
import { createESLintRule } from '../utils/create-eslint-rule';
import { getDomElements } from '../utils/get-dom-elements';
import { toPattern } from '../utils/to-pattern';
import { isSemanticRoleElement } from '../utils/is-semantic-role-element';

export type Options = [];
export type MessageIds = 'roleHasRequiredAria' | 'suggestRemoveRole';
export const RULE_NAME = 'role-has-required-aria';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        '[Accessibility] Ensures elements with ARIA roles have all required properties for that role.',
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
    const domElements = [...getDomElements()];
    const uppercaseDomElements = domElements.map((element) =>
      element.toUpperCase(),
    );
    const elementNamePattern = toPattern([
      ...domElements,
      ...uppercaseDomElements,
    ]);

    return {
      [`Element[name=${elementNamePattern}] > TextAttribute[name='role']`](
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

export const RULE_DOCS_EXTENSION = {
  rationale:
    'ARIA roles define what an element is and how it should behave for assistive technologies, but many roles require specific ARIA properties to be meaningful and functional. For example, a role="slider" must have aria-valuemin, aria-valuemax, and aria-valuenow to communicate its state to screen readers. Without these required properties, the role is incomplete and may confuse or mislead users of assistive technologies. The ARIA specification defines which properties are required for each role, and this rule enforces those requirements based on the official aria-query library. Ensuring required ARIA properties are present is critical for making interactive elements accessible. This is a WCAG Level A requirement for proper ARIA implementation.',
};
