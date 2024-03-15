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

describe('update-17-3-0', () => {
  let appTree: UnitTestTree;
  beforeEach(() => {
    appTree = new UnitTestTree(Tree.empty());
    appTree.create(
      'package.json',
      JSON.stringify({
        devDependencies: {
          '@typescript-eslint/eslint-plugin': '^5.43.0',
          '@typescript-eslint/utils': '5.3.0',
          '@typescript-eslint/parser': '^5.43.0',
          eslint: '^8.28.0',
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
  });

  it('should update relevant @typescript-eslint and eslint dependencies', async () => {
    const tree = await migrationSchematicRunner.runSchematic(
      'update-17-3-0',
      {},
      appTree,
    );
    const packageJSON = JSON.parse(tree.readContent('/package.json'));
    expect(packageJSON).toMatchInlineSnapshot(`
      Object {
        "devDependencies": Object {
          "@typescript-eslint/eslint-plugin": "^7.2.0",
          "@typescript-eslint/parser": "^7.2.0",
          "@typescript-eslint/utils": "^7.2.0",
          "eslint": "^8.57.0",
        },
      }
    `);
  });
});
