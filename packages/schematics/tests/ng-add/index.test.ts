import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Tree } from '@angular-devkit/schematics';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJSON = require('../../package.json');

const eslintVersion = packageJSON.devDependencies['eslint'];
const typescriptESLintVersion =
  packageJSON.devDependencies['@typescript-eslint/utils'];

const schematicRunner = new SchematicTestRunner(
  '@angular-eslint/schematics',
  path.join(__dirname, '../../src/collection.json'),
);

describe('ng-add', () => {
  let workspaceTree: UnitTestTree;

  beforeEach(() => {
    workspaceTree = new UnitTestTree(Tree.empty());
    workspaceTree.create(
      'package.json',
      JSON.stringify({
        // In a real workspace ng-add seems to add @angular-eslint/schematics to dependencies first
        dependencies: {
          '@angular-eslint/schematics': packageJSON.version,
        },
      }),
    );
  });

  describe('standard workspace layout - single existing project', () => {
    beforeEach(() => {
      workspaceTree.create(
        'angular.json',
        JSON.stringify({
          $schema: './node_modules/@angular/cli/lib/config/schema.json',
          version: 1,
          newProjectRoot: 'projects',
          cli: {
            defaultCollection: '@schematics/angular',
          },
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
                e2e: {},
              },
            },
          },
        }),
      );
    });

    it('should add relevant eslint, @angular-eslint and @typescript-eslint packages', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('ng-add', {}, workspaceTree)
        .toPromise();
      const projectPackageJSON = JSON.parse(tree.readContent('/package.json'));
      const devDeps = projectPackageJSON.devDependencies;
      const deps = projectPackageJSON.dependencies;
      const scripts = projectPackageJSON.scripts;

      expect(scripts['lint']).toEqual('ng lint');

      expect(devDeps['eslint']).toEqual(`^${eslintVersion}`);

      expect(devDeps['@angular-eslint/builder']).toEqual(packageJSON.version);
      expect(devDeps['@angular-eslint/eslint-plugin']).toEqual(
        packageJSON.version,
      );
      expect(devDeps['@angular-eslint/eslint-plugin-template']).toEqual(
        packageJSON.version,
      );
      expect(devDeps['@angular-eslint/template-parser']).toEqual(
        packageJSON.version,
      );

      /**
       * Check that ng-add implementation successfully moves @angular-eslint/schematics
       * to be a devDependency
       */
      expect(devDeps['@angular-eslint/schematics']).toEqual(
        packageJSON.version,
      );
      expect(deps['@angular-eslint/schematics']).toBeUndefined();

      expect(devDeps['@typescript-eslint/eslint-plugin']).toEqual(
        typescriptESLintVersion,
      );
      expect(devDeps['@typescript-eslint/parser']).toEqual(
        typescriptESLintVersion,
      );
    });

    it('should remove the old defaultCollection property in angular.json', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('ng-add', {}, workspaceTree)
        .toPromise();
      const angularJson = JSON.parse(tree.readContent('/angular.json'));
      expect(angularJson.cli.defaultCollection).not.toBeDefined();
    });

    it('should set the schematicCollections in angular.json', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('ng-add', {}, workspaceTree)
        .toPromise();
      const angularJson = JSON.parse(tree.readContent('/angular.json'));
      expect(angularJson.cli.schematicCollections).toMatchInlineSnapshot(`
        Array [
          "@angular-eslint/schematics",
        ]
      `);
    });

    it('should create the root .eslintrc.json file', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('ng-add', {}, workspaceTree)
        .toPromise();
      const eslintJson = JSON.parse(tree.readContent('/.eslintrc.json'));
      expect(eslintJson).toMatchInlineSnapshot(`
        Object {
          "ignorePatterns": Array [
            "projects/**/*",
          ],
          "overrides": Array [
            Object {
              "extends": Array [
                "plugin:@angular-eslint/recommended",
                "plugin:@angular-eslint/template/process-inline-templates",
              ],
              "files": Array [
                "*.ts",
              ],
              "parserOptions": Object {
                "createDefaultProgram": true,
                "project": Array [
                  "tsconfig.json",
                  "e2e/tsconfig.json",
                ],
              },
              "rules": Object {
                "@angular-eslint/component-selector": Array [
                  "error",
                  Object {
                    "prefix": "app",
                    "style": "kebab-case",
                    "type": "element",
                  },
                ],
                "@angular-eslint/directive-selector": Array [
                  "error",
                  Object {
                    "prefix": "app",
                    "style": "camelCase",
                    "type": "attribute",
                  },
                ],
              },
            },
            Object {
              "extends": Array [
                "plugin:@angular-eslint/template/recommended",
              ],
              "files": Array [
                "*.html",
              ],
              "rules": Object {},
            },
          ],
          "root": true,
        }
      `);
    });
  });

  describe('workspace created with `--create-application=false` - no existings projects', () => {
    beforeEach(() => {
      workspaceTree.create(
        'angular.json',
        JSON.stringify({
          $schema: './node_modules/@angular/cli/lib/config/schema.json',
          version: 1,
          newProjectRoot: 'projects',
          projects: {},
        }),
      );
    });

    it('should add relevant eslint, @angular-eslint and @typescript-eslint packages', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('ng-add', {}, workspaceTree)
        .toPromise();
      const projectPackageJSON = JSON.parse(tree.readContent('/package.json'));
      const devDeps = projectPackageJSON.devDependencies;
      const deps = projectPackageJSON.dependencies;
      const scripts = projectPackageJSON.scripts;

      expect(scripts['lint']).toEqual('ng lint');

      expect(devDeps['eslint']).toEqual(`^${eslintVersion}`);

      expect(devDeps['@angular-eslint/builder']).toEqual(packageJSON.version);
      expect(devDeps['@angular-eslint/eslint-plugin']).toEqual(
        packageJSON.version,
      );
      expect(devDeps['@angular-eslint/eslint-plugin-template']).toEqual(
        packageJSON.version,
      );
      expect(devDeps['@angular-eslint/template-parser']).toEqual(
        packageJSON.version,
      );

      /**
       * Check that ng-add implementation successfully moves @angular-eslint/schematics
       * to be a devDependency
       */
      expect(devDeps['@angular-eslint/schematics']).toEqual(
        packageJSON.version,
      );
      expect(deps['@angular-eslint/schematics']).toBeUndefined();

      expect(devDeps['@typescript-eslint/eslint-plugin']).toEqual(
        typescriptESLintVersion,
      );
      expect(devDeps['@typescript-eslint/parser']).toEqual(
        typescriptESLintVersion,
      );
    });

    it('should remove the old defaultCollection property in angular.json', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('ng-add', {}, workspaceTree)
        .toPromise();
      const angularJson = JSON.parse(tree.readContent('/angular.json'));
      expect(angularJson.cli.defaultCollection).not.toBeDefined();
    });

    it('should set the schematicCollections in angular.json', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('ng-add', {}, workspaceTree)
        .toPromise();
      const angularJson = JSON.parse(tree.readContent('/angular.json'));
      expect(angularJson.cli.schematicCollections).toMatchInlineSnapshot(`
        Array [
          "@angular-eslint/schematics",
        ]
      `);
    });

    it('should create the root .eslintrc.json file', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('ng-add', {}, workspaceTree)
        .toPromise();
      const eslintJson = JSON.parse(tree.readContent('/.eslintrc.json'));
      expect(eslintJson).toMatchInlineSnapshot(`
        Object {
          "ignorePatterns": Array [
            "projects/**/*",
          ],
          "overrides": Array [
            Object {
              "extends": Array [
                "plugin:@angular-eslint/recommended",
                "plugin:@angular-eslint/template/process-inline-templates",
              ],
              "files": Array [
                "*.ts",
              ],
              "parserOptions": Object {
                "createDefaultProgram": true,
                "project": Array [
                  "tsconfig.json",
                ],
              },
              "rules": Object {},
            },
            Object {
              "extends": Array [
                "plugin:@angular-eslint/template/recommended",
              ],
              "files": Array [
                "*.html",
              ],
              "rules": Object {},
            },
          ],
          "root": true,
        }
      `);
    });
  });

  describe('workspace created with `--create-application=false` - one existing project', () => {
    beforeEach(() => {
      workspaceTree.create(
        'angular.json',
        JSON.stringify({
          $schema: './node_modules/@angular/cli/lib/config/schema.json',
          version: 1,
          newProjectRoot: 'projects',
          projects: {
            foo: {
              projectType: 'application',
              schematics: {
                '@schematics/angular:application': {
                  strict: true,
                },
              },
              root: 'projects/temp',
              sourceRoot: 'projects/temp/src',
              prefix: 'app',
              architect: {
                build: {},
                serve: {},
                'extract-i18n': {},
                test: {},
              },
            },
          },
        }),
      );
    });

    it('should add relevant eslint, @angular-eslint and @typescript-eslint packages', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('ng-add', {}, workspaceTree)
        .toPromise();
      const projectPackageJSON = JSON.parse(tree.readContent('/package.json'));
      const devDeps = projectPackageJSON.devDependencies;
      const deps = projectPackageJSON.dependencies;
      const scripts = projectPackageJSON.scripts;

      expect(scripts['lint']).toEqual('ng lint');

      expect(devDeps['eslint']).toEqual(`^${eslintVersion}`);

      expect(devDeps['@angular-eslint/builder']).toEqual(packageJSON.version);
      expect(devDeps['@angular-eslint/eslint-plugin']).toEqual(
        packageJSON.version,
      );
      expect(devDeps['@angular-eslint/eslint-plugin-template']).toEqual(
        packageJSON.version,
      );
      expect(devDeps['@angular-eslint/template-parser']).toEqual(
        packageJSON.version,
      );

      /**
       * Check that ng-add implementation successfully moves @angular-eslint/schematics
       * to be a devDependency
       */
      expect(devDeps['@angular-eslint/schematics']).toEqual(
        packageJSON.version,
      );
      expect(deps['@angular-eslint/schematics']).toBeUndefined();

      expect(devDeps['@typescript-eslint/eslint-plugin']).toEqual(
        typescriptESLintVersion,
      );
      expect(devDeps['@typescript-eslint/parser']).toEqual(
        typescriptESLintVersion,
      );
    });

    it('should remove the old defaultCollection property in angular.json', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('ng-add', {}, workspaceTree)
        .toPromise();
      const angularJson = JSON.parse(tree.readContent('/angular.json'));
      expect(angularJson.cli.defaultCollection).not.toBeDefined();
    });

    it('should set the schematicCollections in angular.json', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('ng-add', {}, workspaceTree)
        .toPromise();
      const angularJson = JSON.parse(tree.readContent('/angular.json'));
      expect(angularJson.cli.schematicCollections).toMatchInlineSnapshot(`
        Array [
          "@angular-eslint/schematics",
        ]
      `);
    });

    it('should create the root .eslintrc.json file', async () => {
      const tree = await schematicRunner
        .runSchematicAsync('ng-add', {}, workspaceTree)
        .toPromise();
      const eslintJson = JSON.parse(tree.readContent('/.eslintrc.json'));
      expect(eslintJson).toMatchInlineSnapshot(`
        Object {
          "ignorePatterns": Array [
            "projects/**/*",
          ],
          "overrides": Array [
            Object {
              "extends": Array [
                "plugin:@angular-eslint/recommended",
                "plugin:@angular-eslint/template/process-inline-templates",
              ],
              "files": Array [
                "*.ts",
              ],
              "parserOptions": Object {
                "createDefaultProgram": true,
                "project": Array [
                  "tsconfig.json",
                ],
              },
              "rules": Object {
                "@angular-eslint/component-selector": Array [
                  "error",
                  Object {
                    "prefix": "app",
                    "style": "kebab-case",
                    "type": "element",
                  },
                ],
                "@angular-eslint/directive-selector": Array [
                  "error",
                  Object {
                    "prefix": "app",
                    "style": "camelCase",
                    "type": "attribute",
                  },
                ],
              },
            },
            Object {
              "extends": Array [
                "plugin:@angular-eslint/template/recommended",
              ],
              "files": Array [
                "*.html",
              ],
              "rules": Object {},
            },
          ],
          "root": true,
        }
      `);
    });
  });
});
