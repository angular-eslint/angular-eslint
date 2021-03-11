import { chain, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { updateJsonInTree } from '../../utils';

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

export default function () {
  return chain([updateRelevantDependencies]);
}
