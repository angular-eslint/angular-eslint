import { join, normalize } from '@angular-devkit/core';
import {
  chain,
  noop,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import eslintPlugin from '@angular-eslint/eslint-plugin';
import eslintPluginTemplate from '@angular-eslint/eslint-plugin-template';
import * as assert from 'assert';
import {
  addESLintTargetToProject,
  getProjectConfig,
  offsetFromRoot,
  readJsonInTree,
  updateJsonInTree,
} from '../utils';
import { convertToESLintConfig } from './convert-to-eslint-config';
import { Schema } from './schema';

const eslintPluginConfigBase: any = eslintPlugin.configs.base;
const eslintPluginConfigRecommended: any = eslintPlugin.configs.recommended;
const eslintPluginTemplateConfigRecommended: any =
  eslintPluginTemplate.configs.recommended;

export default function convert(schema: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const { root: projectRoot } = getProjectConfig(tree, schema.project);

    // Existing files
    const rootTslintJsonPath = join(normalize(tree.root.path), 'tslint.json');

    // May or may not exist yet
    const rootEslintrcJsonPath = join(
      normalize(tree.root.path),
      '.eslintrc.json',
    );

    // Default Angular CLI project at the root of the workspace
    if (projectRoot === '') {
      return chain([
        // Overwrite the "lint" target directly
        addESLintTargetToProject(schema.project, 'lint'),
        convertRootTSLintConfig('tslint.json', rootEslintrcJsonPath),
        (tree) => {
          // This still seems to be generated as an empty file
          // TODO: Fix in tslint-to-eslint-config library
          const tslintToEslintConfigLogPath = 'tslint-to-eslint-config.log';
          if (tree.exists(tslintToEslintConfigLogPath)) {
            tree.delete(tslintToEslintConfigLogPath);
          }
        },
      ]);
    }

    /**
     * If we got to this point then the workspace has been set up with one or more
     * projects nested within the `projects/` directory
     */

    // Existing files
    const projectTslintJsonPath = join(normalize(projectRoot), 'tslint.json');

    // Will be created as part of the chain
    const projectEslintrcJsonPath = join(
      normalize(projectRoot),
      '.eslintrc.json',
    );

    /**
     * If the root .eslintrc.json does not exist at the time of running the schematic
     * this is the first project within the workspace that is being converted.
     *
     * The addLintFiles() util will handle creating the root .eslintrc.json file with the
     * standard global config that Nx creates for all new workspaces.
     *
     * Therefore we record at this point that this is will be new global config, ready to
     * convert the root tslint.json file later on in the chain and merge it with the standard
     * Nx root .eslintrc.json contents.
     **/
    const hasExistingRootEslintrcConfig = tree.exists(rootEslintrcJsonPath);

    console.log('rootTslintJsonPath', rootTslintJsonPath);
    console.log('projectTslintJsonPath', projectTslintJsonPath);
    console.log('rootEslintrcJsonPath', rootEslintrcJsonPath);
    console.log('projectEslintrcJsonPath', projectEslintrcJsonPath);
    console.log(hasExistingRootEslintrcConfig);

    return chain([
      // Overwrite the "lint" target directly
      addESLintTargetToProject(schema.project, 'lint'),
      removeExtendsFromProjectTSLint(tree, projectTslintJsonPath),
      hasExistingRootEslintrcConfig ? noop() : noop(),
    ]);
  };
}

