import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Tree } from '@angular-devkit/schematics';

describe('update-2-0-0', () => {
  const migrationSchematicRunner = new SchematicTestRunner(
    '@angular-eslint/schematics',
    path.join(__dirname, '../../../migrations.json'),
  );

  const appTree = new UnitTestTree(Tree.empty());
  appTree.create(
    'package.json',
    JSON.stringify({
      devDependencies: {
        '@angular-eslint/builder': '1.2.0',
        '@angular-eslint/eslint-plugin': '1.2.0',
        '@angular-eslint/eslint-plugin-template': '1.2.0',
        '@angular-eslint/template-parser': '1.2.0',
        '@typescript-eslint/parser': '4.3.0',
        '@typescript-eslint/eslint-plugin': '4.3.0',
      },
    }),
  );

  it('should update relevant @angular-eslint and @typescript-eslint packages', async () => {
    const tree = await migrationSchematicRunner
      .runSchematicAsync('update-2-0-0', {}, appTree)
      .toPromise();
    const packageJSON = JSON.parse(tree.readContent('/package.json'));
    expect(packageJSON).toMatchInlineSnapshot(`
      Object {
        "devDependencies": Object {
          "@angular-eslint/builder": "^2.0.0",
          "@angular-eslint/eslint-plugin": "^2.0.0",
          "@angular-eslint/eslint-plugin-template": "^2.0.0",
          "@angular-eslint/template-parser": "^2.0.0",
          "@typescript-eslint/eslint-plugin": "4.16.1",
          "@typescript-eslint/parser": "4.16.1",
        },
      }
    `);
  });
});
