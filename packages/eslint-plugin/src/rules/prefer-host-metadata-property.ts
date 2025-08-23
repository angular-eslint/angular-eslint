import { Selectors } from '@angular-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];

export type MessageIds = 'preferHostMetadataProperty';
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
      preferHostMetadataProperty:
        'Prefer using the `host` metadata property in the `@Component` decorator for host bindings and listeners instead of the `@HostBinding` and `@HostListener` decorators in the class.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [Selectors.HOST_BINDING_OR_LISTENER_DECORATOR]: (node) => {
        context.report({ node, messageId: 'preferHostMetadataProperty' });
      },
    };
  },
});
