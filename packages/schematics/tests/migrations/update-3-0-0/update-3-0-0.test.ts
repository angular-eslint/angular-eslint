import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Tree } from '@angular-devkit/schematics';

const migrationSchematicRunner = new SchematicTestRunner(
  '@angular-eslint/schematics',
  path.join(__dirname, '../../../src/migrations.json'),
);

describe('update-3-0-0', () => {
  let appTree: UnitTestTree;
  beforeEach(() => {
    appTree = new UnitTestTree(Tree.empty());
    appTree.create(
      'package.json',
      JSON.stringify({
        devDependencies: {
          '@angular-eslint/builder': '2.0.2',
          '@angular-eslint/eslint-plugin': '2.0.2',
          '@angular-eslint/eslint-plugin-template': '2.0.2',
          '@angular-eslint/template-parser': '2.0.2',
        },
      }),
    );
    appTree.create(
      'angular.json',
      JSON.stringify({
        $schema: './node_modules/@angular/cli/lib/config/schema.json',
        version: 1,
        newProjectRoot: 'projects',
        projects: {
          foo: {
            root: 'projects/foo',
          },
          bar: {
            root: 'projects/bar',
          },
        },
      }),
    );

    // Root config
    appTree.create(
      '.eslintrc.json',
      JSON.stringify({
        // Overrides extends
        overrides: [
          // String form of extends
          { files: ['*.ts'], extends: 'plugin:@angular-eslint/recommended' },
        ],
      }),
    );

    // Project configs
    appTree.create(
      'projects/foo/.eslintrc.json',
      // Root extends
      JSON.stringify({ extends: ['plugin:@angular-eslint/recommended'] }),
    );
    appTree.create(
      'projects/bar/.eslintrc.json',
      JSON.stringify({
        // Overrides extends
        overrides: [
          // Array form of extends
          {
            files: ['*.ts'],
            extends: [
              'plugin:@angular-eslint/something-other-than-recommended',
            ],
          },
        ],
      }),
    );
  });

  it('should update relevant @angular-eslint dependencies', async () => {
    const tree = await migrationSchematicRunner
      .runSchematicAsync('update-3-0-0', {}, appTree)
      .toPromise();
    const packageJSON = JSON.parse(tree.readContent('/package.json'));
    expect(packageJSON).toMatchInlineSnapshot(`
      Object {
        "devDependencies": Object {
          "@angular-eslint/builder": "^3.0.0",
          "@angular-eslint/eslint-plugin": "^3.0.0",
          "@angular-eslint/eslint-plugin-template": "^3.0.0",
          "@angular-eslint/template-parser": "^3.0.0",
        },
      }
    `);
  });

  it('should apply an extends for the new recommended--extra config wherever recommended is currently being extended', async () => {
    const tree = await migrationSchematicRunner
      .runSchematicAsync('update-3-0-0', {}, appTree)
      .toPromise();

    const rootESLint = JSON.parse(tree.readContent('.eslintrc.json'));
    expect(rootESLint).toMatchInlineSnapshot(`
      Object {
        "overrides": Array [
          Object {
            "extends": Array [
              "plugin:@angular-eslint/recommended",
              "plugin:@angular-eslint/recommended--extra",
            ],
            "files": Array [
              "*.ts",
            ],
          },
        ],
      }
    `);

    const fooESLint = JSON.parse(
      tree.readContent('projects/foo/.eslintrc.json'),
    );
    expect(fooESLint).toMatchInlineSnapshot(`
      Object {
        "extends": Array [
          "plugin:@angular-eslint/recommended",
          "plugin:@angular-eslint/recommended--extra",
        ],
      }
    `);

    const barESLint = JSON.parse(
      tree.readContent('projects/bar/.eslintrc.json'),
    );
    expect(barESLint).toMatchInlineSnapshot(`
      Object {
        "overrides": Array [
          Object {
            "extends": Array [
              "plugin:@angular-eslint/something-other-than-recommended",
            ],
            "files": Array [
              "*.ts",
            ],
          },
        ],
      }
    `);
  });
});
