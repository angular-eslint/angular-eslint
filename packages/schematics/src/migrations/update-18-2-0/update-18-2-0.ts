import type { Rule } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { updateDependencies } from '../utils/dependencies';

const updatedTypeScriptESLintVersion = '8.0.0';
const updatedESLintVersion = '9.8.0';

export default function migration(): Rule {
  return chain([
    (host) => {
      const packageJson = JSON.parse(host.read('package.json')!.toString());
      if (
        packageJson.devDependencies['typescript-eslint'] ||
        packageJson.devDependencies['@typescript-eslint/parser'].startsWith(
          '8.',
        ) ||
        packageJson.devDependencies['@typescript-eslint/parser'].startsWith(
          '^8.',
        ) ||
        packageJson.devDependencies['@typescript-eslint/parser'].startsWith(
          '~8.',
        )
      ) {
        return updateDependencies([
          {
            packageName: '@typescript-eslint/eslint-plugin',
            version: `^${updatedTypeScriptESLintVersion}`,
          },
          {
            packageName: '@typescript-eslint/utils',
            version: `^${updatedTypeScriptESLintVersion}`,
          },
          {
            packageName: '@typescript-eslint/type-utils',
            version: `^${updatedTypeScriptESLintVersion}`,
          },
          {
            packageName: '@typescript-eslint/parser',
            version: `^${updatedTypeScriptESLintVersion}`,
          },
          {
            packageName: '@typescript-eslint/rule-tester',
            version: `^${updatedTypeScriptESLintVersion}`,
          },
          {
            packageName: 'typescript-eslint',
            version: `^${updatedTypeScriptESLintVersion}`,
          },
          {
            packageName: 'eslint',
            version: `^${updatedESLintVersion}`,
          },
        ]);
      }
      return undefined;
    },
  ]);
}
