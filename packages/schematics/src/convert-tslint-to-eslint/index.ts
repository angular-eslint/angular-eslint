import { join, normalize } from '@angular-devkit/core';
import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import eslintPlugin from '@angular-eslint/eslint-plugin';
import eslintPluginTemplate from '@angular-eslint/eslint-plugin-template';
import {
  addESLintTargetToProject,
  getProjectConfig,
  readJsonInTree,
  updateJsonInTree,
} from '../utils';
import { convertToESLintConfig } from './convert-to-eslint-config';
import { Schema } from './schema';
import {
  ensureESLintPluginsAreInstalled,
  updateArrPropAndRemoveDuplication,
  updateObjPropAndRemoveDuplication,
} from './utils';

const eslintPluginConfigBase: any = eslintPlugin.configs.base;
const eslintPluginConfigRecommended: any = eslintPlugin.configs.recommended;
const eslintPluginTemplateConfigRecommended: any =
  eslintPluginTemplate.configs.recommended;

export default function convert(schema: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const { root: projectRoot } = getProjectConfig(tree, schema.project);

    // May or may not exist yet depending on if this is the root project, or a later one from projects/
    const rootEslintrcJsonPath = join(
      normalize(tree.root.path),
      '.eslintrc.json',
    );

    // Default Angular CLI project at the root of the workspace
    if (projectRoot === '') {
      return chain([
        // Overwrite the "lint" target directly for the selected project in the angular.json
        addESLintTargetToProject(schema.project, 'lint'),
        convertRootTSLintConfig('tslint.json', rootEslintrcJsonPath),
      ]);
    }

    /**
     * If we got to this point then the workspace has been set up with one or more
     * projects nested within the `projects/` directory
     */
    throw new Error(
      'The "convert-tslint-to-eslint" schematic currently only supports single-project Angular CLI workspaces. Multi-project workspace support is coming soon',
    );
  };
}

