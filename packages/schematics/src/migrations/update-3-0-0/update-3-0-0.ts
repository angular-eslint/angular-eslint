import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import type { Linter } from 'eslint';
import { updateJsonInTree, visitNotIgnoredFiles } from '../../utils';

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

function addRecommendedExtraExtendsWhereApplicable(
  config: Linter.LegacyConfig,
) {
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

function applyRecommendedExtraExtends() {
  return chain([
    visitNotIgnoredFiles((filePath) => {
      if (!filePath.endsWith('.eslintrc.json')) {
        return;
      }
      return updateJsonInTree(filePath.toString(), (json) => {
        addRecommendedExtraExtendsWhereApplicable(json);
        return json;
      });
    }),
  ]);
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
}: Linter.LegacyConfig) {
  removeNegativeValuesFromComponentMaxInlineDeclarations(
    rules?.['@angular-eslint/component-max-inline-declarations'],
  );
  for (const override of overrides ?? []) {
    removeNegativeValuesFromComponentMaxInlineDeclarations(
      override.rules?.['@angular-eslint/component-max-inline-declarations'],
    );
  }
}

function updateComponentMaxInlineDeclarations() {
  return chain([
    visitNotIgnoredFiles((filePath) => {
      if (!filePath.endsWith('.eslintrc.json')) {
        return;
      }
      return updateJsonInTree(filePath.toString(), (json) => {
        updateComponentMaxInlineDeclarationsSchema(json);
        return json;
      });
    }),
  ]);
}

export default function (): Rule {
  return chain([
    updateRelevantDependencies,
    applyRecommendedExtraExtends,
    updateComponentMaxInlineDeclarations,
  ]);
}
