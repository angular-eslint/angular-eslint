import { createESLintRule } from '../utils/create-eslint-rule';
import { getParserServices } from '@typescript-eslint/utils/eslint-utils';
import {
  getSymbols,
  hasJsDocTag,
  isDeclaration,
  isInsideExportOrImport,
} from '../utils/jsdoc';
import type ts from 'typescript';

export type Options = [
  {
    readonly ignorePackages?: readonly string[];
  },
];
export type MessageIds = 'noExperimental';
export const RULE_NAME = 'no-experimental';

function isFileFromIgnoredPackage(
  fileName: string,
  ignorePackages: readonly string[],
): boolean {
  const normalizedFileName = fileName.replace(/\\/g, '/');

  return ignorePackages.some((packageName) =>
    normalizedFileName.includes(`node_modules/${packageName}/`),
  );
}

function shouldIgnoreDueToPackages(
  symbols: (ts.Symbol | undefined)[],
  ignorePackages: readonly string[],
): boolean {
  if (ignorePackages.length === 0) {
    return false;
  }

  const experimentalSymbols = symbols.filter(
    (symbol) =>
      symbol?.getJsDocTags().some((tag) => tag.name === 'experimental'),
  );

  return (
    experimentalSymbols.length > 0 &&
    experimentalSymbols.every((symbol) => {
      if (symbol === undefined) {
        return false;
      }

      const declarations = symbol.getDeclarations() ?? [];

      return (
        declarations.length > 0 &&
        declarations.every((declaration) =>
          isFileFromIgnoredPackage(
            declaration.getSourceFile().fileName,
            ignorePackages,
          ),
        )
      );
    })
  );
}

export default createESLintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Disallow using code which is marked as experimental`,
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignorePackages: {
            type: 'array',
            items: {
              type: 'string',
            },
            description:
              'npm package names whose experimental APIs should not be reported',
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noExperimental: '`{{name}}` is experimental',
    },
    defaultOptions: [{ ignorePackages: [] }],
  },
  create(context, [{ ignorePackages = [] }]) {
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

        if (shouldIgnoreDueToPackages(symbols, ignorePackages)) {
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
