import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Tree } from '@angular-devkit/schematics';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJSON = require('../../package.json');

const eslintVersion = packageJSON.devDependencies['eslint'];
const typescriptESLintVersion =
  packageJSON.devDependencies['@typescript-eslint/experimental-utils'];

describe('ng-add', () => {
  const schematicRunner = new SchematicTestRunner(
    '@angular-eslint/schematics',
    path.join(__dirname, '../../src/collection.json'),
  );

  const appTree = new UnitTestTree(Tree.empty());
  appTree.create(
    'package.json',
    JSON.stringify({
      // In a real workspace ng-add seems to add @angular-eslint/schematics to dependencies first
      dependencies: {
        '@angular-eslint/schematics': packageJSON.version,
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
            e2e: {},
          },
        },
      },
    }),
  );

  it('should add relevant eslint, @angular-eslint and @typescript-eslint packages', async () => {
    const tree = await schematicRunner
      .runSchematicAsync('ng-add', {}, appTree)
      .toPromise();
    const projectPackageJSON = JSON.parse(tree.readContent('/package.json'));
    const devDeps = projectPackageJSON.devDependencies;
    const deps = projectPackageJSON.dependencies;
    const scripts = projectPackageJSON.scripts;

    expect(scripts['lint']).toEqual('ng lint');

    expect(devDeps['eslint']).toEqual(eslintVersion);

    expect(devDeps['@angular-eslint/builder']).toEqual(packageJSON.version);
    expect(devDeps['@angular-eslint/eslint-plugin']).toEqual(
      packageJSON.version,
    );
    expect(devDeps['@angular-eslint/eslint-plugin-template']).toEqual(
      packageJSON.version,
    );
    expect(devDeps['@angular-eslint/template-parser']).toEqual(
      packageJSON.version,
    );

    /**
     * Check that ng-add implementation successfully moves @angular-eslint/schematics
     * to be a devDependency
     */
    expect(devDeps['@angular-eslint/schematics']).toEqual(packageJSON.version);
    expect(deps['@angular-eslint/schematics']).toBeUndefined();

    expect(devDeps['@typescript-eslint/eslint-plugin']).toEqual(
      typescriptESLintVersion,
    );
    expect(devDeps['@typescript-eslint/parser']).toEqual(
      typescriptESLintVersion,
    );
  });
});
