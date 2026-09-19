import type { Rule } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { updateJsonInTree, updateSchematicDefaults } from '../../utils';
import { updateDependencies } from '../utils/dependencies';

const updatedTypeScriptESLintVersion = '5.43.0';
const updatedESLintVersion = '8.28.0';

export default function migration(): Rule {
  return chain([
    updateDependencies([
      {
        packageName: '@typescript-eslint/eslint-plugin',
        version: `^${updatedTypeScriptESLintVersion}`,
      },
      {
        packageName: '@typescript-eslint/utils',
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
      return updateSchematicDefaults(
        json,
        '@angular-eslint/schematics:application',
        {
          setParserOptionsProject: true,
        },
      );
    }),
    updateJsonInTree('angular.json', (json) => {
      return updateSchematicDefaults(
        json,
        '@angular-eslint/schematics:library',
        {
          setParserOptionsProject: true,
        },
      );
    }),
  ]);
}
