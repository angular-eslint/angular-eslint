import { join, normalize } from '@angular-devkit/core';
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { chain, noop } from '@angular-devkit/schematics';
import type { Linter } from 'eslint';
import type { TSLintRuleOptions } from 'tslint-to-eslint-config';
import {
  addESLintTargetToProject,
  createESLintConfigForProject,
  determineTargetProjectName,
  getProjectConfig,
  getWorkspacePath,
  isTSLintUsedInWorkspace,
  offsetFromRoot,
  readJsonInTree,
  removeTSLintJSONForProject,
  setESLintProjectBasedOnProjectType,
  updateJsonInTree,
  updateSchematicCollections,
} from '../utils';
import {
  convertTSLintDisableCommentsForProject,
  createConvertToESLintConfig,
} from './convert-to-eslint-config';
import type { Schema } from './schema';
import {
  ensureESLintPluginsAreInstalled,
  uninstallTSLintAndCodelyzer,
  updateArrPropAndRemoveDuplication,
  updateObjPropAndRemoveDuplication,
} from './utils';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const eslintPlugin = require('@angular-eslint/eslint-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const eslintPluginTemplate = require('@angular-eslint/eslint-plugin-template');

const eslintPluginConfigBaseOriginal = eslintPlugin.configs.base;
const eslintPluginConfigNgCliCompatOriginal =
  eslintPlugin.configs['ng-cli-compat'];
const eslintPluginConfigNgCliCompatFormattingAddOnOriginal =
  eslintPlugin.configs['ng-cli-compat--formatting-add-on'];
const eslintPluginTemplateConfigRecommendedOriginal =
  eslintPluginTemplate.configs.recommended;

export default function convert(schema: Schema): Rule {
  return (tree: Tree) => {
    if (tree.exists('tsconfig.base.json')) {
      throw new Error(
        '\nError: Angular CLI v10.1.0 and later (and no `tsconfig.base.json`) is required in order to run this schematic. Please update your workspace and try again.\n',
      );
    }

    const projectName = determineTargetProjectName(tree, schema.project);
    if (!projectName) {
      throw new Error(
        '\n' +
          `
Error: You must specify a project to convert because you have multiple projects in your angular.json

E.g. npx ng g @angular-eslint/schematics:convert-tslint-to-eslint {{YOUR_PROJECT_NAME_GOES_HERE}}
        `.trim(),
      );
    }

    const { root: projectRoot, projectType } = getProjectConfig(
      tree,
      projectName,
    );

    // Default Angular CLI project at the root of the workspace
    const isRootAngularProject: boolean = projectRoot === '';

    // May or may not exist yet depending on if this is the root project, or a later one from projects/
    const rootESLintrcJsonPath = join(
      normalize(tree.root.path),
      '.eslintrc.json',
    );

    // Already exists, will be converted
    const projectTSLintJsonPath = join(normalize(projectRoot), 'tslint.json');

    return chain([
      // Overwrite the "lint" target directly for the selected project in the angular.json
      addESLintTargetToProject(projectName, 'lint'),
      ensureRootESLintConfig(schema, tree, projectName, rootESLintrcJsonPath),
      convertTSLintDisableCommentsForProject(projectName),

      isRootAngularProject || schema.ignoreExistingTslintConfig
        ? noop()
        : removeExtendsFromProjectTSLintConfigBeforeConverting(
            tree,
            projectTSLintJsonPath,
          ),
      isRootAngularProject
        ? noop()
        : schema.ignoreExistingTslintConfig
        ? chain([
            // Create the latest recommended ESLint config file for the project
            createESLintConfigForProject(projectName),
            // Delete the TSLint config file for the project
            removeTSLintJSONForProject(projectName),
          ])
        : convertNonRootTSLintConfig(
            schema,
            projectRoot,
            projectType,
            projectTSLintJsonPath,
            rootESLintrcJsonPath,
          ),
      function cleanUpTSLintIfNoLongerInUse(tree) {
        if (
          schema.removeTslintIfNoMoreTslintTargets &&
          !isTSLintUsedInWorkspace(tree)
        ) {
          tree.delete(join(normalize(tree.root.path), 'tslint.json'));
          return chain([
            /**
             * Update the schematicCollections to prefer @angular-eslint so that future projects within
             * the same workspace will also use ESLint
             */
            updateJsonInTree(getWorkspacePath(tree), (json) =>
              updateSchematicCollections(json),
            ),
            uninstallTSLintAndCodelyzer(),
          ]);
        }
        return undefined;
      },
    ]);
  };
}

/**
 * Because the Angular CLI supports multi-project workspaces we could be in a situation
 * where the user is converting a project which is not the standard one at the root of
 * the workspace, and they have not previously converted their root project (or it doesn't
 * exist because they generated their workspace with no default app and only use the projects/
 * directory).
 *
 * We therefore need to ensure that, before we convert a specific project, we have a root level
 * .eslintrc.json available to us to extend from.
 */
function ensureRootESLintConfig(
  schema: Schema,
  tree: Tree,
  projectName: string,
  rootESLintrcJsonPath: string,
): Rule {
  const hasExistingRootESLintrcConfig = tree.exists(rootESLintrcJsonPath);
  if (hasExistingRootESLintrcConfig) {
    return noop();
  }

  /**
   * When ignoreExistingTslintConfig is set, Do not perform a conversion of the root
   * TSLint config and instead switch the workspace directly to using the latest
   * recommended ESLint config.
   */
  if (schema.ignoreExistingTslintConfig) {
    const workspaceJson = readJsonInTree(tree, getWorkspacePath(tree));
    const prefix = workspaceJson.projects[projectName].prefix || 'app';

    return updateJsonInTree(rootESLintrcJsonPath, () => ({
      root: true,
      // Each additional project is linted independently
      ignorePatterns: ['projects/**/*'],
      overrides: [
        {
          files: ['*.ts'],
          parserOptions: {
            project: ['tsconfig.json', 'e2e/tsconfig.json'],
            createDefaultProgram: true,
          },
          extends: [
            'plugin:@angular-eslint/recommended',
            'plugin:@angular-eslint/template/process-inline-templates',
          ],
          rules: {
            '@angular-eslint/component-selector': [
              'error',
              {
                prefix,
                style: 'kebab-case',
                type: 'element',
              },
            ],
            '@angular-eslint/directive-selector': [
              'error',
              {
                prefix,
                style: 'camelCase',
                type: 'attribute',
              },
            ],
          },
        },

        {
          files: ['*.html'],
          extends: ['plugin:@angular-eslint/template/recommended'],
          rules: {},
        },
      ],
    }));
  }

  return convertRootTSLintConfig(schema, 'tslint.json', rootESLintrcJsonPath);
}

function convertRootTSLintConfig(
  schema: Schema,
  rootTSLintJsonPath: string,
  rootESLintrcJsonPath: string,
): Rule {
  return async (tree, context) => {
    const rawRootTSLintJson = readJsonInTree(tree, rootTSLintJsonPath);
    const convertToESLintConfig = createConvertToESLintConfig(context);
    const convertedRoot = await convertToESLintConfig(
      'tslint.json',
      rawRootTSLintJson,
    );

    const convertedRootESLintConfig = convertedRoot.convertedESLintConfig;

    warnInCaseOfUnconvertedRules(
      context,
      rootTSLintJsonPath,
      convertedRoot.unconvertedTSLintRules,
    );

    // We mutate these as part of the transformations, so make copies first
    const eslintPluginConfigBase = { ...eslintPluginConfigBaseOriginal };
    const eslintPluginConfigNgCliCompat = {
      ...eslintPluginConfigNgCliCompatOriginal,
    };
    const eslintPluginConfigNgCliCompatFormattingAddOn = {
      ...eslintPluginConfigNgCliCompatFormattingAddOnOriginal,
    };
    const eslintPluginTemplateConfigRecommended = {
      ...eslintPluginTemplateConfigRecommendedOriginal,
    };

    /**
     * Force these 2 rules to be defined in the user's .eslintrc.json by removing
     * them from the comparison config before deduping
     */
    delete eslintPluginConfigNgCliCompat.rules[
      '@angular-eslint/directive-selector'
    ];
    delete eslintPluginConfigNgCliCompat.rules[
      '@angular-eslint/component-selector'
    ];

    removeUndesiredRulesFromConfig(convertedRootESLintConfig);
    adjustSomeRuleConfigs(convertedRootESLintConfig);
    handleFormattingRules(schema, context, convertedRootESLintConfig);

    /**
     * To avoid users' configs being bigger and more verbose than necessary, we perform some
     * deduplication against our underlying ng-cli-compat configuration that they will extend from.
     */

    dedupePluginsAgainstConfigs(convertedRootESLintConfig, [
      eslintPluginConfigBase,
      eslintPluginConfigNgCliCompat,
      eslintPluginConfigNgCliCompatFormattingAddOn,
      {
        plugins: [
          '@angular-eslint/eslint-plugin', // this is another alias to consider when deduping
          '@angular-eslint/eslint-plugin-template', // will be handled in separate overrides block
          '@typescript-eslint/tslint', // see note on not depending on not wanting to depend on TSLint fallback
        ],
      },
    ]);

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

    dedupeRulesAgainstConfigs(convertedRootESLintConfig, [
      eslintPluginConfigBase,
      eslintPluginConfigNgCliCompat,
      eslintPluginConfigNgCliCompatFormattingAddOn,
    ]);

    dedupeEnvAgainstConfigs(convertedRootESLintConfig, [
      eslintPluginConfigBase,
      eslintPluginConfigNgCliCompat,
      eslintPluginConfigNgCliCompatFormattingAddOn,
    ]);

    const { codeRules, templateRules } = separateCodeAndTemplateRules(
      convertedRootESLintConfig,
    );

    updateObjPropAndRemoveDuplication(
      { rules: templateRules },
      eslintPluginTemplateConfigRecommended,
      'rules',
      false,
    );

    convertedRootESLintConfig.root = true;

    // Each additional project is linted independently
    convertedRootESLintConfig.ignorePatterns = ['projects/**/*'];

    convertedRootESLintConfig.overrides = [
      {
        files: ['*.ts'],
        parserOptions: {
          project: ['tsconfig.json', 'e2e/tsconfig.json'],
          createDefaultProgram: true,
        },
        extends: [
          'plugin:@angular-eslint/ng-cli-compat',
          'plugin:@angular-eslint/ng-cli-compat--formatting-add-on',
          'plugin:@angular-eslint/template/process-inline-templates',
          ...(convertedRootESLintConfig.extends || []),
        ],
        plugins: convertedRootESLintConfig.plugins || undefined,
        rules: codeRules,
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

    // All applied in the .ts overrides block so should no longer be at the root of the config
    delete convertedRootESLintConfig.rules;
    delete convertedRootESLintConfig.plugins;
    delete convertedRootESLintConfig.extends;

    return chain([
      ensureESLintPluginsAreInstalled(
        Array.from(
          new Set([
            /**
             * These three plugins are needed for the ng-cli-compat config
             */
            'eslint-plugin-import',
            'eslint-plugin-jsdoc',
            'eslint-plugin-prefer-arrow',
            ...convertedRoot.ensureESLintPlugins,
          ]),
        ),
      ),
      // Create the .eslintrc.json file in the tree using the finalized config
      updateJsonInTree(rootESLintrcJsonPath, () => convertedRootESLintConfig),
    ]);
  };
}

function convertNonRootTSLintConfig(
  schema: Schema,
  projectRoot: string,
  projectType: 'application' | 'library',
  projectTSLintJsonPath: string,
  rootESLintrcJsonPath: string,
): Rule {
  return async (tree, context) => {
    const rawProjectTSLintJson = readJsonInTree(tree, projectTSLintJsonPath);
    const rawRootESLintrcJson = readJsonInTree(tree, rootESLintrcJsonPath);
    const convertToESLintConfig = createConvertToESLintConfig(context);
    const convertedProject = await convertToESLintConfig(
      projectTSLintJsonPath,
      rawProjectTSLintJson,
    );

    const convertedProjectESLintConfig = convertedProject.convertedESLintConfig;

    warnInCaseOfUnconvertedRules(
      context,
      projectTSLintJsonPath,
      convertedProject.unconvertedTSLintRules,
    );

    // We mutate these as part of the transformations, so make copies first
    const eslintPluginConfigBase = { ...eslintPluginConfigBaseOriginal };
    const eslintPluginConfigNgCliCompat = {
      ...eslintPluginConfigNgCliCompatOriginal,
    };
    const eslintPluginConfigNgCliCompatFormattingAddOn = {
      ...eslintPluginConfigNgCliCompatFormattingAddOnOriginal,
    };
    const eslintPluginTemplateConfigRecommended = {
      ...eslintPluginTemplateConfigRecommendedOriginal,
    };

    /**
     * Force these 2 rules to be defined in the user's .eslintrc.json by removing
     * them from the comparison config before deduping
     */
    delete eslintPluginConfigNgCliCompat.rules[
      '@angular-eslint/directive-selector'
    ];
    delete eslintPluginConfigNgCliCompat.rules[
      '@angular-eslint/component-selector'
    ];

    removeUndesiredRulesFromConfig(convertedProjectESLintConfig);
    adjustSomeRuleConfigs(convertedProjectESLintConfig);
    handleFormattingRules(schema, context, convertedProjectESLintConfig);

    /**
     * To avoid users' configs being bigger and more verbose than necessary, we perform some
     * deduplication against our underlying ng-cli-compat configuration that they will extend from,
     * as well as the root config.
     */

    dedupePluginsAgainstConfigs(convertedProjectESLintConfig, [
      eslintPluginConfigBase,
      eslintPluginConfigNgCliCompat,
      eslintPluginConfigNgCliCompatFormattingAddOn,
      {
        plugins: [
          '@angular-eslint/eslint-plugin', // this is another alias to consider when deduping
          '@angular-eslint/eslint-plugin-template', // will be handled in separate overrides block
          '@typescript-eslint/tslint', // see note on not depending on not wanting to depend on TSLint fallback
        ],
      },
    ]);

    updateArrPropAndRemoveDuplication(
      convertedProjectESLintConfig,
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

    dedupeRulesAgainstConfigs(convertedProjectESLintConfig, [
      eslintPluginConfigBase,
      eslintPluginConfigNgCliCompat,
      eslintPluginConfigNgCliCompatFormattingAddOn,
      rawRootESLintrcJson,
    ]);

    dedupeEnvAgainstConfigs(convertedProjectESLintConfig, [
      eslintPluginConfigBase,
      eslintPluginConfigNgCliCompat,
      eslintPluginConfigNgCliCompatFormattingAddOn,
      rawRootESLintrcJson,
    ]);

    const { codeRules, templateRules } = separateCodeAndTemplateRules(
      convertedProjectESLintConfig,
    );

    updateObjPropAndRemoveDuplication(
      { rules: templateRules },
      eslintPluginTemplateConfigRecommended,
      'rules',
      false,
    );

    const convertedExtends = convertedProjectESLintConfig.extends;
    delete convertedProjectESLintConfig.extends;

    // Extend from the workspace's root config at the top level
    const relativeOffestToRootESLintrcJson = `${offsetFromRoot(
      tree.root.path,
    )}.eslintrc.json`;
    convertedProjectESLintConfig.extends = relativeOffestToRootESLintrcJson;

    convertedProjectESLintConfig.ignorePatterns = ['!**/*'];

    convertedProjectESLintConfig.overrides = [
      {
        files: ['*.ts'],
        parserOptions: {
          project: setESLintProjectBasedOnProjectType(
            projectRoot,
            projectType,
            true,
          ),
          createDefaultProgram: true,
        },
        extends: convertedExtends || undefined,
        plugins: convertedProjectESLintConfig.plugins || undefined,
        rules: codeRules,
      },

      {
        files: ['*.html'],
        rules: templateRules,
      },
    ];

    // No longer relevant/required
    delete convertedProjectESLintConfig.parser;
    delete convertedProjectESLintConfig.parserOptions;

    // All applied in the .ts overrides block so should no longer be at the root of the config
    delete convertedProjectESLintConfig.rules;
    delete convertedProjectESLintConfig.plugins;

    return chain([
      ensureESLintPluginsAreInstalled(convertedProject.ensureESLintPlugins),
      // Create the .eslintrc.json file in the tree using the finalized config
      updateJsonInTree(
        join(normalize(projectRoot), '.eslintrc.json'),
        () => convertedProjectESLintConfig,
      ),
      // Delete the project's tslint.json, it's no longer needed
      (host) => host.delete(projectTSLintJsonPath),
    ]);
  };
}

/**
 * Remove the relative extends to the root TSLint config before converting,
 * otherwise all the root config will be included inline in the project config.
 *
 * NOTE: We have to write this update to disk because part of the conversion logic
 * executes the TSLint CLI which reads from disk - there is no equivalent API within
 * TSLint as a library.
 */
function removeExtendsFromProjectTSLintConfigBeforeConverting(
  tree: Tree,
  projectTSLintJsonPath: string,
): Rule {
  return updateJsonInTree(projectTSLintJsonPath, (json) => {
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

/**
 * Templates and source code require different ESLint config (parsers, plugins etc), so it is
 * critical that we leverage the "overrides" capability in ESLint.
 *
 * We therefore need to split out rules which are intended for Angular Templates and apply them
 * in a dedicated config block which targets HTML files.
 */
function separateCodeAndTemplateRules(convertedESLintConfig: Linter.Config) {
  const codeRules = convertedESLintConfig.rules || {};
  const templateRules: Linter.Config['rules'] = {};

  Object.keys(codeRules).forEach((ruleName) => {
    if (
      ruleName.startsWith('@angular-eslint/template') ||
      ruleName.startsWith('@angular-eslint/eslint-plugin-template')
    ) {
      templateRules[ruleName] = codeRules[ruleName];
    }
  });

  Object.keys(templateRules).forEach((ruleName) => {
    delete codeRules[ruleName];
  });

  return {
    codeRules,
    templateRules,
  };
}

function handleFormattingRules(
  schema: Schema,
  context: SchematicContext,
  convertedConfig: Linter.Config,
) {
  if (!convertedConfig.rules) {
    return;
  }
  if (!schema.convertIndentationRules) {
    delete convertedConfig.rules['@typescript-eslint/indent'];
    return;
  }
  /**
   * We really don't want to encourage the practice of using a linter
   * for formatting concerns. Please use prettier y'all!
   */
  if (convertedConfig.rules['@typescript-eslint/indent']) {
    context.logger.warn(
      `\nWARNING: You are currently using a linting rule to deal with indentation. Linters are not well suited to purely code formatting concerns, such as indentation.`,
    );
    context.logger.warn(
      '\nPer your instructions we have migrated your TSLint indentation configuration to its equivalent in ESLint, but we strongly recommend switching to a dedicated code formatter such as https://prettier.io\n',
    );
  }
}

function adjustSomeRuleConfigs(convertedConfig: Linter.Config) {
  if (!convertedConfig.rules) {
    return;
  }
  /**
   * Adjust the quotes rule to always add allowTemplateLiterals as it is most common and can
   * always be removed by the user if undesired in their case.
   */
  if (convertedConfig.rules['@typescript-eslint/quotes']) {
    if (!Array.isArray(convertedConfig.rules['@typescript-eslint/quotes'])) {
      convertedConfig.rules['@typescript-eslint/quotes'] = [
        convertedConfig.rules['@typescript-eslint/quotes'],
        'single',
      ];
    }
    if (!convertedConfig.rules['@typescript-eslint/quotes'][2]) {
      convertedConfig.rules['@typescript-eslint/quotes'].push({
        allowTemplateLiterals: true,
      });
    }
  }
}

function removeUndesiredRulesFromConfig(convertedConfig: Linter.Config) {
  if (!convertedConfig.rules) {
    return;
  }

  delete convertedConfig.rules['@typescript-eslint/tslint/config'];

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
  delete convertedConfig.rules['spaced-comment'];
  // WAS -> "jsdoc/check-indentation": "error",
  delete convertedConfig.rules['jsdoc/check-indentation'];

  /**
   * We want to use these ones differently (with different rule config) to how they
   * are converted. Because they exist with different config, they wouldn't be cleaned
   * up by our deduplication logic and we have to manually remove them.
   */
  delete convertedConfig.rules['no-restricted-imports'];

  /**
   * We have handled this in eslint-plugin ng-cli-compat.json, any subtle differences that would
   * cause the deduplication logic not to find a match can be addressed via PRs to the ng-cli-compat
   * config in the plugin.
   */
  delete convertedConfig.rules['no-console'];
}

function dedupeEnvAgainstConfigs(
  convertedConfig: Linter.Config,
  otherConfigs: Linter.Config[],
) {
  otherConfigs.forEach((againstConfig) => {
    updateObjPropAndRemoveDuplication(
      convertedConfig,
      againstConfig,
      'env',
      true,
    );
  });
}

function dedupeRulesAgainstConfigs(
  convertedConfig: Linter.Config,
  otherConfigs: Linter.Config[],
) {
  otherConfigs.forEach((againstConfig) => {
    updateObjPropAndRemoveDuplication(
      convertedConfig,
      againstConfig,
      'rules',
      false,
    );
  });
}

function dedupePluginsAgainstConfigs(
  convertedConfig: Linter.Config,
  otherConfigs: Linter.Config[],
) {
  otherConfigs.forEach((againstConfig) => {
    updateArrPropAndRemoveDuplication(
      convertedConfig,
      againstConfig,
      'plugins',
      true,
    );
  });
}

/**
 * We don't want the user to depend on the TSLint fallback plugin, we will instead
 * explicitly inform them of the rules that could not be converted automatically and
 * advise them on what to do next.
 */
function warnInCaseOfUnconvertedRules(
  context: SchematicContext,
  tslintConfigPath: string,
  unconvertedTSLintRules: TSLintRuleOptions[],
): void {
  /*
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
  const unconvertedTSLintRuleNames = unconvertedTSLintRules
    .filter(
      (unconverted) =>
        !['import-spacing', 'whitespace', 'typedef'].includes(
          unconverted.ruleName,
        ),
    )
    .map((unconverted) => unconverted.ruleName);

  if (unconvertedTSLintRuleNames.length > 0) {
    context.logger.warn(
      `\nWARNING: Within "${tslintConfigPath}", the following ${unconvertedTSLintRuleNames.length} rule(s) did not have known converters in https://github.com/typescript-eslint/tslint-to-eslint-config`,
    );
    context.logger.warn('\n  - ' + unconvertedTSLintRuleNames.join('\n  - '));
    context.logger.warn(
      '\nYou will need to decide on how to handle the above manually, but everything else has been handled for you automatically.\n',
    );
  }
}
