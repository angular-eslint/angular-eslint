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

describe('library', () => {
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

  it('should change the lint target to use the @angular-eslint builder', async () => {
    const tree = await schematicRunner.runSchematic(
      'library',
      { name: 'bar' },
      appTree,
    );

    expect(readJsonInTree(tree, 'angular.json').projects.bar.architect.lint)
      .toMatchInlineSnapshot(`
      Object {
        "builder": "@angular-eslint/builder:lint",
        "options": Object {
          "lintFilePatterns": Array [
            "projects/bar/**/*.ts",
            "projects/bar/**/*.html",
          ],
        },
      }
    `);
  });

  it('should add the ESLint config for the project', async () => {
    const tree = await schematicRunner.runSchematic(
      'library',
      {
        name: 'bar',
        prefix: 'something-else-custom',
      },
      appTree,
    );

    expect(tree.exists('projects/bar/tslint.json')).toBe(false);
    expect(tree.read('projects/bar/.eslintrc.json')?.toString())
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
            \\"rules\\": {
              \\"@angular-eslint/directive-selector\\": [
                \\"error\\",
                {
                  \\"type\\": \\"attribute\\",
                  \\"prefix\\": \\"something-else-custom\\",
                  \\"style\\": \\"camelCase\\"
                }
              ],
              \\"@angular-eslint/component-selector\\": [
                \\"error\\",
                {
                  \\"type\\": \\"element\\",
                  \\"prefix\\": \\"something-else-custom\\",
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

  it('should add the ESLint config for the project (--setParserOptionsProject=true)', async () => {
    const tree = await schematicRunner.runSchematic(
      'library',
      {
        name: 'bar',
        prefix: 'something-else-custom',
        setParserOptionsProject: true,
      },
      appTree,
    );

    expect(tree.exists('projects/bar/tslint.json')).toBe(false);
    expect(tree.read('projects/bar/.eslintrc.json')?.toString())
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
                \\"projects/bar/tsconfig.(lib|spec).json\\"
              ]
            },
            \\"rules\\": {
              \\"@angular-eslint/directive-selector\\": [
                \\"error\\",
                {
                  \\"type\\": \\"attribute\\",
                  \\"prefix\\": \\"something-else-custom\\",
                  \\"style\\": \\"camelCase\\"
                }
              ],
              \\"@angular-eslint/component-selector\\": [
                \\"error\\",
                {
                  \\"type\\": \\"element\\",
                  \\"prefix\\": \\"something-else-custom\\",
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

  it('should add an appropriate ESLint config extends for a project with a scope in its name', async () => {
    const tree = await schematicRunner.runSchematic(
      'library',
      {
        name: '@foo/bar',
      },
      appTree,
    );

    expect(tree.exists('projects/foo/bar/tslint.json')).toBe(false);
    expect(tree.read('projects/foo/bar/.eslintrc.json')?.toString())
      .toMatchInlineSnapshot(`
      "{
        \\"extends\\": \\"../../../.eslintrc.json\\",
        \\"ignorePatterns\\": [
          \\"!**/*\\"
        ],
        \\"overrides\\": [
          {
            \\"files\\": [
              \\"*.ts\\"
            ],
            \\"rules\\": {
              \\"@angular-eslint/directive-selector\\": [
                \\"error\\",
                {
                  \\"type\\": \\"attribute\\",
                  \\"prefix\\": \\"lib\\",
                  \\"style\\": \\"camelCase\\"
                }
              ],
              \\"@angular-eslint/component-selector\\": [
                \\"error\\",
                {
                  \\"type\\": \\"element\\",
                  \\"prefix\\": \\"lib\\",
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
