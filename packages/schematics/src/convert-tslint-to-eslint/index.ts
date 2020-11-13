import { join, normalize } from '@angular-devkit/core';
import {
  chain,
  noop,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import eslintPlugin from '@angular-eslint/eslint-plugin';
import eslintPluginTemplate from '@angular-eslint/eslint-plugin-template';
import type { Linter } from 'eslint';
import type { TSLintRuleOptions } from 'tslint-to-eslint-config';
import { convertFileComments } from 'tslint-to-eslint-config';
import {
  addESLintTargetToProject,
  getAllSourceFilesForProject,
  getProjectConfig,
  offsetFromRoot,
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

const eslintPluginConfigBaseOriginal: any = eslintPlugin.configs.base;
const eslintPluginConfigRecommendedOriginal: any =
  eslintPlugin.configs.recommended;
const eslintPluginTemplateConfigRecommendedOriginal: any =
  eslintPluginTemplate.configs.recommended;

export default function convert(schema: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    if (tree.exists('tsconfig.base.json')) {
      throw new Error(
        '\nError: Angular CLI v10.1.0 and later (and no `tsconfig.base.json`) is required in order to run this schematic. Please update your workspace and try again.\n',
      );
    }

    const { root: projectRoot, projectType } = getProjectConfig(
      tree,
      schema.project,
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
      addESLintTargetToProject(schema.project, 'lint'),
      ensureRootESLintConfig(tree, rootESLintrcJsonPath),
      convertTSLintDisableCommentsForProject(schema.project),

      isRootAngularProject
        ? noop()
        : removeExtendsFromProjectTSLintConfigBeforeConverting(
            tree,
            projectTSLintJsonPath,
          ),
      isRootAngularProject
        ? noop()
        : convertNonRootTSLintConfig(
            projectRoot,
            projectType,
            projectTSLintJsonPath,
            rootESLintrcJsonPath,
          ),
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
  tree: Tree,
  rootESLintrcJsonPath: string,
): Rule {
  const hasExistingRootESLintrcConfig = tree.exists(rootESLintrcJsonPath);

  return hasExistingRootESLintrcConfig
    ? noop()
    : convertRootTSLintConfig('tslint.json', rootESLintrcJsonPath);
}

function convertRootTSLintConfig(
  rootTSLintJsonPath: string,
  rootESLintrcJsonPath: string,
): Rule {
  return async (tree, context) => {
    const rawRootTSLintJson = readJsonInTree(tree, rootTSLintJsonPath);
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
    const eslintPluginConfigRecommended = {
      ...eslintPluginConfigRecommendedOriginal,
    };
    const eslintPluginTemplateConfigRecommended = {
      ...eslintPluginTemplateConfigRecommendedOriginal,
    };

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

    removeUndesiredRulesFromConfig(convertedRootESLintConfig);

    /**
     * To avoid users' configs being bigger and more verbose than necessary, we perform some
     * deduplication against our underlying recommended configuration that they will extend from.
     */

    dedupePluginsAgainstConfigs(convertedRootESLintConfig, [
      eslintPluginConfigRecommended,
      eslintPluginConfigBase,
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
      eslintPluginConfigRecommended,
    ]);

    dedupeEnvAgainstConfigs(convertedRootESLintConfig, [
      eslintPluginConfigBase,
      eslintPluginConfigRecommended,
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
          'plugin:@angular-eslint/recommended',
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
      ensureESLintPluginsAreInstalled(convertedRoot.ensureESLintPlugins),
      // Create the .eslintrc.json file in the tree using the finalized config
      updateJsonInTree(rootESLintrcJsonPath, () => convertedRootESLintConfig),
    ]);
  };
}

function convertNonRootTSLintConfig(
  projectRoot: string,
  projectType: 'application' | 'library',
  projectTSLintJsonPath: string,
  rootESLintrcJsonPath: string,
): Rule {
  return async (tree, context) => {
    const rawProjectTSLintJson = readJsonInTree(tree, projectTSLintJsonPath);
    const rawRootESLintrcJson = readJsonInTree(tree, rootESLintrcJsonPath);
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
    const eslintPluginConfigRecommended = {
      ...eslintPluginConfigRecommendedOriginal,
    };
    const eslintPluginTemplateConfigRecommended = {
      ...eslintPluginTemplateConfigRecommendedOriginal,
    };

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

    removeUndesiredRulesFromConfig(convertedProjectESLintConfig);

    /**
     * To avoid users' configs being bigger and more verbose than necessary, we perform some
     * deduplication against our underlying recommended configuration that they will extend from,
     * as well as the root config.
     */

    dedupePluginsAgainstConfigs(convertedProjectESLintConfig, [
      eslintPluginConfigRecommended,
      eslintPluginConfigBase,
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
      eslintPluginConfigRecommended,
      rawRootESLintrcJson,
    ]);

    dedupeEnvAgainstConfigs(convertedProjectESLintConfig, [
      eslintPluginConfigBase,
      eslintPluginConfigRecommended,
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

    let project;
    if (projectType === 'application') {
      project = [
        `${projectRoot}/tsconfig.app.json`,
        `${projectRoot}/tsconfig.spec.json`,
        `${projectRoot}/e2e/tsconfig.json`,
      ];
    }
    // Libraries don't have an e2e directory
    if (projectType === 'library') {
      project = [
        `${projectRoot}/tsconfig.lib.json`,
        `${projectRoot}/tsconfig.spec.json`,
      ];
    }

    convertedProjectESLintConfig.overrides = [
      {
        files: ['*.ts'],
        parserOptions: {
          project,
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

function removeUndesiredRulesFromConfig(convertedConfig: Linter.Config) {
  if (!convertedConfig.rules) {
    return;
  }

  delete convertedConfig.rules['@typescript-eslint/tslint/config'];

  /**
   * We really don't want to continue the practice of using a linter
   * for formatting concerns. Please use prettier y'all!
   */
  delete convertedConfig.rules['@typescript-eslint/indent'];

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
  delete convertedConfig.rules['@typescript-eslint/quotes'];
  delete convertedConfig.rules['no-restricted-imports'];

  /**
   * We have handled this in eslint-plugin recommended.json, any subtle differences that would
   * cause the deduplication logic not to find a match can be addressed via PRs to the recommended
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

function likelyContainsTSLintComment(fileContent: string): boolean {
  return fileContent.includes('tslint:');
}

function convertTSLintDisableCommentsForProject(projectName: string): Rule {
  return (tree: Tree) => {
    const allSourceFiles = getAllSourceFilesForProject(tree, projectName);
    const allTypeScriptSourceFiles = allSourceFiles.filter((f) =>
      f.endsWith('.ts'),
    );

    for (const filePath of allTypeScriptSourceFiles) {
      const fileContent = tree.read(filePath)!.toString('utf-8');
      // Avoid updating files if we don't have to
      if (!likelyContainsTSLintComment(fileContent)) {
        continue;
      }
      const updatedFileContent = convertFileComments({ fileContent, filePath });
      tree.overwrite(filePath, updatedFileContent);
    }
  };
}
