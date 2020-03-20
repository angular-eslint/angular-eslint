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
    json.devDependencies['@angular-eslint/builder'] = packageJSON.version;
    json.devDependencies['@angular-eslint/eslint-plugin'] = packageJSON.version;
    json.devDependencies['@angular-eslint/eslint-plugin-template'] =
      packageJSON.version;
    json.devDependencies['@angular-eslint/template-parser'] =
      packageJSON.version;

    host.overwrite('package.json', JSON.stringify(json, null, 2));

    context.addTask(new NodePackageInstallTask());

    return host;
  };
}

export default function(): Rule {
  return (host: Tree, context: SchematicContext) => {
    return chain([addAngularESLintPackages()])(host, context);
  };
}