function removeExtendsFromProjectTSLint(
  tree: Tree,
  projectTslintJsonPath: string,
): Rule {
  /**
   * Remove the relative extends to the root TSLint config before converting,
   * otherwise all the root config will be included
   */
  // TODO: Extract to function and add unit tests
  return updateJsonInTree(projectTslintJsonPath, (json) => {
    if (!json.extends) {
      return json;
    }
    const extendsFromRoot = `${offsetFromRoot(tree.root.path)}tslint.json`;

    if (Array.isArray(json.extends) && json.extends.length) {
      json.extends = json.extends.filter(
        (ext: string) => ext !== extendsFromRoot,
      );
    }
    if (typeof json.extends === 'string' && json.extends === extendsFromRoot) {
      delete json.extends;
    }
    return json;
  });
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
              '@angular-eslint/eslint-plugin', // this is another alias to deduping
              '@angular-eslint/eslint-plugin-template', // will be handled in separate overrides block
              '@typescript-eslint/tslint', // see note on not depending on TSLint fallback
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
         * // FORMATTING!
         * "import-spacing": true
         *
         * // POSSIBLY NOT REQUIRED - typescript-eslint provides explicit-function-return-type (not yet enabled)
         * "typedef": [
         *    true,
         *    "call-signature",
         *  ]
         *
         * // FORMATTING!
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

          // "spaced-comment": [
          //   "error",
          //   "always",
          //   {
          //     "markers": ["/"]
          //   }
          // ],
          delete convertedRootESLintConfig.rules['spaced-comment'];
          // "jsdoc/check-indentation": "error",
          delete convertedRootESLintConfig.rules['jsdoc/check-indentation'];

          /**
           * We want to use these ones differently (with different rule config) to
           * how they were converted, so they wouldn't be cleaned up by our deduplication logic
           * and we have to manually remove them.
           */
          delete convertedRootESLintConfig.rules['@typescript-eslint/quotes'];
          delete convertedRootESLintConfig.rules['no-restricted-imports'];

          /**
           * We have handled this in eslint-plugin recommended.json, any subtle differences that would
           * cause the deduplication logic not to find a match can be addressed via PRs to the recommended
           * config in the plugin
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
              ...(convertedRootESLintConfig.extends || []),
            ],
            plugins: convertedRootESLintConfig.plugins || undefined,
            rules: convertedRules,
          },

          {
            files: ['*.component.html'],
            extends: ['plugin:@angular-eslint/template/recommended'],
            rules: templateRules,
          },

          {
            files: ['*.component.ts'],
            extends: [
              'plugin:@angular-eslint/template/process-inline-templates',
            ],
            settings: {
              /**
               * Leverage the fact that settings can be arbitrary key value pairs to create some inline documentation
               * that will survive JSON (de-)serialization.
               */
              ANGULAR_ESLINT_DOCUMENTATION_NOTE:
                'This entry in the overrides is only here to extract inline templates from Components, you should not configure rules here',
            },
          },
        ];

        // No longer relevant/required
        delete convertedRootESLintConfig.parser;
        delete convertedRootESLintConfig.parserOptions;

        // All applied in the .ts overrides block
        delete convertedRootESLintConfig.rules;
        delete convertedRootESLintConfig.plugins;
        delete convertedRootESLintConfig.extends;

        return convertedRootESLintConfig;
      }),
    ]);
  };
}

export function updateArrPropAndRemoveDuplication(
  json: Record<string, any>,
  configBeingExtended: Record<string, any>,
  arrPropName: string,
  deleteIfUltimatelyEmpty: boolean,
): void {
  json[arrPropName] = json[arrPropName] || [];
  configBeingExtended[arrPropName] = configBeingExtended[arrPropName] || [];
  json[arrPropName] = json[arrPropName].filter(
    (extended: string) => !configBeingExtended[arrPropName].includes(extended),
  );
  json[arrPropName] = Array.from(new Set(json[arrPropName]));
  if (deleteIfUltimatelyEmpty && json[arrPropName].length === 0) {
    delete json[arrPropName];
  }
}

export function updateObjPropAndRemoveDuplication(
  json: Record<string, any>,
  configBeingExtended: Record<string, any>,
  objPropName: string,
  deleteIfUltimatelyEmpty: boolean,
): void {
  json[objPropName] = json[objPropName] || {};
  configBeingExtended[objPropName] = configBeingExtended[objPropName] || {};

  for (const [name, val] of Object.entries(json[objPropName])) {
    const valueOfSamePropInExtendedConfig =
      configBeingExtended[objPropName][name];

    try {
      assert.deepStrictEqual(val, valueOfSamePropInExtendedConfig);
      delete json[objPropName][name];
    } catch {}
  }

  if (deleteIfUltimatelyEmpty && Object.keys(json[objPropName]).length === 0) {
    delete json[objPropName];
  }
}

function ensureESLintPluginsAreInstalled(
  eslintPluginsToBeInstalled: string[],
): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!eslintPluginsToBeInstalled?.length) {
      return;
    }

    if (!host.exists('package.json')) {
      throw new Error(
        'Could not find a `package.json` file at the root of your workspace',
      );
    }

    const projectPackageJSON = host.read('package.json')!.toString('utf-8');
    const json = JSON.parse(projectPackageJSON);
    json.devDependencies = json.devDependencies || {};

    let requiresInstall = false;

    for (const pluginName of eslintPluginsToBeInstalled) {
      if (
        !json.devDependencies[pluginName] &&
        !json.dependencies?.[pluginName]
      ) {
        json.devDependencies[pluginName] = 'latest';
        requiresInstall = true;
      }
    }

    if (requiresInstall) {
      host.overwrite('package.json', JSON.stringify(json, null, 2));
      context.addTask(new NodePackageInstallTask());
    }

    return host;
  };
}