function convertRootTSLintConfig(
  rootTslintJsonPath: string,
  rootEslintrcJsonPath: string,
): Rule {
  return async (tree, context) => {
    const rawRootTslintJson = readJsonInTree(tree, rootTslintJsonPath);
    const convertedRoot = await convertToESLintConfig(
      'tslint.json',
      rawRootTslintJson,
    );

    const convertedRootESLintConfig = convertedRoot.convertedESLintConfig;

    return chain([
      ensureESLintPluginsAreInstalled(convertedRoot.ensureESLintPlugins),
      updateJsonInTree(rootEslintrcJsonPath, () => {
        /**
         * Force these 2 rules to be defined in the user's .eslintrc.json by removing
         * them from the comparison config before deduping
         */
        delete eslintPluginConfigRecommended.rules[
          '@angular-eslint/directive-selector'
        ];
        delete eslintPluginConfigRecommended.rules[
          '@angular-eslint/component-selector'
        ];

        /**
         * To avoid users' configs being bigger and more verbose than necessary, we perform some
         * deduplication against our underlying recommended configuration that they will extend from.
         */
        updateArrPropAndRemoveDuplication(
          convertedRootESLintConfig,
          eslintPluginConfigRecommended,
          'plugins',
          true,
        );
        updateArrPropAndRemoveDuplication(
          convertedRootESLintConfig,
          eslintPluginConfigBase,
          'plugins',
          true,
        );
        updateArrPropAndRemoveDuplication(
          convertedRootESLintConfig,
          {
            plugins: [
              '@angular-eslint/eslint-plugin', // this is another alias to consider when deduping
              '@angular-eslint/eslint-plugin-template', // will be handled in separate overrides block
              '@typescript-eslint/tslint', // see note on not depending on not wanting to depend on TSLint fallback
            ],
          },
          'plugins',
          true,
        );

        updateArrPropAndRemoveDuplication(
          convertedRootESLintConfig,
          {
            /**
             * For now, extending from these is too different to what the CLI ships with today, so
             * we remove them from the converted results. We should look to move towards extending
             * from these once we have more influence over the generated code. We don't want users
             * to have lint errors from OOTB generated code.
             */
            extends: [
              'plugin:@typescript-eslint/recommended',
              'plugin:@typescript-eslint/recommended-requiring-type-checking',
            ],
          },
          'extends',
          true,
        );

        /**
         * We don't want the user to depend on the TSLint fallback plugin, we will instead
         * explicitly inform them of the rules that could not be converted automatically and
         * advise them on what to do next.
         *
         * The following rules are known to be missing from the Angular CLI equivalent TSLint
         * setup, so they will be part of our convertedRoot data:
         *
         * // FORMATTING! Please use prettier y'all!
         * "import-spacing": true
         *
         * // POSSIBLY NOT REQUIRED - typescript-eslint provides explicit-function-return-type (not yet enabled)
         * "typedef": [
         *    true,
         *    "call-signature",
         *  ]
         *
         * // FORMATTING! Please use prettier y'all!
         *  "whitespace": [
         *    true,
         *    "check-branch",
         *    "check-decl",
         *    "check-operator",
         *    "check-separator",
         *    "check-type",
         *    "check-typecast",
         *  ]
         */
        const unconvertedTSLintRuleNames = convertedRoot.unconvertedTSLintRules
          .filter(
            (unconverted) =>
              !['import-spacing', 'whitespace', 'typedef'].includes(
                unconverted.ruleName,
              ),
          )
          .map((unconverted) => unconverted.ruleName);

        if (unconvertedTSLintRuleNames.length > 0) {
          context.logger.warn(
            `\nWARNING: Within "${rootTslintJsonPath}", the following ${unconvertedTSLintRuleNames.length} rule(s) did not have known converters in https://github.com/typescript-eslint/tslint-to-eslint-config`,
          );
          context.logger.warn(
            '\n  - ' + unconvertedTSLintRuleNames.join('\n  - '),
          );
          context.logger.warn(
            '\nYou will need to decide on how to handle the above manually, but everything else has been handled for you automatically.\n',
          );
        }

        if (convertedRootESLintConfig.rules) {
          delete convertedRootESLintConfig.rules[
            '@typescript-eslint/tslint/config'
          ];

          /**
           * We really don't want to continue the practice of using a linter
           * for formatting concerns. Please use prettier y'all!
           */
          delete convertedRootESLintConfig.rules['@typescript-eslint/indent'];

          /**
           * BOTH OF THESE RULES CREATE A LOT OF NOISE ON OOTB POLYFILLS.TS
           */

          // WAS -> "spaced-comment": [
          //   "error",
          //   "always",
          //   {
          //     "markers": ["/"]
          //   }
          // ],
          delete convertedRootESLintConfig.rules['spaced-comment'];
          // WAS -> "jsdoc/check-indentation": "error",
          delete convertedRootESLintConfig.rules['jsdoc/check-indentation'];

          /**
           * We want to use these ones differently (with different rule config) to how they
           * are converted. Because they exist with different config, they wouldn't be cleaned
           * up by our deduplication logic and we have to manually remove them.
           */
          delete convertedRootESLintConfig.rules['@typescript-eslint/quotes'];
          delete convertedRootESLintConfig.rules['no-restricted-imports'];

          /**
           * We have handled this in eslint-plugin recommended.json, any subtle differences that would
           * cause the deduplication logic not to find a match can be addressed via PRs to the recommended
           * config in the plugin.
           */
          delete convertedRootESLintConfig.rules['no-console'];
        }

        updateObjPropAndRemoveDuplication(
          convertedRootESLintConfig,
          eslintPluginConfigBase,
          'rules',
          false,
        );
        updateObjPropAndRemoveDuplication(
          convertedRootESLintConfig,
          eslintPluginConfigRecommended,
          'rules',
          false,
        );

        updateObjPropAndRemoveDuplication(
          convertedRootESLintConfig,
          eslintPluginConfigBase,
          'env',
          true,
        );
        updateObjPropAndRemoveDuplication(
          convertedRootESLintConfig,
          eslintPluginConfigRecommended,
          'env',
          true,
        );

        /**
         * Templates and source code require different ESLint config (parsers, plugins etc), so it is
         * critical that we leverage the "overrides" capability in ESLint.
         *
         * We therefore need to split out rules which are intended for Angular Templates and apply them
         * in a dedicated config block which targets HTML files.
         */
        const convertedRules = convertedRootESLintConfig.rules || {};
        const templateRules: any = {};

        Object.keys(convertedRules).forEach((ruleName) => {
          if (
            ruleName.startsWith('@angular-eslint/template') ||
            ruleName.startsWith('@angular-eslint/eslint-plugin-template')
          ) {
            templateRules[ruleName] = convertedRules[ruleName];
          }
        });

        Object.keys(templateRules).forEach((ruleName) => {
          delete convertedRules[ruleName];
        });

        updateObjPropAndRemoveDuplication(
          { rules: templateRules },
          eslintPluginTemplateConfigRecommended,
          'rules',
          false,
        );

        convertedRootESLintConfig.root = true;

        convertedRootESLintConfig.overrides = [
          {
            files: ['*.ts'],
            parserOptions: {
              project: ['tsconfig.*?.json', 'e2e/tsconfig.json'],
              createDefaultProgram: true,
            },
            extends: [
              'plugin:@angular-eslint/recommended',
              'plugin:@angular-eslint/template/process-inline-templates',
              ...(convertedRootESLintConfig.extends || []),
            ],
            plugins: convertedRootESLintConfig.plugins || undefined,
            rules: convertedRules,
          },

          {
            files: ['*.html'],
            extends: ['plugin:@angular-eslint/template/recommended'],
            rules: templateRules,
          },
        ];

        // No longer relevant/required
        delete convertedRootESLintConfig.parser;
        delete convertedRootESLintConfig.parserOptions;

        // All applied in the .ts overrides block so should no longer be at the root fo the config
        delete convertedRootESLintConfig.rules;
        delete convertedRootESLintConfig.plugins;
        delete convertedRootESLintConfig.extends;

        return convertedRootESLintConfig;
      }),
    ]);
  };
}
