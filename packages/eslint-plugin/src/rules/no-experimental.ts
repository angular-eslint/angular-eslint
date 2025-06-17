import { createESLintRule } from '../utils/create-eslint-rule';
import { getParserServices } from '@typescript-eslint/utils/eslint-utils';
import {
  getSymbols,
  hasJsDocTag,
  isDeclaration,
  isInsideExportOrImport,
} from '../utils/jsdoc';

export type Options = [];
export type MessageIds = 'noExperimental';
export const RULE_NAME = 'no-experimental';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Disallow using code which is marked as experimental`,
    },
    schema: [],
    messages: {
      noExperimental: '`{{name}}` is experimental',
    },
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      Identifier: (node) => {
        if (isDeclaration(node) || isInsideExportOrImport(node)) {
          return;
        }

        const symbols = getSymbols(node, services, checker);
        if (!hasJsDocTag(symbols, 'experimental')) {
          return;
        }

        const { name } = node;

        context.report({
          node,
          messageId: 'noExperimental',
          data: { name },
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale: `Angular's [experimental APIs](https://angular.dev/reference/releases#experimental) are subject to significant changes or removal without notice and are not covered by Angular's [breaking change policy](https://angular.dev/reference/releases#breaking-change-policy-and-update-paths). These APIs may change even in patch releases, making them risky for production applications.`,
};
