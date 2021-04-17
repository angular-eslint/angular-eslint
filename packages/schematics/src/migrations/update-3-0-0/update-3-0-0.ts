import type { SchematicContext, Tree } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import type { Linter } from 'eslint';
import {
  getAllSourceFilesForProject,
  readJsonInTree,
  updateJsonInTree,
} from '../../utils';

const updatedAngularESLintVersion = '^3.0.0';

function updateIfExists(
  deps: Record<string, string> | undefined,
  depName: string,
  updatedVersion: string,
) {
  if (deps?.[depName]) {
    deps[depName] = updatedVersion;
  }
}

function updateRelevantDependencies(host: Tree, context: SchematicContext) {
  return updateJsonInTree('package.json', (json) => {
    /**
     * @angular-eslint
     */
    updateIfExists(
      json.devDependencies,
      '@angular-eslint/builder',
      updatedAngularESLintVersion,
    );
    updateIfExists(
      json.devDependencies,
      '@angular-eslint/eslint-plugin',
      updatedAngularESLintVersion,
    );
    updateIfExists(
      json.devDependencies,
      '@angular-eslint/eslint-plugin-template',
      updatedAngularESLintVersion,
    );
    updateIfExists(
      json.devDependencies,
      '@angular-eslint/template-parser',
      updatedAngularESLintVersion,
    );

    context.addTask(new NodePackageInstallTask());

    return json;
  })(host, context);
}

function addRecommendedExtraExtendsWhereApplicable(config: Linter.Config) {
  // Convert extends to array if applicable
  if (
    typeof config.extends === 'string' &&
    config.extends === 'plugin:@angular-eslint/recommended'
  ) {
    config.extends = [config.extends];
  }
  if (
    Array.isArray(config.extends) &&
    config.extends.includes('plugin:@angular-eslint/recommended')
  ) {
    config.extends.push('plugin:@angular-eslint/recommended--extra');
  }
  if (config.overrides) {
    for (const override of config.overrides) {
      if (
        typeof override.extends === 'string' &&
        override.extends === 'plugin:@angular-eslint/recommended'
      ) {
        override.extends = [override.extends];
      }
      if (
        Array.isArray(override.extends) &&
        override.extends.includes('plugin:@angular-eslint/recommended')
      ) {
        override.extends.push('plugin:@angular-eslint/recommended--extra');
      }
    }
  }
}

function applyRecommendedExtraExtends(host: Tree) {
  const angularJSON = readJsonInTree(host, 'angular.json');

  const rules = [
    // Apply to root config
    updateJsonInTree('.eslintrc.json', (json) => {
      addRecommendedExtraExtendsWhereApplicable(json);
      return json;
    }),
  ];

  for (const projectName of Object.keys(angularJSON.projects)) {
    const allSourceFilesForProject = getAllSourceFilesForProject(
      host,
      projectName,
    );
    const projectESLintConfigPath = allSourceFilesForProject.find((f) =>
      f.endsWith('.eslintrc.json'),
    );
    if (!projectESLintConfigPath) {
      continue;
    }

    rules.push(
      // Apply to project configs
      updateJsonInTree(projectESLintConfigPath.toString(), (json) => {
        addRecommendedExtraExtendsWhereApplicable(json);
        return json;
      }),
    );
  }

  return chain(rules);
}

function removeNegativeValuesFromComponentMaxInlineDeclarations(
  rule: Linter.RuleEntry | undefined,
) {
  if (!Array.isArray(rule) || rule.length !== 2) return;
  const [, currentSchema] = rule;
  rule[1] = Object.entries(currentSchema).reduce(
    (accumulator, [key, value]) => {
      return Number(value) < 0 ? accumulator : { ...accumulator, [key]: value };
    },
    {},
  );
}

function updateComponentMaxInlineDeclarationsSchema({
  overrides,
  rules,
}: Linter.Config) {
  removeNegativeValuesFromComponentMaxInlineDeclarations(
    rules?.['@angular-eslint/component-max-inline-declarations'],
  );
  for (const override of overrides ?? []) {
    removeNegativeValuesFromComponentMaxInlineDeclarations(
      override.rules?.['@angular-eslint/component-max-inline-declarations'],
    );
  }
}

function updateComponentMaxInlineDeclarations(host: Tree) {
  const angularJSON = readJsonInTree(host, 'angular.json');

  const rules = [
    // Update from root config
    updateJsonInTree('.eslintrc.json', (json) => {
      updateComponentMaxInlineDeclarationsSchema(json);
      return json;
    }),
  ];

  for (const projectName of Object.keys(angularJSON.projects)) {
    const allSourceFilesForProject = getAllSourceFilesForProject(
      host,
      projectName,
    );
    const projectESLintConfigPath = allSourceFilesForProject.find((path) =>
      path.endsWith('.eslintrc.json'),
    );
    if (!projectESLintConfigPath) {
      continue;
    }

    rules.push(
      // Update from project configs
      updateJsonInTree(projectESLintConfigPath.toString(), (json) => {
        updateComponentMaxInlineDeclarationsSchema(json);
        return json;
      }),
    );
  }

  return chain(rules);
}

export default function () {
  return chain([
    updateRelevantDependencies,
    applyRecommendedExtraExtends,
    updateComponentMaxInlineDeclarations,
  ]);
}
