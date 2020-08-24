import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';

import { Schema } from '../../src/add-config-to-project/schema';

const schematicRunner = new SchematicTestRunner(
  '@angular-eslint/schematics',
  path.join(__dirname, '../../src/collection.json'),
);

let workspaceTree: UnitTestTree;

const testProjectName = 'foo';
const testDefaultStyleProjectName = 'default-style-application';

schematicRunner.registerCollection(
  '@schematics/angular',
  path.join(
    __dirname,
    '../../../../node_modules/@schematics/angular/collection.json',
  ),
);

function setupAngularWorkspace(workspaceTree: UnitTestTree): void {
  workspaceTree.create('tsconfig.base.json', JSON.stringify({}));
  workspaceTree.create('package.json', JSON.stringify({}));
  workspaceTree.create(
    'angular.json',
    JSON.stringify({
      $schema: './node_modules/@angular/cli/lib/config/schema.json',
      version: 1,
      newProjectRoot: 'projects',
      projects: {
        [testDefaultStyleProjectName]: {
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
    }),
  );
}

describe('add-config-to-project', () => {
  beforeEach(async () => {
    workspaceTree = new UnitTestTree(Tree.empty());
    setupAngularWorkspace(workspaceTree);

    await schematicRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        {
          name: testProjectName,
          skipInstall: true,
          skipPackageJson: true,
        },
        workspaceTree,
      )
      .toPromise();
  });

  describe('default Angular CLI project (i.e. uses a src/ directory at the root of the workspace)', () => {
    it('should create an `.eslintrc.js` file in the root of the given project', async () => {
      await schematicRunner
        .runSchematicAsync<Schema>(
          'add-config-to-project',
          {
            project: testDefaultStyleProjectName,
          },
          workspaceTree,
        )
        .toPromise();

      expect(workspaceTree.exists('.eslintrc.js')).toBe(true);

      expect(workspaceTree.get('.eslintrc.js')!.content.toString())
        .toMatchInlineSnapshot(`
        "/**
         * We are using the .JS version of an ESLint config file here so that we can
         * add lots of comments to better explain and document the setup.
         *
         * JSON-based configuration files are often easier to write tooling for
         * because they can be statically analyzed more easily, so may wish to
         * consider converting this once you have read through the comments.
         */
        module.exports = {
          /**
           * See packages/eslint-plugin/src/configs/README.md
           * for what this recommended config contains.
           */
          extends: ['plugin:@angular-eslint/recommended'],

          /**
           * We use a dedicated tsconfig file for the compilation related to linting so that we
           * have complete control over what gets included and we can maximize performance
           */
          parserOptions: {
            project: './tsconfig.eslint.json',
          },

          rules: {
            // ORIGINAL tslint.json -> \\"directive-selector\\": [true, \\"attribute\\", \\"app\\", \\"camelCase\\"],
            '@angular-eslint/directive-selector': [
              'error',
              { type: 'attribute', prefix: 'app', style: 'camelCase' },
            ],

            // ORIGINAL tslint.json -> \\"component-selector\\": [true, \\"element\\", \\"app\\", \\"kebab-case\\"],
            '@angular-eslint/component-selector': [
              'error',
              { type: 'element', prefix: 'app', style: 'kebab-case' },
            ],

            quotes: ['error', 'single', { allowTemplateLiterals: true }],
          },
          overrides: [
            /**
             * This extra piece of configuration is only necessary if you make use of inline
             * templates within Component metadata, e.g.:
             *
             * @Component({
             *  template: \`<h1>Hello, World!</h1>\`
             * })
             * ...
             *
             * It is not necessary if you only use .html files for templates and you
             * can remove the entire \`overrides: []\` config.
             */
            {
              files: ['*.component.ts'],
              parser: '@typescript-eslint/parser',
              parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
              },
              plugins: ['@angular-eslint/template'],
              processor: '@angular-eslint/template/extract-inline-html',
            },
          ],
        };
        "
      `);
    });

    it('should create a `tsconfig.eslint.json` file at the root of the workspace', async () => {
      await schematicRunner
        .runSchematicAsync<Schema>(
          'add-config-to-project',
          {
            project: testDefaultStyleProjectName,
          },
          workspaceTree,
        )
        .toPromise();

      expect(workspaceTree.exists('tsconfig.eslint.json')).toBe(true);

      expect(workspaceTree.get('tsconfig.eslint.json')!.content.toString())
        .toMatchInlineSnapshot(`
        "{
          \\"extends\\": \\"./tsconfig.base.json\\",
          \\"compilerOptions\\": {
            \\"noEmit\\": true
          },
          \\"include\\": [\\"src\\", \\"e2e\\"]
        }
        "
      `);
    });

    it('should add a target called `eslint` to the angular.json config for the given project', async () => {
      await schematicRunner
        .runSchematicAsync<Schema>(
          'add-config-to-project',
          {
            project: testDefaultStyleProjectName,
          },
          workspaceTree,
        )
        .toPromise();

      const angularJSON = JSON.parse(
        workspaceTree.get('angular.json')!.content.toString(),
      );

      expect(
        angularJSON.projects[testDefaultStyleProjectName].architect.eslint,
      ).toBeTruthy();

      expect(angularJSON.projects[testDefaultStyleProjectName].architect.eslint)
        .toMatchInlineSnapshot(`
        Object {
          "builder": "@angular-eslint/builder:lint",
          "options": Object {
            "exclude": Array [
              "**/node_modules/**",
            ],
            "lintFilePatterns": Array [
              "src/**/*.ts",
              "src/**/*.component.html",
            ],
          },
        }
      `);
    });
  });

  describe('additional project (e.g. within projects/ directory)', () => {
    it('should throw if there is no existing ESLint configuration at the root of the workspace', async () => {
      await expect(
        schematicRunner
          .runSchematicAsync<Schema>(
            'add-config-to-project',
            {
              project: testProjectName,
            },
            workspaceTree,
          )
          .toPromise(),
      ).rejects.toThrow(
        'Could not find a `.eslintrc.json` or `.eslintrc.js` file at the root of your project. Please create one before running this schematic on an individual project',
      );
    });

    describe('root config is `.eslintrc.json`', () => {
      it('should create an `.eslintrc.json` file in the root of the given project', async () => {
        // Supports using `.eslintrc.json` at the root of the workspace
        workspaceTree.create('.eslintrc.json', JSON.stringify({}));

        await schematicRunner
          .runSchematicAsync<Schema>(
            'add-config-to-project',
            {
              project: testProjectName,
            },
            workspaceTree,
          )
          .toPromise();

        expect(workspaceTree.exists('projects/foo/.eslintrc.json')).toBe(true);

        expect(
          workspaceTree.get('projects/foo/.eslintrc.json')!.content.toString(),
        ).toMatchInlineSnapshot(`
          "{
            \\"extends\\": [\\"../../.eslintrc.json\\"],
            \\"parserOptions\\": {
              \\"project\\": \\"projects/foo/tsconfig.eslint.json\\"
            },
            \\"rules\\": {}
          }
          "
        `);
      });
    });

    describe('root config is `.eslintrc.js`', () => {
      it('should create an `.eslintrc.json` file in the root of the given project', async () => {
        // Supports using `.eslintrc.js` at the root of the workspace
        workspaceTree.create('.eslintrc.js', JSON.stringify({}));

        await schematicRunner
          .runSchematicAsync<Schema>(
            'add-config-to-project',
            {
              project: testProjectName,
            },
            workspaceTree,
          )
          .toPromise();

        expect(workspaceTree.exists('projects/foo/.eslintrc.json')).toBe(true);

        expect(
          workspaceTree.get('projects/foo/.eslintrc.json')!.content.toString(),
        ).toMatchInlineSnapshot(`
                  "{
                    \\"extends\\": [\\"../../.eslintrc.js\\"],
                    \\"parserOptions\\": {
                      \\"project\\": \\"projects/foo/tsconfig.eslint.json\\"
                    },
                    \\"rules\\": {}
                  }
                  "
              `);
      });
    });

    it('should create a `tsconfig.eslint.json` file in the root of the given project', async () => {
      workspaceTree.create('.eslintrc.json', JSON.stringify({}));

      await schematicRunner
        .runSchematicAsync<Schema>(
          'add-config-to-project',
          {
            project: testProjectName,
          },
          workspaceTree,
        )
        .toPromise();

      expect(workspaceTree.exists('projects/foo/tsconfig.eslint.json')).toBe(
        true,
      );

      expect(
        workspaceTree
          .get('projects/foo/tsconfig.eslint.json')!
          .content.toString(),
      ).toMatchInlineSnapshot(`
        "{
          \\"extends\\": \\"../../tsconfig.base.json\\",
          \\"compilerOptions\\": {
            \\"noEmit\\": true
          },
          \\"include\\": [\\"src\\", \\"e2e\\"]
        }
        "
      `);
    });

    it('should add a target called `eslint` to the angular.json config for the given project', async () => {
      workspaceTree.create('.eslintrc.json', JSON.stringify({}));

      await schematicRunner
        .runSchematicAsync<Schema>(
          'add-config-to-project',
          {
            project: testProjectName,
          },
          workspaceTree,
        )
        .toPromise();

      const angularJSON = JSON.parse(
        workspaceTree.get('angular.json')!.content.toString(),
      );

      expect(
        angularJSON.projects[testProjectName].architect.eslint,
      ).toBeTruthy();

      expect(angularJSON.projects[testProjectName].architect.eslint)
        .toMatchInlineSnapshot(`
        Object {
          "builder": "@angular-eslint/builder:lint",
          "options": Object {
            "exclude": Array [
              "**/node_modules/**",
            ],
            "lintFilePatterns": Array [
              "projects/foo/**/*.ts",
              "projects/foo/**/*.component.html",
            ],
          },
        }
      `);
    });
  });
});
