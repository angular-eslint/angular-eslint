import type { Rule } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { updateJsonInTree, updateSchematicCollections } from '../../utils';
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
  ]);
}
