import { Selectors } from '@angular-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils as TSESLintASTUtils } from '@typescript-eslint/utils';
import { createESLintRule } from '../utils/create-eslint-rule';

type Options = [
  {
    readonly locale: string;
  },
];

export type MessageIds = 'sortImportsMetadata';
export const RULE_NAME = 'sort-imports-metadata';
const DEFAULT_LOCALE = 'en-US';

interface ImportEntryWithComments {
  commentsBefore: string;
  commentsSameLine: string;
  commentsAfter: string;
  importName: string;
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensures ASC alphabetical order for import arrays for easy visual scanning',
      recommended: false,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          locale: {
            type: 'string',
            description: 'A string with a BCP 47 language tag.',
            default: DEFAULT_LOCALE,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      sortImportsMetadata: 'Imports should be sorted in ASC alphabetical order',
    },
  },
  defaultOptions: [
    {
      locale: DEFAULT_LOCALE,
    },
  ],
  create(context, [{ locale }]) {
    const selectors = [
      `${Selectors.COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR} Property[key.name="imports"] > ArrayExpression`,
      `${Selectors.MODULE_CLASS_DECORATOR} Property[key.name="imports"] > ArrayExpression`,
      `${Selectors.PIPE_CLASS_DECORATOR} Property[key.name="imports"] > ArrayExpression`,
    ].join(',');

    return {
      [selectors]({ elements }: TSESTree.ArrayExpression) {
        const imports = elements.filter(TSESLintASTUtils.isIdentifier);

        if (importsAreSorted(imports, locale)) {
          return;
        }

        const firstOriginalElement = elements[0] as TSESTree.Expression;
        const lastOriginalElement = elements[
          elements.length - 1
        ] as TSESTree.Expression;
        // TODO: The following does not work for imports lists that are a single line
        const whitespacePrefix = ' '.repeat(
          firstOriginalElement.loc.start.column,
        );
        const sourceCode = context.getSourceCode();
        const importEntriesWithComments: ImportEntryWithComments[] = [];

        for (let i = 0; i < imports.length; i++) {
          const importEntry = imports[i];

          // Handle comments above the import entry
          let commentsBeforeImport = sourceCode.getCommentsBefore(importEntry);
          const previousImportEntry = imports[i - 1];

          if (previousImportEntry) {
            commentsBeforeImport = commentsBeforeImport.filter(
              (comment) =>
                comment.loc.start.line !== previousImportEntry.loc.start.line,
            );
          }

          const commentsBeforeString = getCommentsAsString(
            commentsBeforeImport,
            whitespacePrefix,
          );

          // Handle comments on the same line as the import entry
          // Same-line comments appear in the next import entry's `getCommentsBefore`
          let commentsSameLineString = '';
          const nextImportEntry = imports[i + 1];

          if (nextImportEntry) {
            commentsSameLineString = getCommentsAsString(
              sourceCode
                .getCommentsBefore(nextImportEntry)
                .filter(
                  (comment) =>
                    comment.loc.start.line === importEntry.loc.start.line,
                ),
            );
          }

          // Handle comments after the import entry
          const commentsAfterString = getCommentsAsString(
            sourceCode.getCommentsAfter(importEntry),
            whitespacePrefix,
          );

          const importEntryWithComments: ImportEntryWithComments = {
            commentsBefore: commentsBeforeString,
            commentsSameLine: commentsSameLineString,
            commentsAfter: commentsAfterString,
            importName: importEntry.name,
          };

          importEntriesWithComments.push(importEntryWithComments);
        }

        importEntriesWithComments.sort((importA, importB) =>
          importA.importName.localeCompare(importB.importName, locale),
        );

        let sortedImportsString = '[\n';

        for (const importEntry of importEntriesWithComments) {
          if (importEntry.commentsBefore) {
            sortedImportsString += `${importEntry.commentsBefore}`;
          }

          sortedImportsString += `${whitespacePrefix}${importEntry.importName},`;

          if (importEntry.commentsSameLine) {
            sortedImportsString += ` ${importEntry.commentsSameLine}`;
          } else {
            sortedImportsString += '\n';
          }

          if (importEntry.commentsAfter) {
            sortedImportsString += `${importEntry.commentsAfter}`;
          }
        }

        const nodeForFixer = firstOriginalElement.parent as TSESTree.Node;

        const whitespacePrefixForClosingBracket = ' '.repeat(
          nodeForFixer.parent?.loc.start.column as number,
        );

        sortedImportsString += `${whitespacePrefixForClosingBracket}]`;

        context.report({
          messageId: 'sortImportsMetadata',
          loc: {
            start: firstOriginalElement.loc.start,
            end: lastOriginalElement.loc.end,
          },
          fix: (fixer) => fixer.replaceText(nodeForFixer, sortedImportsString),
        });
      },
    };
  },
});

function getCommentsAsString(
  comments: TSESTree.Comment[],
  whitespacePrefix?: string,
): string {
  let commentsString = '';

  if (comments) {
    for (const comment of comments) {
      if (comment.type === 'Line') {
        commentsString += `${whitespacePrefix ? whitespacePrefix : ''}//${
          comment.value
        }\n`;
      } else if (comment.type === 'Block') {
        commentsString += `${whitespacePrefix ? whitespacePrefix : ''}/*${
          comment.value
        }*/\n`;
      }
    }
  }

  return commentsString;
}

function importsAreSorted(
  imports: TSESTree.Identifier[],
  locale: string,
): boolean {
  const importNames = imports.map((importEntry) => importEntry.name);
  let secondIndex;

  for (let firstIndex = 0; firstIndex < importNames.length; firstIndex++) {
    secondIndex = firstIndex + 1;

    if (
      importNames[firstIndex].localeCompare(importNames[secondIndex], locale) >
      0
    ) {
      return false;
    }
  }

  return true;
}
