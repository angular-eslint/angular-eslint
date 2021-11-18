import type { Rule } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { updateDependencies } from '../utils/dependencies';

const updatedTypeScriptESLintVersion = '5.3.0';
const updatedESLintVersion = '8.2.0';

export default function migration(): Rule {
  return chain([
    updateDependencies([
      {
        packageName: '@typescript-eslint/eslint-plugin',
        version: updatedTypeScriptESLintVersion,
      },
      {
        packageName: '@typescript-eslint/experimental-utils',
        version: updatedTypeScriptESLintVersion,
      },
      {
        packageName: '@typescript-eslint/parser',
        version: updatedTypeScriptESLintVersion,
      },
      {
        packageName: 'eslint',
        version: `^${updatedESLintVersion}`,
      },
    ]),
  ]);
}
