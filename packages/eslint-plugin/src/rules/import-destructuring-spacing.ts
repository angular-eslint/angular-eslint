import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [];
export type MessageIds = 'importDestructuringSpacing';
export const RULE_NAME = 'import-destructuring-spacing';

const LEADING_SPACES_PATTERN = /\{(\s*)/;
const TRAILING_SPACES_PATTERN = /(\s*)}/;

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: `Imports are easier for the reader to look at when they're tidy.`,
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      importDestructuringSpacing: `Import statement's curly braces must be spaced exactly by a space to the right and a space to the left.`,
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      ['ImportDeclaration'](node: TSESTree.ImportDeclaration) {
        // We'd want to skip empty imports, e.g. `import {} from './bar'`.
        if (node.specifiers.length === 0) {
          return;
        }

        const isDefaultOrNamespaceSpecifier = node.specifiers.some(
          (specifier) =>
            specifier.type === 'ImportDefaultSpecifier' ||
            specifier.type === 'ImportNamespaceSpecifier',
        );

        // We're interested only in named imports (e.g. `import { foo } from './bar'`),
        // but we'd want to skip `import foo` and `import * as foo`.
        if (isDefaultOrNamespaceSpecifier) {
          return;
        }

        const text = sourceCode.getText(node);

        if (isBlankOrMultilineImport(text)) {
          return;
        }

        const leadingSpacesMatches = text.match(LEADING_SPACES_PATTERN);
        const trailingSpacesMatches = text.match(TRAILING_SPACES_PATTERN);
        const totalLeadingSpaces = leadingSpacesMatches
          ? leadingSpacesMatches[1].length
          : 1;
        const totalTrailingSpaces = trailingSpacesMatches
          ? trailingSpacesMatches[1].length
          : 1;

        if (totalLeadingSpaces === 1 && totalTrailingSpaces === 1) return;

        context.report({
          node,
          messageId: 'importDestructuringSpacing',
        });
      },
    };
  },
});

const BLANK_MULTILINE_PATTERN = /^\{\s*\}$|\n/;
function isBlankOrMultilineImport(text: string): boolean {
  return BLANK_MULTILINE_PATTERN.test(text);
}
