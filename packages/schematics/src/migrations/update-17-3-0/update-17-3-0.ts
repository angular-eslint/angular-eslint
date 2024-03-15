import type { Rule } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { updateDependencies } from '../utils/dependencies';

const updatedTypeScriptESLintVersion = '7.2.0';
const updatedESLintVersion = '8.57.0';

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
  ]);
}
