import {
  Rule,
  SchematicContext,
  Tree,
  chain,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

const packageJSON = require('../../package.json');

function addAngularESLintPackages() {
  return (host: Tree, context: SchematicContext) => {
    if (!host.exists('package.json')) {
      throw new Error(
        'Could not locate package.json at the root of your project',
      );
    }

    const projectPackageJSON = host.read('package.json')!.toString('utf-8');
    const json = JSON.parse(projectPackageJSON);
    json.devDependencies = json.devDependencies || {};

    /**
     * eslint packages
     */
    json.devDependencies['eslint'] = packageJSON.devDependencies['eslint'];

    /**
     * @angular-eslint packages
     */
    json.devDependencies['@angular-eslint/builder'] = packageJSON.version;
    json.devDependencies['@angular-eslint/eslint-plugin'] = packageJSON.version;
    json.devDependencies['@angular-eslint/eslint-plugin-template'] =
      packageJSON.version;
    /**
     * It seems `ng add` will automatically add the @angular-eslint/schematics package to the
     * dependencies section, so move it to devDependencies at this point
     */
    if (json.dependencies && json.dependencies['@angular-eslint/schematics']) {
      json.devDependencies['@angular-eslint/schematics'] =
        json.dependencies['@angular-eslint/schematics'];
      delete json.dependencies['@angular-eslint/schematics'];
    }
    json.devDependencies['@angular-eslint/template-parser'] =
      packageJSON.version;

    /**
     * @typescript-eslint packages
     */
    const typescriptESLintVersion =
      packageJSON.devDependencies['@typescript-eslint/experimental-utils'];
    json.devDependencies[
      '@typescript-eslint/eslint-plugin'
    ] = typescriptESLintVersion;
    json.devDependencies['@typescript-eslint/parser'] = typescriptESLintVersion;

    host.overwrite('package.json', JSON.stringify(json, null, 2));

    context.addTask(new NodePackageInstallTask());

    return host;
  };
}

export default function (): Rule {
  return (host: Tree, context: SchematicContext) => {
    return chain([addAngularESLintPackages()])(host, context);
  };
}
