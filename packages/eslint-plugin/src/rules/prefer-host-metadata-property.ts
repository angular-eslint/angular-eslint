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
