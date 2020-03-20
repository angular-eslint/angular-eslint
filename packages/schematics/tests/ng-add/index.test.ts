import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Tree } from '@angular-devkit/schematics';

const packageJSON = require('../../package.json');

describe('ng-add', () => {
  const schematicRunner = new SchematicTestRunner(
    '@angular-eslint/schematics',
    path.join(__dirname, '../../src/collection.json'),
  );

  const appTree = new UnitTestTree(Tree.empty());
  appTree.create('package.json', JSON.stringify({}));

  it('should update package.json', () => {
    const tree = schematicRunner.runSchematic('ng-add', {}, appTree);
    const projectPackageJSON = JSON.parse(tree.readContent('/package.json'));
    const devDeps = projectPackageJSON.devDependencies;

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
  });
});
