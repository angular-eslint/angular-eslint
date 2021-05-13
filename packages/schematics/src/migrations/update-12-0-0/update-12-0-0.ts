import type { Rule } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { updateDependencies } from '../utils/dependencies';

const updatedAngularESLintVersion = 'next';

export default function migration(): Rule {
  return chain([
    updateDependencies([
      {
        packageName: '@angular-eslint/builder',
        version: updatedAngularESLintVersion,
      },
      {
        packageName: '@angular-eslint/eslint-plugin',
        version: updatedAngularESLintVersion,
      },
      {
        packageName: '@angular-eslint/eslint-plugin-template',
        version: updatedAngularESLintVersion,
      },
      {
        packageName: '@angular-eslint/template-parser',
        version: updatedAngularESLintVersion,
      },
    ]),
  ]);
}
