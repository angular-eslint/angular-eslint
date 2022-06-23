import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { chain, schematic } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  createRootESLintConfig,
  getTargetsConfigFromProject,
  readJsonInTree,
  sortObjectByKeys,
  updateJsonInTree,
  updateSchematicCollections,
} from '../utils';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJSON = require('../../package.json');

function addAngularESLintPackages() {
  return (host: Tree, context: SchematicContext) => {
    if (!host.exists('package.json')) {
      throw new Error(
        'Could not find a `package.json` file at the root of your workspace',
      );
    }

    if (host.exists('tsconfig.base.json')) {
      throw new Error(
        '\nError: Angular CLI v10.1.0 and later (and no `tsconfig.base.json`) is required in order to run this schematic. Please update your workspace and try again.\n',
      );
    }

    const projectPackageJSON = (host.read('package.json') as Buffer).toString(
      'utf-8',
    );
    const json = JSON.parse(projectPackageJSON);
    json.devDependencies = json.devDependencies || {};
    json.devDependencies[
      'eslint'
    ] = `^${packageJSON.devDependencies['eslint']}`;
    json.scripts = json.scripts || {};
    json.scripts['lint'] = json.scripts['lint'] || 'ng lint';

    /**
     * @angular-eslint packages
     */
    json.devDependencies['@angular-eslint/builder'] = packageJSON.version;
    json.devDependencies['@angular-eslint/eslint-plugin'] = packageJSON.version;
    json.devDependencies['@angular-eslint/eslint-plugin-template'] =
      packageJSON.version;
    /**
     * It seems in certain versions of Angular CLI `ng add` will automatically add the
     * @angular-eslint/schematics package to the dependencies section, so clean that up
     * at this point
     */
    if (json.dependencies?.['@angular-eslint/schematics']) {
      delete json.dependencies['@angular-eslint/schematics'];
    }
    json.devDependencies['@angular-eslint/schematics'] = packageJSON.version;
    json.devDependencies['@angular-eslint/template-parser'] =
      packageJSON.version;

    /**
     * @typescript-eslint packages
     */
    const typescriptESLintVersion =
      packageJSON.devDependencies['@typescript-eslint/utils'];
    json.devDependencies['@typescript-eslint/eslint-plugin'] =
      typescriptESLintVersion;
    json.devDependencies['@typescript-eslint/parser'] = typescriptESLintVersion;

    json.devDependencies = sortObjectByKeys(json.devDependencies);
    host.overwrite('package.json', JSON.stringify(json, null, 2));

    context.addTask(new NodePackageInstallTask());

    context.logger.info(`
All @angular-eslint dependencies have been successfully installed 🎉

Please see https://github.com/angular-eslint/angular-eslint for how to add ESLint configuration to your project.
`);

    return host;
  };
}

function applyESLintConfigIfSingleProjectWithNoExistingTSLint() {
  return (host: Tree, context: SchematicContext) => {
    const angularJson = readJsonInTree(host, 'angular.json');
    if (!angularJson || !angularJson.projects) {
      return;
    }

    /**
     * If the workspace was created by passing `--create-application=false` to `ng new`
     * then there will be an angular.json file with a projects object, but no projects
     * within it.
     *
     * In this case we should still configure the root eslint config and set the
     * schematicCollections to use in angular.json.
     */
    const projectNames = Object.keys(angularJson.projects);
    if (projectNames.length === 0) {
      return chain([
        updateJsonInTree('.eslintrc.json', () =>
          createRootESLintConfig(null, false),
        ),
        updateJsonInTree('angular.json', (json) =>
          updateSchematicCollections(json),
        ),
      ]);
    }

    /**
     * The only other use-case we can reliably support for automatic configuration
     * is the default case of having a single project in the workspace, so for anything
     * else we bail at this point.
     */
    if (projectNames.length !== 1) {
      return;
    }

    const singleProject = angularJson.projects[projectNames[0]];
    const targetsConfig = getTargetsConfigFromProject(singleProject);
    // Only possible if malformed, safer to finish here
    if (!targetsConfig) {
      return;
    }

    // The project already has a lint builder setup, finish here as there is nothing more we can do automatically
    if (targetsConfig.lint) {
      return;
    }

    context.logger.info(
      `
We detected that you have a single project in your workspace and no existing linter wired up, so we are configuring ESLint for you automatically.

Please see https://github.com/angular-eslint/angular-eslint for more information.
`.trimStart(),
    );

    return chain([
      schematic('add-eslint-to-project', {}),
      updateJsonInTree('angular.json', (json) =>
        updateSchematicCollections(json),
      ),
    ]);
  };
}

export default function (): Rule {
  return (host: Tree, context: SchematicContext) => {
    return chain([
      addAngularESLintPackages(),
      applyESLintConfigIfSingleProjectWithNoExistingTSLint(),
    ])(host, context);
  };
}
