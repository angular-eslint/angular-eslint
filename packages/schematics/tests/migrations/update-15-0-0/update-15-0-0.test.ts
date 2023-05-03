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

describe('update-15-0-0', () => {
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
  it('should update relevant @typescript-eslint and eslint dependencies', async () => {
    const tree = await migrationSchematicRunner.runSchematic(
      'update-15-0-0',
      {},
      appTree,
    );
    const packageJSON = JSON.parse(tree.readContent('/package.json'));
    expect(packageJSON).toMatchInlineSnapshot(`
      Object {
        "devDependencies": Object {
          "@typescript-eslint/eslint-plugin": "^5.43.0",
          "@typescript-eslint/experimental-utils": "5.3.0",
          "@typescript-eslint/parser": "^5.43.0",
          "eslint": "^8.28.0",
        },
      }
    `);
  });

  it(`should update the default value of setParserOptionProject for the app and lib schematics in order to preserve the same behaviour as v14 for exsiting workspaces`, async () => {
    const treeWithValueToMigrate = new UnitTestTree(Tree.empty());
    treeWithValueToMigrate.create('angular.json', JSON.stringify({}));

    const migratedTree = await migrationSchematicRunner.runSchematic(
      'update-15-0-0',
      {},
      treeWithValueToMigrate,
    );
    expect(JSON.parse(migratedTree.readContent('/angular.json')))
      .toMatchInlineSnapshot(`
      Object {
        "schematics": Object {
          "@angular-eslint/schematics:application": Object {
            "setParserOptionsProject": true,
          },
          "@angular-eslint/schematics:library": Object {
            "setParserOptionsProject": true,
          },
        },
      }
    `);
  });
});
