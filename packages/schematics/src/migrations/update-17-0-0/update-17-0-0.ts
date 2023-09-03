import type { Rule } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { updateDependencies } from '../utils/dependencies';

const updatedTypeScriptESLintVersion = '6.10.0';
const updatedESLintVersion = '8.53.0';

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
