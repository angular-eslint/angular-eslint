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

describe('update-12-0-0', () => {
  let appTree: UnitTestTree;
  beforeEach(() => {
    appTree = new UnitTestTree(Tree.empty());
    appTree.create(
      'package.json',
      JSON.stringify({
        devDependencies: {
          '@angular-eslint/builder': '4.3.0',
          '@angular-eslint/eslint-plugin': '4.3.0',
          '@angular-eslint/eslint-plugin-template': '4.3.0',
          '@angular-eslint/template-parser': '4.3.0',
          '@typescript-eslint/eslint-plugin': '4.16.1',
          '@typescript-eslint/experimental-utils': '4.16.1',
          '@typescript-eslint/parser': '4.16.1',
          eslint: '^7.6.0',
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
        rules: {
          '@angular-eslint/template/accessibility-label-for': 'error',
          '@angular-eslint/template/accessibility-label-has-associated-control':
            'error',
        },
        // Overrides extends
        overrides: [
          // String form of extends
          {
            files: ['*.ts'],
            extends: 'plugin:@angular-eslint/recommended',
            rules: {
              '@angular-eslint/template/accessibility-label-for': ['error'],
              '@angular-eslint/template/no-negated-async': 'error',
            },
          },
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
            rules: {
              '@angular-eslint/template/accessibility-label-for': [
                'error',
                {
                  controlComponents: ['p-inputMask', 'bs4-input'],
                  labelAttributes: ['assoc', 'elementId'],
                  labelComponents: ['app-label', 'ngx-label'],
                },
              ],
              '@angular-eslint/template/no-negated-async': 'error',
            },
          },
        ],
      }),
    );
  });

  it('should update relevant @angular-eslint, @typescript-eslint and eslint dependencies', async () => {
    const tree = await migrationSchematicRunner
      .runSchematicAsync('update-12-0-0', {}, appTree)
      .toPromise();
    const packageJSON = JSON.parse(tree.readContent('/package.json'));
    expect(packageJSON).toMatchInlineSnapshot(`
      Object {
        "devDependencies": Object {
          "@angular-eslint/builder": "^12.0.0",
          "@angular-eslint/eslint-plugin": "^12.0.0",
          "@angular-eslint/eslint-plugin-template": "^12.0.0",
          "@angular-eslint/template-parser": "^12.0.0",
          "@typescript-eslint/eslint-plugin": "4.23.0",
          "@typescript-eslint/experimental-utils": "4.23.0",
          "@typescript-eslint/parser": "4.23.0",
          "eslint": "^7.26.0",
        },
      }
    `);
  });

  it('should migrate from accessibility-label-for to accessibility-label-has-associated-control', async () => {
    const tree = await migrationSchematicRunner
      .runSchematicAsync('update-12-0-0', {}, appTree)
      .toPromise();
    const rootESLint = JSON.parse(tree.readContent('.eslintrc.json'));
    expect(rootESLint).toMatchInlineSnapshot(`
      Object {
        "overrides": Array [
          Object {
            "extends": "plugin:@angular-eslint/recommended",
            "files": Array [
              "*.ts",
            ],
            "rules": Object {
              "@angular-eslint/template/accessibility-label-has-associated-control": Array [
                "error",
              ],
              "@angular-eslint/template/eqeqeq": "error",
              "@angular-eslint/template/no-negated-async": "error",
            },
          },
        ],
        "rules": Object {
          "@angular-eslint/template/accessibility-label-has-associated-control": "error",
        },
      }
    `);

    const fooESLint = JSON.parse(
      tree.readContent('projects/foo/.eslintrc.json'),
    );
    expect(fooESLint).toMatchInlineSnapshot(`
      Object {
        "extends": Array [
          "plugin:@angular-eslint/recommended",
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
            "rules": Object {
              "@angular-eslint/template/accessibility-label-has-associated-control": Array [
                "error",
                Object {
                  "controlComponents": Array [
                    "p-inputMask",
                    "bs4-input",
                  ],
                  "labelComponents": Array [
                    Object {
                      "inputs": Array [
                        "assoc",
                        "elementId",
                      ],
                      "selector": "app-label",
                    },
                    Object {
                      "inputs": Array [
                        "assoc",
                        "elementId",
                      ],
                      "selector": "ngx-label",
                    },
                  ],
                },
              ],
              "@angular-eslint/template/eqeqeq": "error",
              "@angular-eslint/template/no-negated-async": "error",
            },
          },
        ],
      }
    `);
  });

  it('should add eqeqeq', async () => {
    const tree = await migrationSchematicRunner
      .runSchematicAsync('update-12-0-0', {}, appTree)
      .toPromise();
    const rootESLint = JSON.parse(tree.readContent('.eslintrc.json'));
    expect(rootESLint).toMatchInlineSnapshot(`
      Object {
        "overrides": Array [
          Object {
            "extends": "plugin:@angular-eslint/recommended",
            "files": Array [
              "*.ts",
            ],
            "rules": Object {
              "@angular-eslint/template/accessibility-label-has-associated-control": Array [
                "error",
              ],
              "@angular-eslint/template/eqeqeq": "error",
              "@angular-eslint/template/no-negated-async": "error",
            },
          },
        ],
        "rules": Object {
          "@angular-eslint/template/accessibility-label-has-associated-control": "error",
        },
      }
    `);

    const fooESLint = JSON.parse(
      tree.readContent('projects/foo/.eslintrc.json'),
    );
    expect(fooESLint).toMatchInlineSnapshot(`
      Object {
        "extends": Array [
          "plugin:@angular-eslint/recommended",
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
            "rules": Object {
              "@angular-eslint/template/accessibility-label-has-associated-control": Array [
                "error",
                Object {
                  "controlComponents": Array [
                    "p-inputMask",
                    "bs4-input",
                  ],
                  "labelComponents": Array [
                    Object {
                      "inputs": Array [
                        "assoc",
                        "elementId",
                      ],
                      "selector": "app-label",
                    },
                    Object {
                      "inputs": Array [
                        "assoc",
                        "elementId",
                      ],
                      "selector": "ngx-label",
                    },
                  ],
                },
              ],
              "@angular-eslint/template/eqeqeq": "error",
              "@angular-eslint/template/no-negated-async": "error",
            },
          },
        ],
      }
    `);
  });
});
