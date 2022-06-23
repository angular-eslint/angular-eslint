import type { Rule } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  sortObjectByKeys,
  updateJsonInTree,
  updateSchematicCollections,
} from '../../utils';
import { updateDependencies } from '../utils/dependencies';

const updatedTypeScriptESLintVersion = '5.29.0';
const updatedESLintVersion = '8.18.0';

export default function migration(): Rule {
  return chain([
    updateDependencies([
      {
        packageName: '@typescript-eslint/eslint-plugin',
        version: `^${updatedTypeScriptESLintVersion}`,
      },
      {
        packageName: '@typescript-eslint/experimental-utils',
        version: `^${updatedTypeScriptESLintVersion}`,
      },
      {
        packageName: '@typescript-eslint/parser',
        version: `^${updatedTypeScriptESLintVersion}`,
      },
      {
        packageName: 'eslint',
        version: `^${updatedESLintVersion}`,
      },
    ]),
    updateJsonInTree('angular.json', (json) => {
      // Migrate any workspaces which use the original defaultCollection (but only if set to `@angular-eslint/schematics`)
      if (json.cli?.defaultCollection !== '@angular-eslint/schematics') {
        return json;
      }
      return updateSchematicCollections(json);
    }),
    // Migrate from @typescript-eslint/experimental-utils package name to @typescript-eslint/utils
    (host, context) =>
      updateJsonInTree('package.json', (json) => {
        const devDep =
          json.devDependencies?.['@typescript-eslint/experimental-utils'];
        if (!devDep) {
          return json;
        }

        json.devDependencies['@typescript-eslint/utils'] = devDep;
        delete json.devDependencies['@typescript-eslint/experimental-utils'];
        json.devDependencies = sortObjectByKeys(json.devDependencies);

        host.overwrite('package.json', JSON.stringify(json, null, 2));
        context.addTask(new NodePackageInstallTask());

        return json;
      }),
  ]);
}
