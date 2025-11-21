import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { readJsonInTree } from '../../src/utils';

const schematicRunner = new SchematicTestRunner(
  '@angular-eslint/schematics',
  path.join(__dirname, '../../dist/collection.json'),
);

describe('application', () => {
  describe('eslint v8 and .eslintrc.json', () => {
    let appTree: UnitTestTree;

    beforeEach(() => {
      appTree = new UnitTestTree(Tree.empty());
      appTree.create(
        'package.json',
        JSON.stringify({
          devDependencies: {
            // Pre v9 version of ESLint
            eslint: '^8.0.0',
          },
        }),
      );
      appTree.create(
        'angular.json',
        JSON.stringify({
          $schema: './node_modules/@angular/cli/lib/config/schema.json',
          version: 1,
          newProjectRoot: 'projects',
          projects: {},
        }),
      );
    });

    it('should change the lint target to use the @angular-eslint builder', async () => {
      const tree = await schematicRunner.runSchematic(
        'application',
        { name: 'foo' },
        appTree,
      );

      expect(readJsonInTree(tree, 'angular.json').projects.foo.architect.lint)
        .toMatchInlineSnapshot(`
          {
            "builder": "@angular-eslint/builder:lint",
            "options": {
              "lintFilePatterns": [
                "projects/foo/**/*.ts",
                "projects/foo/**/*.html",
              ],
            },
          }
        `);
    });

    it('should add the ESLint config for the project', async () => {
      const tree = await schematicRunner.runSchematic(
        'application',
        {
          name: 'foo',
          prefix: 'something-custom',
        },
        appTree,
      );

      expect(tree.exists('projects/foo/tslint.json')).toBe(false);
      expect(tree.read('projects/foo/.eslintrc.json')?.toString())
        .toMatchInlineSnapshot(`
          "{
            "extends": "../../.eslintrc.json",
            "ignorePatterns": [
              "!**/*"
            ],
            "overrides": [
              {
                "files": [
                  "*.ts"
                ],
                "rules": {
                  "@angular-eslint/directive-selector": [
                    "error",
                    {
                      "type": "attribute",
                      "prefix": "something-custom",
                      "style": "camelCase"
                    }
                  ],
                  "@angular-eslint/component-selector": [
                    "error",
                    {
                      "type": "element",
                      "prefix": "something-custom",
                      "style": "kebab-case"
                    }
                  ]
                }
              },
              {
                "files": [
                  "*.html"
                ],
                "rules": {}
              }
            ]
          }
          "
        `);
    });

    it('should add the ESLint config for the project (--setParserOptionsProject=true)', async () => {
      const tree = await schematicRunner.runSchematic(
        'application',
        {
          name: 'foo',
          prefix: 'something-custom',
          setParserOptionsProject: true,
        },
        appTree,
      );

      expect(tree.exists('projects/foo/tslint.json')).toBe(false);
      expect(tree.read('projects/foo/.eslintrc.json')?.toString())
        .toMatchInlineSnapshot(`
          "{
            "extends": "../../.eslintrc.json",
            "ignorePatterns": [
              "!**/*"
            ],
            "overrides": [
              {
                "files": [
                  "*.ts"
                ],
                "parserOptions": {
                  "project": [
                    "projects/foo/tsconfig.(app|spec).json"
                  ]
                },
                "rules": {
                  "@angular-eslint/directive-selector": [
                    "error",
                    {
                      "type": "attribute",
                      "prefix": "something-custom",
                      "style": "camelCase"
                    }
                  ],
                  "@angular-eslint/component-selector": [
                    "error",
                    {
                      "type": "element",
                      "prefix": "something-custom",
                      "style": "kebab-case"
                    }
                  ]
                }
              },
              {
                "files": [
                  "*.html"
                ],
                "rules": {}
              }
            ]
          }
          "
        `);
    });

    it('should add an appropriate ESLint config extends for a project with a scope in its name', async () => {
      const tree = await schematicRunner.runSchematic(
        'application',
        {
          name: '@foo/bar',
        },
        appTree,
      );

      expect(tree.exists('projects/foo/bar/tslint.json')).toBe(false);
      expect(tree.read('projects/foo/bar/.eslintrc.json')?.toString())
        .toMatchInlineSnapshot(`
          "{
            "extends": "../../../.eslintrc.json",
            "ignorePatterns": [
              "!**/*"
            ],
            "overrides": [
              {
                "files": [
                  "*.ts"
                ],
                "rules": {
                  "@angular-eslint/directive-selector": [
                    "error",
                    {
                      "type": "attribute",
                      "prefix": "app",
                      "style": "camelCase"
                    }
                  ],
                  "@angular-eslint/component-selector": [
                    "error",
                    {
                      "type": "element",
                      "prefix": "app",
                      "style": "kebab-case"
                    }
                  ]
                }
              },
              {
                "files": [
                  "*.html"
                ],
                "rules": {}
              }
            ]
          }
          "
        `);
    });
  });

  describe('eslint v9 and flat config', () => {
    let appTree: UnitTestTree;

    beforeEach(() => {
      appTree = new UnitTestTree(Tree.empty());
      appTree.create('package.json', JSON.stringify({}));
      appTree.create(
        'angular.json',
        JSON.stringify({
          $schema: './node_modules/@angular/cli/lib/config/schema.json',
          version: 1,
          newProjectRoot: 'projects',
          projects: {},
        }),
      );
    });

    it('should change the lint target to use the @angular-eslint builder', async () => {
      const tree = await schematicRunner.runSchematic(
        'application',
        { name: 'foo' },
        appTree,
      );

      expect(readJsonInTree(tree, 'angular.json').projects.foo.architect.lint)
        .toMatchInlineSnapshot(`
          {
            "builder": "@angular-eslint/builder:lint",
            "options": {
              "eslintConfig": "projects/foo/eslint.config.js",
              "lintFilePatterns": [
                "projects/foo/**/*.ts",
                "projects/foo/**/*.html",
              ],
            },
          }
        `);
    });

    it('should add the ESLint config for the project', async () => {
      const tree = await schematicRunner.runSchematic(
        'application',
        {
          name: 'foo',
          prefix: 'something-custom',
        },
        appTree,
      );

      expect(tree.exists('projects/foo/tslint.json')).toBe(false);
      expect(tree.read('projects/foo/eslint.config.js')?.toString())
        .toMatchInlineSnapshot(`
          "// @ts-check
          const { defineConfig } = require("eslint/config");
          const rootConfig = require("../../eslint.config.js");

          module.exports = defineConfig([
            ...rootConfig,
            {
              files: ["**/*.ts"],
              rules: {
                "@angular-eslint/directive-selector": [
                  "error",
                  {
                    type: "attribute",
                    prefix: "something-custom",
                    style: "camelCase",
                  },
                ],
                "@angular-eslint/component-selector": [
                  "error",
                  {
                    type: "element",
                    prefix: "something-custom",
                    style: "kebab-case",
                  },
                ],
              },
            },
            {
              files: ["**/*.html"],
              rules: {},
            }
          ]);
          "
        `);
    });

    it('should add the ESLint config for the project (--setParserOptionsProject=true)', async () => {
      const tree = await schematicRunner.runSchematic(
        'application',
        {
          name: 'foo',
          prefix: 'something-custom',
          setParserOptionsProject: true,
        },
        appTree,
      );

      expect(tree.exists('projects/foo/tslint.json')).toBe(false);
      expect(tree.read('projects/foo/eslint.config.js')?.toString())
        .toMatchInlineSnapshot(`
          "// @ts-check
          const { defineConfig } = require("eslint/config");
          const rootConfig = require("../../eslint.config.js");

          module.exports = defineConfig([
            ...rootConfig,
            {
              files: ["**/*.ts"],
              languageOptions: {
                parserOptions: {
                  projectService: true,
                },
              },
              rules: {
                "@angular-eslint/directive-selector": [
                  "error",
                  {
                    type: "attribute",
                    prefix: "something-custom",
                    style: "camelCase",
                  },
                ],
                "@angular-eslint/component-selector": [
                  "error",
                  {
                    type: "element",
                    prefix: "something-custom",
                    style: "kebab-case",
                  },
                ],
              },
            },
            {
              files: ["**/*.html"],
              rules: {},
            }
          ]);
          "
        `);
    });

    it('should add an appropriate ESLint config extends for a project with a scope in its name', async () => {
      const tree = await schematicRunner.runSchematic(
        'application',
        {
          name: '@foo/bar',
        },
        appTree,
      );

      expect(tree.exists('projects/foo/bar/tslint.json')).toBe(false);
      expect(tree.read('projects/foo/bar/eslint.config.js')?.toString())
        .toMatchInlineSnapshot(`
          "// @ts-check
          const { defineConfig } = require("eslint/config");
          const rootConfig = require("../../../eslint.config.js");

          module.exports = defineConfig([
            ...rootConfig,
            {
              files: ["**/*.ts"],
              rules: {
                "@angular-eslint/directive-selector": [
                  "error",
                  {
                    type: "attribute",
                    prefix: "app",
                    style: "camelCase",
                  },
                ],
                "@angular-eslint/component-selector": [
                  "error",
                  {
                    type: "element",
                    prefix: "app",
                    style: "kebab-case",
                  },
                ],
              },
            },
            {
              files: ["**/*.html"],
              rules: {},
            }
          ]);
          "
        `);
    });
  });
});
