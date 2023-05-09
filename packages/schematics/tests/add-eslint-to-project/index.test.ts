import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { readJsonInTree } from '../../src/utils';

const schematicRunner = new SchematicTestRunner(
  '@angular-eslint/schematics',
  path.join(__dirname, '../../src/collection.json'),
);

const rootProjectName = 'root-project';
const legacyProjectName = 'legacy-project';
const otherProjectName = 'other-project';

describe('add-eslint-to-project', () => {
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
          [rootProjectName]: {
            projectType: 'application',
            schematics: {},
            root: '',
            sourceRoot: 'src',
            prefix: 'app',
            architect: {
              build: {},
              serve: {},
              'extract-i18n': {},
              test: {},
              lint: {},
            },
          },
          [legacyProjectName]: {
            projectType: 'application',
            schematics: {},
            root: `projects/${legacyProjectName}`,
            sourceRoot: `projects/${legacyProjectName}/src`,
            prefix: 'app',
            architect: {
              build: {},
              serve: {},
              'extract-i18n': {},
              test: {},
              lint: {},
              e2e: {},
            },
          },
          [otherProjectName]: {
            projectType: 'application',
            schematics: {},
            root: `projects/${otherProjectName}`,
            sourceRoot: `projects/${otherProjectName}/src`,
            prefix: 'app',
            architect: {
              build: {},
              serve: {},
              'extract-i18n': {},
              test: {},
              lint: {},
            },
          },
        },
      }),
    );
  });

  it('should add ESLint to the standard Angular CLI root project which it generates by default', async () => {
    const options = {
      project: rootProjectName,
    };

    await schematicRunner.runSchematic(
      'add-eslint-to-project',
      options,
      appTree,
    );

    expect(
      readJsonInTree(appTree, 'angular.json').projects[rootProjectName]
        .architect.lint,
    ).toMatchInlineSnapshot(`
      Object {
        "builder": "@angular-eslint/builder:lint",
        "options": Object {
          "lintFilePatterns": Array [
            "src/**/*.ts",
            "src/**/*.html",
          ],
        },
      }
    `);

    expect(readJsonInTree(appTree, '.eslintrc.json')).toMatchInlineSnapshot(`
      Object {
        "ignorePatterns": Array [
          "projects/**/*",
        ],
        "overrides": Array [
          Object {
            "extends": Array [
              "eslint:recommended",
              "plugin:@typescript-eslint/recommended",
              "plugin:@angular-eslint/recommended",
              "plugin:@angular-eslint/template/process-inline-templates",
            ],
            "files": Array [
              "*.ts",
            ],
            "rules": Object {
              "@angular-eslint/component-selector": Array [
                "error",
                Object {
                  "prefix": "app",
                  "style": "kebab-case",
                  "type": "element",
                },
              ],
              "@angular-eslint/directive-selector": Array [
                "error",
                Object {
                  "prefix": "app",
                  "style": "camelCase",
                  "type": "attribute",
                },
              ],
            },
          },
          Object {
            "extends": Array [
              "plugin:@angular-eslint/template/recommended",
              "plugin:@angular-eslint/template/accessibility",
            ],
            "files": Array [
              "*.html",
            ],
            "rules": Object {},
          },
        ],
        "root": true,
      }
    `);
  });

  it('should add ESLint to the legacy Angular CLI projects which are generated with e2e after the workspace already exists', async () => {
    const options = {
      project: legacyProjectName,
    };

    await schematicRunner.runSchematic(
      'add-eslint-to-project',
      options,
      appTree,
    );

    const projectConfig = readJsonInTree(appTree, 'angular.json').projects[
      legacyProjectName
    ];

    expect(projectConfig.architect.lint).toMatchInlineSnapshot(`
      Object {
        "builder": "@angular-eslint/builder:lint",
        "options": Object {
          "lintFilePatterns": Array [
            "projects/legacy-project/**/*.ts",
            "projects/legacy-project/**/*.html",
          ],
        },
      }
    `);

    expect(readJsonInTree(appTree, `${projectConfig.root}/.eslintrc.json`))
      .toMatchInlineSnapshot(`
      Object {
        "extends": "../../.eslintrc.json",
        "ignorePatterns": Array [
          "!**/*",
        ],
        "overrides": Array [
          Object {
            "files": Array [
              "*.ts",
            ],
            "rules": Object {
              "@angular-eslint/component-selector": Array [
                "error",
                Object {
                  "prefix": "app",
                  "style": "kebab-case",
                  "type": "element",
                },
              ],
              "@angular-eslint/directive-selector": Array [
                "error",
                Object {
                  "prefix": "app",
                  "style": "camelCase",
                  "type": "attribute",
                },
              ],
            },
          },
          Object {
            "files": Array [
              "*.html",
            ],
            "rules": Object {},
          },
        ],
      }
    `);
  });

  it('should add ESLint to the any other Angular CLI projects which are generated after the workspace already exists', async () => {
    const options = {
      project: otherProjectName,
    };

    await schematicRunner.runSchematic(
      'add-eslint-to-project',
      options,
      appTree,
    );

    const projectConfig = readJsonInTree(appTree, 'angular.json').projects[
      otherProjectName
    ];

    expect(projectConfig.architect.lint).toMatchInlineSnapshot(`
      Object {
        "builder": "@angular-eslint/builder:lint",
        "options": Object {
          "lintFilePatterns": Array [
            "projects/other-project/**/*.ts",
            "projects/other-project/**/*.html",
          ],
        },
      }
    `);

    expect(readJsonInTree(appTree, `${projectConfig.root}/.eslintrc.json`))
      .toMatchInlineSnapshot(`
      Object {
        "extends": "../../.eslintrc.json",
        "ignorePatterns": Array [
          "!**/*",
        ],
        "overrides": Array [
          Object {
            "files": Array [
              "*.ts",
            ],
            "rules": Object {
              "@angular-eslint/component-selector": Array [
                "error",
                Object {
                  "prefix": "app",
                  "style": "kebab-case",
                  "type": "element",
                },
              ],
              "@angular-eslint/directive-selector": Array [
                "error",
                Object {
                  "prefix": "app",
                  "style": "camelCase",
                  "type": "attribute",
                },
              ],
            },
          },
          Object {
            "files": Array [
              "*.html",
            ],
            "rules": Object {},
          },
        ],
      }
    `);
  });

  describe('--setParserOptionsProject=true', () => {
    it('should add ESLint to the legacy Angular CLI projects which are generated with e2e after the workspace already exists', async () => {
      const options = {
        project: legacyProjectName,
        setParserOptionsProject: true,
      };

      await schematicRunner.runSchematic(
        'add-eslint-to-project',
        options,
        appTree,
      );

      const projectConfig = readJsonInTree(appTree, 'angular.json').projects[
        legacyProjectName
      ];

      expect(projectConfig.architect.lint).toMatchInlineSnapshot(`
        Object {
          "builder": "@angular-eslint/builder:lint",
          "options": Object {
            "lintFilePatterns": Array [
              "projects/legacy-project/**/*.ts",
              "projects/legacy-project/**/*.html",
            ],
          },
        }
      `);

      expect(readJsonInTree(appTree, `${projectConfig.root}/.eslintrc.json`))
        .toMatchInlineSnapshot(`
        Object {
          "extends": "../../.eslintrc.json",
          "ignorePatterns": Array [
            "!**/*",
          ],
          "overrides": Array [
            Object {
              "files": Array [
                "*.ts",
              ],
              "parserOptions": Object {
                "project": Array [
                  "projects/legacy-project/tsconfig.(app|spec).json",
                  "projects/legacy-project/e2e/tsconfig.json",
                ],
              },
              "rules": Object {
                "@angular-eslint/component-selector": Array [
                  "error",
                  Object {
                    "prefix": "app",
                    "style": "kebab-case",
                    "type": "element",
                  },
                ],
                "@angular-eslint/directive-selector": Array [
                  "error",
                  Object {
                    "prefix": "app",
                    "style": "camelCase",
                    "type": "attribute",
                  },
                ],
              },
            },
            Object {
              "files": Array [
                "*.html",
              ],
              "rules": Object {},
            },
          ],
        }
      `);
    });

    it('should add ESLint to the any other Angular CLI projects which are generated after the workspace already exists', async () => {
      const options = {
        project: otherProjectName,
        setParserOptionsProject: true,
      };

      await schematicRunner.runSchematic(
        'add-eslint-to-project',
        options,
        appTree,
      );

      const projectConfig = readJsonInTree(appTree, 'angular.json').projects[
        otherProjectName
      ];

      expect(projectConfig.architect.lint).toMatchInlineSnapshot(`
        Object {
          "builder": "@angular-eslint/builder:lint",
          "options": Object {
            "lintFilePatterns": Array [
              "projects/other-project/**/*.ts",
              "projects/other-project/**/*.html",
            ],
          },
        }
      `);

      expect(readJsonInTree(appTree, `${projectConfig.root}/.eslintrc.json`))
        .toMatchInlineSnapshot(`
        Object {
          "extends": "../../.eslintrc.json",
          "ignorePatterns": Array [
            "!**/*",
          ],
          "overrides": Array [
            Object {
              "files": Array [
                "*.ts",
              ],
              "parserOptions": Object {
                "project": Array [
                  "projects/other-project/tsconfig.(app|spec).json",
                ],
              },
              "rules": Object {
                "@angular-eslint/component-selector": Array [
                  "error",
                  Object {
                    "prefix": "app",
                    "style": "kebab-case",
                    "type": "element",
                  },
                ],
                "@angular-eslint/directive-selector": Array [
                  "error",
                  Object {
                    "prefix": "app",
                    "style": "camelCase",
                    "type": "attribute",
                  },
                ],
              },
            },
            Object {
              "files": Array [
                "*.html",
              ],
              "rules": Object {},
            },
          ],
        }
      `);
    });
  });

  describe('custom root project sourceRoot', () => {
    let tree2: UnitTestTree;

    beforeEach(() => {
      tree2 = new UnitTestTree(Tree.empty());
      tree2.create('package.json', JSON.stringify({}));
      tree2.create(
        'angular.json',
        JSON.stringify({
          $schema: './node_modules/@angular/cli/lib/config/schema.json',
          version: 1,
          newProjectRoot: 'projects',
          projects: {
            [rootProjectName]: {
              projectType: 'application',
              schematics: {},
              root: '',
              sourceRoot: 'custom-source-root',
              prefix: 'app',
              architect: {
                build: {},
                serve: {},
                'extract-i18n': {},
                test: {},
                lint: {},
              },
            },
            [legacyProjectName]: {
              projectType: 'application',
              schematics: {},
              root: `projects/${legacyProjectName}`,
              sourceRoot: `projects/${legacyProjectName}/src`,
              prefix: 'app',
              architect: {
                build: {},
                serve: {},
                'extract-i18n': {},
                test: {},
                lint: {},
                e2e: {},
              },
            },
            [otherProjectName]: {
              projectType: 'application',
              schematics: {},
              root: `projects/${otherProjectName}`,
              sourceRoot: `projects/${otherProjectName}/src`,
              prefix: 'app',
              architect: {
                build: {},
                serve: {},
                'extract-i18n': {},
                test: {},
                lint: {},
              },
            },
          },
        }),
      );
    });

    it('should correctly add ESLint to the Angular CLI root project even when it has a custom sourceRoot', async () => {
      const options = {
        project: rootProjectName,
      };

      await schematicRunner.runSchematic(
        'add-eslint-to-project',
        options,
        tree2,
      );

      expect(
        readJsonInTree(tree2, 'angular.json').projects[rootProjectName]
          .architect.lint,
      ).toMatchInlineSnapshot(`
        Object {
          "builder": "@angular-eslint/builder:lint",
          "options": Object {
            "lintFilePatterns": Array [
              "custom-source-root/**/*.ts",
              "custom-source-root/**/*.html",
            ],
          },
        }
      `);

      expect(readJsonInTree(tree2, '.eslintrc.json')).toMatchInlineSnapshot(`
        Object {
          "ignorePatterns": Array [
            "projects/**/*",
          ],
          "overrides": Array [
            Object {
              "extends": Array [
                "eslint:recommended",
                "plugin:@typescript-eslint/recommended",
                "plugin:@angular-eslint/recommended",
                "plugin:@angular-eslint/template/process-inline-templates",
              ],
              "files": Array [
                "*.ts",
              ],
              "rules": Object {
                "@angular-eslint/component-selector": Array [
                  "error",
                  Object {
                    "prefix": "app",
                    "style": "kebab-case",
                    "type": "element",
                  },
                ],
                "@angular-eslint/directive-selector": Array [
                  "error",
                  Object {
                    "prefix": "app",
                    "style": "camelCase",
                    "type": "attribute",
                  },
                ],
              },
            },
            Object {
              "extends": Array [
                "plugin:@angular-eslint/template/recommended",
                "plugin:@angular-eslint/template/accessibility",
              ],
              "files": Array [
                "*.html",
              ],
              "rules": Object {},
            },
          ],
          "root": true,
        }
      `);
    });
  });
});
