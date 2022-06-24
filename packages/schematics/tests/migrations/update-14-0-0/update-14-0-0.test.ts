import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';

const migrationSchematicRunner = new SchematicTestRunner(
  '@angular-eslint/schematics',
  path.join(__dirname, '../../../src/migrations.json'),
);

describe('update-14-0-0', () => {
  let appTree: UnitTestTree;
  beforeEach(() => {
    appTree = new UnitTestTree(Tree.empty());
    appTree.create(
      'package.json',
      JSON.stringify({
        devDependencies: {
          '@typescript-eslint/eslint-plugin': '5.3.0',
          '@typescript-eslint/experimental-utils': '5.3.0',
          '@typescript-eslint/parser': '5.3.0',
          eslint: '^8.2.0',
        },
      }),
    );
  });

  /**
   * NOTE: @angular-eslint packages will be handled automatically by ng update packageGroup
   * configured in the package.json
   */
  it('should update relevant @typescript-eslint and eslint dependencies, including migrating from @typescript-eslint/experimental-utils to @typescript-eslint/utils', async () => {
    const tree = await migrationSchematicRunner
      .runSchematicAsync('update-14-0-0', {}, appTree)
      .toPromise();
    const packageJSON = JSON.parse(tree.readContent('/package.json'));
    expect(packageJSON).toMatchInlineSnapshot(`
      Object {
        "devDependencies": Object {
          "@typescript-eslint/eslint-plugin": "^5.29.0",
          "@typescript-eslint/parser": "^5.29.0",
          "@typescript-eslint/utils": "^5.29.0",
          "eslint": "^8.18.0",
        },
      }
    `);
  });

  it(`should update the usage of defaultCollection to schematicCollections if it is present in the user's angular.json and set to @angular-eslint/schematics`, async () => {
    const treeWithValueToMigrate = new UnitTestTree(Tree.empty());
    treeWithValueToMigrate.create(
      'angular.json',
      JSON.stringify({
        cli: {
          defaultCollection: '@angular-eslint/schematics',
        },
      }),
    );

    const treeWithValueToIgnore = new UnitTestTree(Tree.empty());
    treeWithValueToIgnore.create(
      'angular.json',
      JSON.stringify({
        cli: {
          defaultCollection: '@schematics/angular',
        },
      }),
    );

    const migratedTree = await migrationSchematicRunner
      .runSchematicAsync('update-14-0-0', {}, treeWithValueToMigrate)
      .toPromise();
    expect(JSON.parse(migratedTree.readContent('/angular.json')))
      .toMatchInlineSnapshot(`
      Object {
        "cli": Object {
          "schematicCollections": Array [
            "@angular-eslint/schematics",
          ],
        },
      }
    `);

    const ignoredTree = await migrationSchematicRunner
      .runSchematicAsync('update-14-0-0', {}, treeWithValueToIgnore)
      .toPromise();
    expect(JSON.parse(ignoredTree.readContent('/angular.json')))
      .toMatchInlineSnapshot(`
      Object {
        "cli": Object {
          "defaultCollection": "@schematics/angular",
        },
      }
    `);
  });
});
