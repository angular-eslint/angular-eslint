import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('update-2-0-0', () => {
  const migrationSchematicRunner = new SchematicTestRunner(
    '@angular-eslint/schematics',
    path.join(__dirname, '../../../dist/migrations.json'),
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
      rules: { '@angular-eslint/use-pipe-decorator': 'error' },
    }),
  );

  // Project configs
  appTree.create(
    'projects/foo/.eslintrc.json',
    JSON.stringify({
      rules: { '@angular-eslint/use-pipe-decorator': 'error' },
    }),
  );
  appTree.create(
    'projects/bar/.eslintrc.json',
    JSON.stringify({
      overrides: [
        {
          files: ['*.ts'],
          rules: { '@angular-eslint/use-pipe-decorator': 'error' },
        },
      ],
    }),
  );

  it('should update relevant @angular-eslint and @typescript-eslint packages', async () => {
    const tree = await migrationSchematicRunner.runSchematic(
      'update-2-0-0',
      {},
      appTree,
    );
    const packageJSON = JSON.parse(tree.readContent('/package.json'));
    expect(packageJSON).toMatchInlineSnapshot(`
      {
        "devDependencies": {
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

  it('should remove any explicit usage of the @angular-eslint/use-pipe-decorator rule', async () => {
    const tree = await migrationSchematicRunner.runSchematic(
      'update-2-0-0',
      {},
      appTree,
    );

    const rootESLint = JSON.parse(tree.readContent('.eslintrc.json'));
    expect(rootESLint).toMatchInlineSnapshot(`
      {
        "rules": {},
      }
    `);

    const fooESLint = JSON.parse(
      tree.readContent('projects/foo/.eslintrc.json'),
    );
    expect(fooESLint).toMatchInlineSnapshot(`
      {
        "rules": {},
      }
    `);

    const barESLint = JSON.parse(
      tree.readContent('projects/bar/.eslintrc.json'),
    );
    expect(barESLint).toMatchInlineSnapshot(`
      {
        "overrides": [
          {
            "files": [
              "*.ts",
            ],
            "rules": {},
          },
        ],
      }
    `);
  });
});
