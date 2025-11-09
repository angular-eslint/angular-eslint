import { Selectors } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];

export type MessageIds =
  | 'preferHostMetadataPropertyForBinding'
  | 'preferHostMetadataPropertyForListener';
export const RULE_NAME = 'prefer-host-metadata-property';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Use `host` metadata property instead of `@HostBinding` and `HostListener`',
    },
    schema: [],
    messages: {
      preferHostMetadataPropertyForBinding:
        'Prefer using the `host` metadata property in the `@Component` decorator for host bindings instead of the `@HostBinding` decorator.',
      preferHostMetadataPropertyForListener:
        'Prefer using the `host` metadata property in the `@Component` decorator for host listeners instead of the `@HostListener` decorator.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [Selectors.HOST_BINDING_DECORATOR]: (node) => {
        context.report({
          node,
          messageId: 'preferHostMetadataPropertyForBinding',
        });
      },
      [Selectors.HOST_LISTENER_DECORATOR]: (node) => {
        context.report({
          node,
          messageId: 'preferHostMetadataPropertyForListener',
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale:
    'Using the host metadata property in the @Component or @Directive decorator instead of separate @HostBinding and @HostListener decorators consolidates all host-related bindings in one place, making it easier to see all DOM interactions at a glance. The host property approach is generally more concise and keeps component metadata organized. With decorators, host bindings and listeners are scattered throughout the class on individual properties and methods, requiring developers to hunt through the file to understand all host interactions. The centralized host property makes this information immediately visible in the decorator metadata. This is particularly helpful during code reviews and when onboarding new team members who need to understand how a component interacts with its host element. Prior to Angular v20, the Angular team actually recommended using the decorators, partly because the decorators had better IDE support for typechecking. That is no longer the case and the Angular documentation clearly states that the host metadata should be used and that the decorators are purely still there for backwards compatibility.',
};
