import { chain, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import type { Linter } from 'eslint';
import {
  getAllSourceFilesForProject,
  readJsonInTree,
  updateJsonInTree,
} from '../../utils';

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

function removeRuleFromESLintConfig(ruleName: string, config: Linter.Config) {
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

function removeUsePipeDecorator(host: Tree) {
  const angularJSON = readJsonInTree(host, 'angular.json');

  const rules = [
    // Remove from root config
    updateJsonInTree('.eslintrc.json', (json) => {
      removeRuleFromESLintConfig('use-pipe-decorator', json);
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
      // Remove from project configs
      updateJsonInTree(projectESLintConfigPath.toString(), (json) => {
        removeRuleFromESLintConfig('use-pipe-decorator', json);
        return json;
      }),
    );
  }

  return chain(rules);
}

export default function () {
  return chain([updateRelevantDependencies, removeUsePipeDecorator]);
}
