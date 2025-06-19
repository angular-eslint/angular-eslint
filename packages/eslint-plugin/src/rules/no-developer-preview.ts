import { createESLintRule } from '../utils/create-eslint-rule';
import { getParserServices } from '@typescript-eslint/utils/eslint-utils';
import {
  getSymbols,
  hasJsDocTag,
  isDeclaration,
  isInsideExportOrImport,
} from '../utils/jsdoc';

export type Options = [];
export type MessageIds = 'noDeveloperPreview';
export const RULE_NAME = 'no-developer-preview';

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Disallow using code which is marked as developer preview`,
    },
    schema: [],
    messages: {
      noDeveloperPreview: '`{{name}}` is in developer preview',
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
        if (!hasJsDocTag(symbols, 'developerPreview')) {
          return;
        }

        const { name } = node;

        context.report({
          node,
          messageId: 'noDeveloperPreview',
          data: { name },
        });
      },
    };
  },
});

export const RULE_DOCS_EXTENSION = {
  rationale: `Angular's [developer preview APIs](https://angular.dev/reference/releases#developer-preview) are fully functional and polished, but not yet covered by Angular's [breaking change policy](https://angular.dev/reference/releases#breaking-change-policy-and-update-paths). These APIs may change even in patch releases, making them risky for production applications.`,
};
