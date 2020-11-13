import { Tree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Schema } from '../../src/convert-tslint-to-eslint/schema';
import { exampleRootTslintJson } from './example-tslint-configs';
import { readJsonInTree } from '../../src/utils';

// Since upgrading to (ts-)jest 26 this usage of this mock has caused issues...
// @ts-ignore
const {
  mockFindReportedConfiguration,
} = require('./mock-tslint-to-eslint-config');

/**
 * See ./mock-tslint-to-eslint-config.ts for why this is needed
 */
jest.doMock('tslint-to-eslint-config', () => {
  return {
    // Since upgrading to (ts-)jest 26 this usage of this mock has caused issues...
    // @ts-ignore
    ...jest.requireActual('tslint-to-eslint-config'),
    findReportedConfiguration: jest.fn(mockFindReportedConfiguration),
  };
});

const schematicRunner = new SchematicTestRunner(
  '@angular-eslint/schematics',
  path.join(__dirname, '../../src/collection.json'),
);

let workspaceTree: UnitTestTree;

const testProjectName = 'foo';
const testDefaultStyleProjectName = 'default-style-application';

schematicRunner.registerCollection(
  '@schematics/angular',
  path.join(
    __dirname,
    '../../../../node_modules/@schematics/angular/collection.json',
  ),
);

function setupAngularWorkspace(workspaceTree: UnitTestTree): void {
  workspaceTree.create('tsconfig.json', JSON.stringify({}));
  workspaceTree.create('e2e/tsconfig.json', JSON.stringify({}));
  workspaceTree.create('package.json', JSON.stringify({}));
  workspaceTree.create('tslint.json', JSON.stringify(exampleRootTslintJson));
  workspaceTree.create(
    'angular.json',
    JSON.stringify({
      $schema: './node_modules/@angular/cli/lib/config/schema.json',
      version: 1,
      newProjectRoot: 'projects',
      projects: {
        [testDefaultStyleProjectName]: {
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
            e2e: {},
          },
        },
      },
    }),
  );
}

describe('convert-tslint-to-eslint', () => {
  beforeEach(async () => {
    workspaceTree = new UnitTestTree(Tree.empty());
    setupAngularWorkspace(workspaceTree);

    await schematicRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        {
          name: testProjectName,
          skipInstall: true,
          skipPackageJson: true,
        },
        workspaceTree,
      )
      .toPromise();
  });

  describe('default Angular CLI project (i.e. uses a src/ directory at the root of the workspace)', () => {
    it('should work', async () => {
      const result = await schematicRunner
        .runSchematicAsync<Schema>(
          'convert-tslint-to-eslint',
          {
            project: testDefaultStyleProjectName,
          },
          workspaceTree,
        )
        .toPromise();

      expect(readJsonInTree(result, '.eslintrc.json')).toMatchSnapshot();
    });
  });

  describe('additional project (e.g. within projects/ directory)', () => {
    it('should work', async () => {
      await schematicRunner
        .runSchematicAsync<Schema>(
          'convert-tslint-to-eslint',
          {
            project: testDefaultStyleProjectName,
          },
          workspaceTree,
        )
        .toPromise();

      expect(true).toBe(true);
    });
  });
});
