import { createESLintRule } from '../utils/create-eslint-rule';
import { getParserServices } from '@typescript-eslint/utils/eslint-utils';
import {
  getSymbol,
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

        const symbol = getSymbol(node, services, checker);
        if (!hasJsDocTag(symbol, 'experimental')) {
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
