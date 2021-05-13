import type { Rule } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { updateDependencies } from '../utils/dependencies';

const updatedAngularESLintVersion = '^12.0.0';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJSON = require('../../../package.json');
const updatedTypeScriptESLintVersion =
  packageJSON.devDependencies['@typescript-eslint/experimental-utils'];
const updatedESLintVersion = packageJSON.devDependencies['eslint'];

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
        version: updatedESLintVersion,
      },
    ]),
  ]);
}
