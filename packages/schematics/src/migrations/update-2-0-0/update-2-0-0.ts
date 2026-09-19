import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import type { Linter } from 'eslint';
import { updateJsonInTree, visitNotIgnoredFiles } from '../../utils';

const updatedAngularESLintVersion = '^2.0.0';
const updatedTypeScriptESLintVersion = '4.16.1';

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

    /**
     * @typescript-eslint
     */
    updateIfExists(
      json.devDependencies,
      '@typescript-eslint/parser',
      updatedTypeScriptESLintVersion,
    );
    updateIfExists(
      json.devDependencies,
      '@typescript-eslint/eslint-plugin',
      updatedTypeScriptESLintVersion,
    );

    context.addTask(new NodePackageInstallTask());

    return json;
  })(host, context);
}

function removeRuleFromESLintConfig(
  ruleName: string,
  config: Linter.LegacyConfig,
) {
  if (config.rules && config.rules[ruleName]) {
    delete config.rules[ruleName];
  }
  if (config.overrides) {
    for (const override of config.overrides) {
      if (override.rules && override.rules[ruleName]) {
        delete override.rules[ruleName];
      }
    }
  }
}

function removeUsePipeDecoratorRule() {
  const ruleName = '@angular-eslint/use-pipe-decorator';
  return chain([
    visitNotIgnoredFiles((filePath) => {
      if (!filePath.endsWith('.eslintrc.json')) {
        return;
      }
      return updateJsonInTree(filePath.toString(), (json) => {
        removeRuleFromESLintConfig(ruleName, json);
        return json;
      });
    }),
  ]);
}

export default function (): Rule {
  return chain([updateRelevantDependencies, removeUsePipeDecoratorRule]);
}
