import { Tree } from '@angular-devkit/schematics';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import type { Linter } from 'eslint';
import {
  updateArrPropAndRemoveDuplication,
  updateObjPropAndRemoveDuplication,
} from '../../src/convert-tslint-to-eslint/utils';
import { isTSLintUsedInWorkspace } from '../../src/utils';

describe('utils', () => {
  describe('isTSLintUsedInWorkspace()', () => {
    const testCases = [
      {
        angularJson: {
          $schema: './node_modules/@angular/cli/lib/config/schema.json',
          version: 1,
          newProjectRoot: 'projects',
          projects: {
            foo: {
              projectType: 'application',
              schematics: {},
              root: '',
              sourceRoot: 'src',
              prefix: 'app',
              architect: {
                build: {},
                serve: {},
                'extract-i18n': {},
                test: {},
                lint: {},
                e2e: {},
              },
            },
          },
        },
        expected: false,
      },
      {
        angularJson: {
          $schema: './node_modules/@angular/cli/lib/config/schema.json',
          version: 1,
          newProjectRoot: 'projects',
          projects: {
            foo: {
              projectType: 'application',
              schematics: {},
              root: '',
              sourceRoot: 'src',
              prefix: 'app',
              architect: {
                build: {},
                serve: {},
                'extract-i18n': {},
                test: {},
                lint: {
                  builder: '@angular-devkit/build-angular:tslint',
                  options: {
                    tsConfig: [
                      'tsconfig.app.json',
                      'tsconfig.spec.json',
                      'e2e/tsconfig.json',
                    ],
                    exclude: ['**/node_modules/**'],
                  },
                  e2e: {},
                },
              },
            },
          },
        },
        expected: true,
      },
    ];

    testCases.forEach((tc, i) => {
      it(`should return true if TSLint is still being used in the workspace, CASE ${i}`, () => {
        const workspaceTree = new UnitTestTree(Tree.empty());
        workspaceTree.create('angular.json', JSON.stringify(tc.angularJson));
        expect(isTSLintUsedInWorkspace(workspaceTree)).toEqual(tc.expected);
      });
    });
  });

  describe('updateArrPropAndRemoveDuplication()', () => {
    interface TestCase {
      json: Linter.Config;
      configBeingExtended: Linter.Config;
      arrPropName: string;
      deleteIfUltimatelyEmpty: boolean;
      expectedJSON: Linter.Config;
    }

    const testCases: TestCase[] = [
      {
        json: {
          extends: ['eslint:recommended'],
        },
        configBeingExtended: {
          extends: ['eslint:recommended'],
        },
        arrPropName: 'extends',
        deleteIfUltimatelyEmpty: true,
        expectedJSON: {},
      },
      {
        json: {
          extends: ['eslint:recommended'],
        },
        configBeingExtended: {
          extends: ['eslint:recommended'],
        },
        arrPropName: 'extends',
        deleteIfUltimatelyEmpty: false,
        expectedJSON: {
          extends: [],
        },
      },
      {
        json: {
          extends: ['eslint:recommended', 'something-custom'],
        },
        configBeingExtended: {
          extends: [
            'eslint:recommended',
            'plugin:@typescript-eslint/eslint-recommended',
            'plugin:@typescript-eslint/recommended',
            'prettier',
            'prettier/@typescript-eslint',
          ],
        },
        arrPropName: 'extends',
        deleteIfUltimatelyEmpty: false,
        expectedJSON: {
          extends: ['something-custom'],
        },
      },
      {
        json: {
          plugins: ['@typescript-eslint', 'some-entirely-custom-user-plugin'],
        },
        configBeingExtended: {
          plugins: ['@typescript-eslint'],
        },
        arrPropName: 'plugins',
        deleteIfUltimatelyEmpty: true,
        expectedJSON: {
          plugins: ['some-entirely-custom-user-plugin'],
        },
      },
    ];

    testCases.forEach((tc, i) => {
      it(`should remove duplication between the array property of the first-party config and the config being extended, CASE ${i}`, () => {
        updateArrPropAndRemoveDuplication(
          tc.json,
          tc.configBeingExtended,
          tc.arrPropName,
          tc.deleteIfUltimatelyEmpty,
        );
        expect(tc.json).toEqual(tc.expectedJSON);
      });
    });
  });

  describe('updateObjPropAndRemoveDuplication()', () => {
    interface TestCase {
      json: Linter.Config;
      configBeingExtended: Linter.Config;
      objPropName: string;
      deleteIfUltimatelyEmpty: boolean;
      expectedJSON: Linter.Config;
    }

    const testCases: TestCase[] = [
      {
        json: {},
        configBeingExtended: {},
        objPropName: 'rules',
        deleteIfUltimatelyEmpty: false,
        expectedJSON: {
          rules: {},
        },
      },
      {
        json: {},
        configBeingExtended: {},
        objPropName: 'rules',
        deleteIfUltimatelyEmpty: true,
        expectedJSON: {},
      },
      {
        json: {
          rules: {
            '@typescript-eslint/explicit-member-accessibility': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-parameter-properties': 'off',
          },
        },
        configBeingExtended: {
          rules: {
            '@typescript-eslint/explicit-member-accessibility': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-parameter-properties': 'off',
          },
        },
        objPropName: 'rules',
        deleteIfUltimatelyEmpty: false,
        expectedJSON: {
          rules: {},
        },
      },
      {
        json: {
          rules: {
            'extra-rule-in-first-party': 'error',
            'rule-1-same-despite-options-order': [
              'error',
              { configOption1: true, configOption2: 'SOMETHING' },
            ],
            'rule-2-different-severity': ['off'],
            'rule-3-same-severity-different-options': [
              'error',
              {
                a: false,
              },
            ],
          },
        },
        configBeingExtended: {
          rules: {
            'extra-rule-in-extended': 'error',
            'rule-1-same-despite-options-order': [
              'error',
              { configOption2: 'SOMETHING', configOption1: true },
            ],
            'rule-2-different-severity': ['error'],
            'rule-3-same-severity-different-options': [
              'error',
              {
                a: true,
              },
            ],
          },
        },
        objPropName: 'rules',
        deleteIfUltimatelyEmpty: false,
        expectedJSON: {
          rules: {
            'extra-rule-in-first-party': 'error',
            'rule-2-different-severity': ['off'],
            'rule-3-same-severity-different-options': [
              'error',
              {
                a: false,
              },
            ],
          },
        },
      },
      {
        json: {
          settings: { react: { version: 'detect' } },
        },
        configBeingExtended: {
          settings: { react: { version: 'detect' } },
        },
        objPropName: 'settings',
        deleteIfUltimatelyEmpty: true,
        expectedJSON: {},
      },
      {
        json: {
          // Different env in first party config
          env: {
            browser: true,
            commonjs: false,
            es6: false,
            jest: true,
            node: true,
          },
        },
        configBeingExtended: {
          env: {
            browser: true,
            commonjs: true,
            es6: true,
            jest: true,
            node: false,
          },
        },
        objPropName: 'env',
        deleteIfUltimatelyEmpty: true,
        expectedJSON: {
          env: {
            commonjs: false,
            es6: false,
            node: true,
          },
        },
      },
    ];

    testCases.forEach((tc, i) => {
      it(`should remove duplication between the object property of the first-party config and the config being extended, CASE ${i}`, () => {
        updateObjPropAndRemoveDuplication(
          tc.json,
          tc.configBeingExtended,
          tc.objPropName,
          tc.deleteIfUltimatelyEmpty,
        );
        expect(tc.json).toEqual(tc.expectedJSON);
      });
    });
  });
});
