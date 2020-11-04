import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import * as assert from 'assert';

export function updateArrPropAndRemoveDuplication(
  json: Record<string, any>,
  configBeingExtended: Record<string, any>,
  arrPropName: string,
  deleteIfUltimatelyEmpty: boolean,
): void {
  json[arrPropName] = json[arrPropName] || [];
  configBeingExtended[arrPropName] = configBeingExtended[arrPropName] || [];
  json[arrPropName] = json[arrPropName].filter(
    (extended: string) => !configBeingExtended[arrPropName].includes(extended),
  );
  json[arrPropName] = Array.from(new Set(json[arrPropName]));
  if (deleteIfUltimatelyEmpty && json[arrPropName].length === 0) {
    delete json[arrPropName];
  }
}

export function updateObjPropAndRemoveDuplication(
  json: Record<string, any>,
  configBeingExtended: Record<string, any>,
  objPropName: string,
  deleteIfUltimatelyEmpty: boolean,
): void {
  json[objPropName] = json[objPropName] || {};
  configBeingExtended[objPropName] = configBeingExtended[objPropName] || {};

  for (const [name, val] of Object.entries(json[objPropName])) {
    const valueOfSamePropInExtendedConfig =
      configBeingExtended[objPropName][name];

    try {
      assert.deepStrictEqual(val, valueOfSamePropInExtendedConfig);
      delete json[objPropName][name];
    } catch {}
  }

  if (deleteIfUltimatelyEmpty && Object.keys(json[objPropName]).length === 0) {
    delete json[objPropName];
  }
}

export function ensureESLintPluginsAreInstalled(
  eslintPluginsToBeInstalled: string[],
): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!eslintPluginsToBeInstalled?.length) {
      return;
    }

    if (!host.exists('package.json')) {
      throw new Error(
        'Could not find a `package.json` file at the root of your workspace',
      );
    }

    const projectPackageJSON = host.read('package.json')!.toString('utf-8');
    const json = JSON.parse(projectPackageJSON);
    json.devDependencies = json.devDependencies || {};

    const pluginsToInstall = [];

    for (const pluginName of eslintPluginsToBeInstalled) {
      if (
        !json.devDependencies[pluginName] &&
        !json.dependencies?.[pluginName]
      ) {
        json.devDependencies[pluginName] = 'latest';
        pluginsToInstall.push(pluginName);
      }
    }

    if (pluginsToInstall.length > 0) {
      context.logger.info(
        '\nINFO: To most closely match your tslint.json, the `latest` version of the following eslint plugin(s) have been installed:',
      );
      context.logger.warn('\n  - ' + pluginsToInstall.join('\n  - '));
      context.logger.warn(
        '\nPlease note, you may wish to pin these to a specific version number in your package.json, rather than leaving it open to `latest`.\n',
      );

      host.overwrite('package.json', JSON.stringify(json, null, 2));
      context.addTask(new NodePackageInstallTask());
    }

    return host;
  };
}
