import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import {
  FIXED_ESLINT_V8_VERSION,
  FIXED_TYPESCRIPT_ESLINT_V7_VERSION,
} from '../../src/ng-add';

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
  describe('eslint v8 and .eslintrc.json', () => {
    let workspaceTree: UnitTestTree;

    beforeEach(() => {
      workspaceTree = new UnitTestTree(Tree.empty());
      workspaceTree.create(
        'package.json',
        JSON.stringify({
          devDependencies: {
            // The user applied an exiting pre v9 version of eslint, use it as a signal that they want eslint v8 and .eslintrc.json
            eslint: '8.54.0',
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
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const projectPackageJSON = JSON.parse(
          tree.readContent('/package.json'),
        );
        const devDeps = projectPackageJSON.devDependencies;
        const deps = projectPackageJSON.dependencies || {};
        const scripts = projectPackageJSON.scripts;

        expect(scripts['lint']).toEqual('ng lint');

        // Pinned final v8 version
        expect(devDeps['eslint']).toEqual(FIXED_ESLINT_V8_VERSION);

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
          FIXED_TYPESCRIPT_ESLINT_V7_VERSION,
        );
        expect(devDeps['@typescript-eslint/parser']).toEqual(
          FIXED_TYPESCRIPT_ESLINT_V7_VERSION,
        );
      });

      it('should remove the old defaultCollection property in angular.json', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const angularJson = JSON.parse(tree.readContent('/angular.json'));
        expect(angularJson.cli.defaultCollection).not.toBeDefined();
      });

      it('should set the schematicCollections in angular.json', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const angularJson = JSON.parse(tree.readContent('/angular.json'));
        expect(angularJson.cli.schematicCollections).toMatchInlineSnapshot(`
        Array [
          "@angular-eslint/schematics",
        ]
      `);
      });

      it('should create the root .eslintrc.json file', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const eslintJson = JSON.parse(tree.readContent('/.eslintrc.json'));
        expect(eslintJson).toMatchInlineSnapshot(`
        Object {
          "ignorePatterns": Array [
            "projects/**/*",
          ],
          "overrides": Array [
            Object {
              "extends": Array [
                "eslint:recommended",
                "plugin:@typescript-eslint/recommended",
                "plugin:@angular-eslint/recommended",
                "plugin:@angular-eslint/template/process-inline-templates",
              ],
              "files": Array [
                "*.ts",
              ],
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
                "plugin:@angular-eslint/template/accessibility",
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
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const projectPackageJSON = JSON.parse(
          tree.readContent('/package.json'),
        );
        const devDeps = projectPackageJSON.devDependencies;
        const deps = projectPackageJSON.dependencies || {};
        const scripts = projectPackageJSON.scripts;

        expect(scripts['lint']).toEqual('ng lint');

        // Pinned final v8 version
        expect(devDeps['eslint']).toEqual(FIXED_ESLINT_V8_VERSION);

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
          FIXED_TYPESCRIPT_ESLINT_V7_VERSION,
        );
        expect(devDeps['@typescript-eslint/parser']).toEqual(
          FIXED_TYPESCRIPT_ESLINT_V7_VERSION,
        );
      });

      it('should remove the old defaultCollection property in angular.json', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const angularJson = JSON.parse(tree.readContent('/angular.json'));
        expect(angularJson.cli.defaultCollection).not.toBeDefined();
      });

      it('should set the schematicCollections in angular.json', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const angularJson = JSON.parse(tree.readContent('/angular.json'));
        expect(angularJson.cli.schematicCollections).toMatchInlineSnapshot(`
        Array [
          "@angular-eslint/schematics",
        ]
      `);
      });

      it('should create the root .eslintrc.json file', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const eslintJson = JSON.parse(tree.readContent('/.eslintrc.json'));
        expect(eslintJson).toMatchInlineSnapshot(`
        Object {
          "ignorePatterns": Array [
            "projects/**/*",
          ],
          "overrides": Array [
            Object {
              "extends": Array [
                "eslint:recommended",
                "plugin:@typescript-eslint/recommended",
                "plugin:@angular-eslint/recommended",
                "plugin:@angular-eslint/template/process-inline-templates",
              ],
              "files": Array [
                "*.ts",
              ],
              "rules": Object {},
            },
            Object {
              "extends": Array [
                "plugin:@angular-eslint/template/recommended",
                "plugin:@angular-eslint/template/accessibility",
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
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const projectPackageJSON = JSON.parse(
          tree.readContent('/package.json'),
        );
        const devDeps = projectPackageJSON.devDependencies;
        const deps = projectPackageJSON.dependencies || {};
        const scripts = projectPackageJSON.scripts;

        expect(scripts['lint']).toEqual('ng lint');

        // Pinned final v8 version
        expect(devDeps['eslint']).toEqual(FIXED_ESLINT_V8_VERSION);

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
          FIXED_TYPESCRIPT_ESLINT_V7_VERSION,
        );
        expect(devDeps['@typescript-eslint/parser']).toEqual(
          FIXED_TYPESCRIPT_ESLINT_V7_VERSION,
        );
      });

      it('should remove the old defaultCollection property in angular.json', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const angularJson = JSON.parse(tree.readContent('/angular.json'));
        expect(angularJson.cli.defaultCollection).not.toBeDefined();
      });

      it('should set the schematicCollections in angular.json', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const angularJson = JSON.parse(tree.readContent('/angular.json'));
        expect(angularJson.cli.schematicCollections).toMatchInlineSnapshot(`
        Array [
          "@angular-eslint/schematics",
        ]
      `);
      });

      it('should create the root .eslintrc.json file', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const eslintJson = JSON.parse(tree.readContent('/.eslintrc.json'));
        expect(eslintJson).toMatchInlineSnapshot(`
        Object {
          "ignorePatterns": Array [
            "projects/**/*",
          ],
          "overrides": Array [
            Object {
              "extends": Array [
                "eslint:recommended",
                "plugin:@typescript-eslint/recommended",
                "plugin:@angular-eslint/recommended",
                "plugin:@angular-eslint/template/process-inline-templates",
              ],
              "files": Array [
                "*.ts",
              ],
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
                "plugin:@angular-eslint/template/accessibility",
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

  describe('eslint v9 and flat config', () => {
    let workspaceTree: UnitTestTree;

    beforeEach(() => {
      workspaceTree = new UnitTestTree(Tree.empty());
      workspaceTree.create('package.json', JSON.stringify({}));
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
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const projectPackageJSON = JSON.parse(
          tree.readContent('/package.json'),
        );
        const devDeps = projectPackageJSON.devDependencies;
        const deps = projectPackageJSON.dependencies || {};
        const scripts = projectPackageJSON.scripts;

        expect(scripts['lint']).toEqual('ng lint');

        expect(devDeps['eslint']).toEqual(`^${eslintVersion}`);

        // It should add the main angular-eslint package
        expect(devDeps['angular-eslint']).toEqual(packageJSON.version);

        // It should not explicitly add the @angular-eslint/ dependency packages
        expect(devDeps['@angular-eslint/builder']).toBeUndefined();
        expect(devDeps['@angular-eslint/eslint-plugin']).toBeUndefined();
        expect(
          devDeps['@angular-eslint/eslint-plugin-template'],
        ).toBeUndefined();
        expect(devDeps['@angular-eslint/template-parser']).toBeUndefined();
        /**
         * Check that ng-add implementation successfully removes @angular-eslint/schematics
         * from dependencies as well as devDependencies
         */
        expect(devDeps['@angular-eslint/schematics']).toBeUndefined();
        expect(deps['@angular-eslint/schematics']).toBeUndefined();

        // It should add the typescript-eslint package
        expect(devDeps['typescript-eslint']).toEqual(typescriptESLintVersion);

        // It should not explicitly add the @typescript-eslint/ dependency packages
        expect(devDeps['@typescript-eslint/eslint-plugin']).toBeUndefined();
        expect(devDeps['@typescript-eslint/parser']).toBeUndefined();
        expect(devDeps['@typescript-eslint/utils']).toBeUndefined();
      });

      it('should remove the old defaultCollection property in angular.json', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const angularJson = JSON.parse(tree.readContent('/angular.json'));
        expect(angularJson.cli.defaultCollection).not.toBeDefined();
      });

      it('should set the schematicCollections in angular.json', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const angularJson = JSON.parse(tree.readContent('/angular.json'));
        expect(angularJson.cli.schematicCollections).toMatchInlineSnapshot(`
          Array [
            "@angular-eslint/schematics",
          ]
        `);
      });

      it('should create the root eslint.config.js file', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const eslintConfig = tree.readContent('/eslint.config.js');
        expect(eslintConfig).toMatchInlineSnapshot(`
        "// @ts-check
        const eslint = require(\\"@eslint/js\\");
        const tseslint = require(\\"typescript-eslint\\");
        const angular = require(\\"angular-eslint\\");

        module.exports = tseslint.config(
          {
            files: [\\"**/*.ts\\"],
            extends: [
              eslint.configs.recommended,
              ...tseslint.configs.recommended,
              ...tseslint.configs.stylistic,
              ...angular.configs.tsRecommended,
            ],
            processor: angular.processInlineTemplates,
            rules: {
              \\"@angular-eslint/directive-selector\\": [
                \\"error\\",
                {
                  type: \\"attribute\\",
                  prefix: \\"app\\",
                  style: \\"camelCase\\",
                },
              ],
              \\"@angular-eslint/component-selector\\": [
                \\"error\\",
                {
                  type: \\"element\\",
                  prefix: \\"app\\",
                  style: \\"kebab-case\\",
                },
              ],
            },
          },
          {
            files: [\\"**/*.html\\"],
            extends: [
              ...angular.configs.templateRecommended,
              ...angular.configs.templateAccessibility,
            ],
            rules: {},
          }
        );
        "
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
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const projectPackageJSON = JSON.parse(
          tree.readContent('/package.json'),
        );
        const devDeps = projectPackageJSON.devDependencies;
        const deps = projectPackageJSON.dependencies || {};
        const scripts = projectPackageJSON.scripts;

        expect(scripts['lint']).toEqual('ng lint');

        expect(devDeps['eslint']).toEqual(`^${eslintVersion}`);

        // It should add the main angular-eslint package
        expect(devDeps['angular-eslint']).toEqual(packageJSON.version);

        // It should not explicitly add the @angular-eslint/ dependency packages
        expect(devDeps['@angular-eslint/builder']).toBeUndefined();
        expect(devDeps['@angular-eslint/eslint-plugin']).toBeUndefined();
        expect(
          devDeps['@angular-eslint/eslint-plugin-template'],
        ).toBeUndefined();
        expect(devDeps['@angular-eslint/template-parser']).toBeUndefined();
        /**
         * Check that ng-add implementation successfully removes @angular-eslint/schematics
         * from dependencies as well as devDependencies
         */
        expect(devDeps['@angular-eslint/schematics']).toBeUndefined();
        expect(deps['@angular-eslint/schematics']).toBeUndefined();

        // It should add the typescript-eslint package
        expect(devDeps['typescript-eslint']).toEqual(typescriptESLintVersion);

        // It should not explicitly add the @typescript-eslint/ dependency packages
        expect(devDeps['@typescript-eslint/eslint-plugin']).toBeUndefined();
        expect(devDeps['@typescript-eslint/parser']).toBeUndefined();
        expect(devDeps['@typescript-eslint/utils']).toBeUndefined();
      });

      it('should remove the old defaultCollection property in angular.json', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const angularJson = JSON.parse(tree.readContent('/angular.json'));
        expect(angularJson.cli.defaultCollection).not.toBeDefined();
      });

      it('should set the schematicCollections in angular.json', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const angularJson = JSON.parse(tree.readContent('/angular.json'));
        expect(angularJson.cli.schematicCollections).toMatchInlineSnapshot(`
          Array [
            "@angular-eslint/schematics",
          ]
        `);
      });

      it('should create the root eslint.config.js file', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const eslintConfig = tree.readContent('/eslint.config.js');
        expect(eslintConfig).toMatchInlineSnapshot(`
          "// @ts-check
          const eslint = require(\\"@eslint/js\\");
          const tseslint = require(\\"typescript-eslint\\");
          const angular = require(\\"angular-eslint\\");

          module.exports = tseslint.config(
            {
              files: [\\"**/*.ts\\"],
              extends: [
                eslint.configs.recommended,
                ...tseslint.configs.recommended,
                ...tseslint.configs.stylistic,
                ...angular.configs.tsRecommended,
              ],
              processor: angular.processInlineTemplates,
              rules: {},
            },
            {
              files: [\\"**/*.html\\"],
              extends: [
                ...angular.configs.templateRecommended,
                ...angular.configs.templateAccessibility,
              ],
              rules: {},
            }
          );
          "
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
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const projectPackageJSON = JSON.parse(
          tree.readContent('/package.json'),
        );
        const devDeps = projectPackageJSON.devDependencies;
        const deps = projectPackageJSON.dependencies || {};
        const scripts = projectPackageJSON.scripts;

        expect(scripts['lint']).toEqual('ng lint');

        expect(devDeps['eslint']).toEqual(`^${eslintVersion}`);

        // It should add the main angular-eslint package
        expect(devDeps['angular-eslint']).toEqual(packageJSON.version);

        // It should not explicitly add the @angular-eslint/ dependency packages
        expect(devDeps['@angular-eslint/builder']).toBeUndefined();
        expect(devDeps['@angular-eslint/eslint-plugin']).toBeUndefined();
        expect(
          devDeps['@angular-eslint/eslint-plugin-template'],
        ).toBeUndefined();
        expect(devDeps['@angular-eslint/template-parser']).toBeUndefined();
        /**
         * Check that ng-add implementation successfully removes @angular-eslint/schematics
         * from dependencies as well as devDependencies
         */
        expect(devDeps['@angular-eslint/schematics']).toBeUndefined();
        expect(deps['@angular-eslint/schematics']).toBeUndefined();

        // It should add the typescript-eslint package
        expect(devDeps['typescript-eslint']).toEqual(typescriptESLintVersion);

        // It should not explicitly add the @typescript-eslint/ dependency packages
        expect(devDeps['@typescript-eslint/eslint-plugin']).toBeUndefined();
        expect(devDeps['@typescript-eslint/parser']).toBeUndefined();
        expect(devDeps['@typescript-eslint/utils']).toBeUndefined();
      });

      it('should remove the old defaultCollection property in angular.json', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const angularJson = JSON.parse(tree.readContent('/angular.json'));
        expect(angularJson.cli.defaultCollection).not.toBeDefined();
      });

      it('should set the schematicCollections in angular.json', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const angularJson = JSON.parse(tree.readContent('/angular.json'));
        expect(angularJson.cli.schematicCollections).toMatchInlineSnapshot(`
          Array [
            "@angular-eslint/schematics",
          ]
        `);
      });

      it('should create the root eslint.config.js file', async () => {
        const tree = await schematicRunner.runSchematic(
          'ng-add',
          {},
          workspaceTree,
        );
        const eslintConfig = tree.readContent('/eslint.config.js');
        expect(eslintConfig).toMatchInlineSnapshot(`
          "// @ts-check
          const eslint = require(\\"@eslint/js\\");
          const tseslint = require(\\"typescript-eslint\\");
          const angular = require(\\"angular-eslint\\");

          module.exports = tseslint.config(
            {
              files: [\\"**/*.ts\\"],
              extends: [
                eslint.configs.recommended,
                ...tseslint.configs.recommended,
                ...tseslint.configs.stylistic,
                ...angular.configs.tsRecommended,
              ],
              processor: angular.processInlineTemplates,
              rules: {
                \\"@angular-eslint/directive-selector\\": [
                  \\"error\\",
                  {
                    type: \\"attribute\\",
                    prefix: \\"app\\",
                    style: \\"camelCase\\",
                  },
                ],
                \\"@angular-eslint/component-selector\\": [
                  \\"error\\",
                  {
                    type: \\"element\\",
                    prefix: \\"app\\",
                    style: \\"kebab-case\\",
                  },
                ],
              },
            },
            {
              files: [\\"**/*.html\\"],
              extends: [
                ...angular.configs.templateRecommended,
                ...angular.configs.templateAccessibility,
              ],
              rules: {},
            }
          );
          "
          `);
      });
    });
  });
});
