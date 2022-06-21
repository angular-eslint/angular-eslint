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

describe('update-13-0-0', () => {
  let appTree: UnitTestTree;
  beforeEach(() => {
    appTree = new UnitTestTree(Tree.empty());
  });

  /**
   * NOTE: @angular-eslint packages will be handled automatically by ng update packageGroup
   * configured in the package.json
   */
  it('should update relevant @typescript-eslint and eslint dependencies', async () => {
    appTree.create(
      'package.json',
      JSON.stringify({
        devDependencies: {
          '@typescript-eslint/eslint-plugin': '4.16.1',
          '@typescript-eslint/experimental-utils': '4.16.1',
          '@typescript-eslint/parser': '4.16.1',
          eslint: '^7.6.0',
        },
      }),
    );

    const tree = await migrationSchematicRunner
      .runSchematicAsync('update-13-0-0', {}, appTree)
      .toPromise();
    const packageJSON = JSON.parse(tree.readContent('/package.json'));
    expect(packageJSON).toMatchInlineSnapshot(`
      Object {
        "devDependencies": Object {
          "@typescript-eslint/eslint-plugin": "5.3.0",
          "@typescript-eslint/experimental-utils": "5.3.0",
          "@typescript-eslint/parser": "5.3.0",
          "eslint": "^8.2.0",
        },
      }
    `);
  });

  it(`should update eslint-plugin-import to 2.25.2 if it is present in the user's package.json`, async () => {
    appTree.create(
      'package.json',
      JSON.stringify({
        devDependencies: {
          '@typescript-eslint/eslint-plugin': '4.16.1',
          '@typescript-eslint/experimental-utils': '4.16.1',
          '@typescript-eslint/parser': '4.16.1',
          eslint: '^7.6.0',
          'eslint-plugin-import': '2.22.1',
        },
      }),
    );

    const tree = await migrationSchematicRunner
      .runSchematicAsync('update-13-0-0', {}, appTree)
      .toPromise();
    const packageJSON = JSON.parse(tree.readContent('/package.json'));
    expect(packageJSON).toMatchInlineSnapshot(`
      Object {
        "devDependencies": Object {
          "@typescript-eslint/eslint-plugin": "5.3.0",
          "@typescript-eslint/experimental-utils": "5.3.0",
          "@typescript-eslint/parser": "5.3.0",
          "eslint": "^8.2.0",
          "eslint-plugin-import": "2.25.2",
        },
      }
    `);
  });
});
