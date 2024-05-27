import type { Tree } from '@nx/devkit';
import { convertNxGenerator } from '@nx/devkit';
import { wrapAngularDevkitSchematic } from '@nx/devkit/ngcli-adapter';
/**
 * We are able to use the full, unaltered Schema directly from @schematics/angular
 * The applicable json file is copied from node_modules as a prebuiid step to ensure
 * they stay in sync.
 */
import type { Schema as AngularSchema } from '@schematics/angular/application/schema';
import {
  addESLintTargetToProject,
  createESLintConfigForProject,
} from '../utils';

interface Schema extends AngularSchema {
  setParserOptionsProject?: boolean;
}

export default convertNxGenerator(async (tree: Tree, options: Schema) => {
  // Remove angular-eslint specific options before passing to the Angular schematic
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setParserOptionsProject, ...angularOptions } = options;

  const applicationGenerator = wrapAngularDevkitSchematic(
    '@schematics/angular',
    'application',
  );

  await applicationGenerator(tree, angularOptions);

  // Update the lint builder and config in angular.json
  addESLintTargetToProject(tree, options.name, 'lint');

  createESLintConfigForProject(
    tree,
    options.name,
    options.setParserOptionsProject ?? false,
  );
});
