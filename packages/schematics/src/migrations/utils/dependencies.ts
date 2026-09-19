import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { updateJsonInTree } from '../../utils';

export function updateDependencies(
  depsToUpdate: { packageName: string; version: string }[],
): Rule {
  return chain([
    updateJsonInTree('package.json', (json) => {
      for (const { packageName, version } of depsToUpdate) {
        updateIfExists(json, packageName, version);
      }
      return json;
    }),
    (_: Tree, context: SchematicContext) => {
      context.addTask(new NodePackageInstallTask());
    },
  ]);
}

function updateIfExists(
  packageJson:
    | {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      }
    | undefined,
  depName: string,
  updatedVersion: string,
) {
  if (!packageJson) {
    return;
  }
  if (packageJson.dependencies && packageJson.dependencies[depName]) {
    packageJson.dependencies[depName] = updatedVersion;
  }
  if (packageJson.devDependencies && packageJson.devDependencies[depName]) {
    packageJson.devDependencies[depName] = updatedVersion;
  }
}
