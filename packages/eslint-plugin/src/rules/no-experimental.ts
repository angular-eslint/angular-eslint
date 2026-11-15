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

const NODE_MODULES_SEGMENT = '/node_modules/';

/**
 * Returns the name of the npm package that owns the given file, based on the
 * segment(s) after the last `node_modules` directory in its path, or
 * `undefined` if the file is not inside `node_modules`.
 *
 * Using the last `node_modules` directory means that nested installs
 * (`node_modules/a/node_modules/b/...`) and pnpm's layout
 * (`node_modules/.pnpm/b@1.0.0/node_modules/b/...`) both resolve to `b`.
 */
function getOwningPackageName(fileName: string): string | undefined {
  const normalizedFileName = `/${fileName.replace(/\\/g, '/')}`;
  const index = normalizedFileName.lastIndexOf(NODE_MODULES_SEGMENT);
  if (index === -1) {
    return undefined;
  }

  const [first, second] = normalizedFileName
    .slice(index + NODE_MODULES_SEGMENT.length)
    .split('/');
  if (!first) {
    return undefined;
  }

  if (first.startsWith('@')) {
    return second ? `${first}/${second}` : undefined;
  }

  return first;
}

function isFileFromIgnoredPackage(
  fileName: string,
  ignorePackages: readonly string[],
): boolean {
  const packageName = getOwningPackageName(fileName);

  return packageName !== undefined && ignorePackages.includes(packageName);
}

function shouldIgnoreDueToPackages(
  symbols: (ts.Symbol | undefined)[],
  ignorePackages: readonly string[],
): boolean {
  if (ignorePackages.length === 0) {
    return false;
  }

  const experimentalSymbols = symbols.filter((symbol) =>
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
              'npm package names whose experimental APIs should not be reported. Each entry must be the name of the package that declares the experimental API, wherever it is installed (including nested `node_modules` and pnpm layouts). An API that one package re-exports from another is only ignored when the declaring package is listed.',
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
