import * as angularDevkitSchematics from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { readJsonInTree } from '../../src/utils';

const { Tree } = angularDevkitSchematics;

jest.mock(
  '@angular-devkit/schematics',
  () =>
    ({
      __esModule: true,
      ...jest.requireActual('@angular-devkit/schematics'),
      // For some reason TS (BUT only via ts-jest, not in VSCode) has an issue with this spread usage of requireActual(), so suppressing with any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
);

const schematicRunner = new SchematicTestRunner(
  '@angular-eslint/schematics',
  path.join(__dirname, '../../src/collection.json'),
);

describe('application', () => {
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
        projects: {},
      }),
    );
  });

  it('should pass all the given options directly to the @schematics/angular schematic', async () => {
    const spy = jest.spyOn(angularDevkitSchematics, 'externalSchematic');
    const options = {
      name: 'foo',
    };

    expect(spy).not.toHaveBeenCalled();

    await schematicRunner
      .runSchematicAsync('application', options, appTree)
      .toPromise();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      '@schematics/angular',
      'application',
      expect.objectContaining(options),
    );
  });

  it('should change the lint target to use the @angular-eslint builder', async () => {
    const tree = await schematicRunner
      .runSchematicAsync('application', { name: 'foo' }, appTree)
      .toPromise();

    expect(readJsonInTree(tree, 'angular.json').projects.foo.architect.lint)
      .toMatchInlineSnapshot(`
      Object {
        "builder": "@angular-eslint/builder:lint",
        "options": Object {
          "lintFilePatterns": Array [
            "projects/foo/**/*.ts",
            "projects/foo/**/*.html",
          ],
        },
      }
    `);
  });

  it('should add the ESLint config for the project and delete the TSLint config', async () => {
    const tree = await schematicRunner
      .runSchematicAsync(
        'application',
        { name: 'foo', prefix: 'something-custom' },
        appTree,
      )
      .toPromise();

    expect(tree.exists('projects/foo/tslint.json')).toBe(false);
    expect(tree.read('projects/foo/.eslintrc.json')?.toString())
      .toMatchInlineSnapshot(`
      "{
        \\"extends\\": \\"../../.eslintrc.json\\",
        \\"ignorePatterns\\": [
          \\"!**/*\\"
        ],
        \\"overrides\\": [
          {
            \\"files\\": [
              \\"*.ts\\"
            ],
            \\"parserOptions\\": {
              \\"project\\": [
                \\"projects/foo/tsconfig.app.json\\",
                \\"projects/foo/tsconfig.spec.json\\"
              ],
              \\"createDefaultProgram\\": true
            },
            \\"rules\\": {
              \\"@angular-eslint/directive-selector\\": [
                \\"error\\",
                {
                  \\"type\\": \\"attribute\\",
                  \\"prefix\\": \\"something-custom\\",
                  \\"style\\": \\"camelCase\\"
                }
              ],
              \\"@angular-eslint/component-selector\\": [
                \\"error\\",
                {
                  \\"type\\": \\"element\\",
                  \\"prefix\\": \\"something-custom\\",
                  \\"style\\": \\"kebab-case\\"
                }
              ]
            }
          },
          {
            \\"files\\": [
              \\"*.html\\"
            ],
            \\"rules\\": {}
          }
        ]
      }
      "
    `);
  });
});
