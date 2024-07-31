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

describe('update-18-2-0', () => {
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

  it('should not update typescript-eslint and eslint dependencies if the project is not already on v8 prereleases of typescript-eslint', async () => {
    appTree.overwrite(
      'package.json',
      JSON.stringify({
        devDependencies: {
          '@typescript-eslint/eslint-plugin': '^7',
          '@typescript-eslint/utils': '^7',
          '@typescript-eslint/parser': '^7',
          eslint: '^8.28.0',
        },
      }),
    );

    const tree = await migrationSchematicRunner.runSchematic(
      'update-18-2-0',
      {},
      appTree,
    );
    const packageJSON = JSON.parse(tree.readContent('/package.json'));
    expect(packageJSON).toMatchSnapshot();
  });

  it('should update typescript-eslint and eslint dependencies if the project is already on v8 prereleases of typescript-eslint', async () => {
    appTree.overwrite(
      'package.json',
      JSON.stringify({
        devDependencies: {
          '@typescript-eslint/eslint-plugin': '8.0.0-alpha.50',
          'typescript-eslint': '8.0.0-alpha.50',
          '@typescript-eslint/utils': '8.0.0-alpha.50',
          '@typescript-eslint/parser': '8.0.0-alpha.50',
          '@typescript-eslint/type-utils': '8.0.0-alpha.50',
          '@typescript-eslint/rule-tester': '8.0.0-alpha.50',
          eslint: '^9.1.0',
        },
      }),
    );

    const tree = await migrationSchematicRunner.runSchematic(
      'update-18-2-0',
      {},
      appTree,
    );
    const packageJSON = JSON.parse(tree.readContent('/package.json'));
    expect(packageJSON).toMatchSnapshot();
  });
});
