/**
 * We are able to use the full, unaltered Schema directly from @schematics/angular
 * The applicable json file is copied from node_modules as a prebuiid step to ensure
 * they stay in sync.
 */
import type { Schema as AngularSchema } from '@schematics/angular/application/schema';
import type { Tree } from '../devkit-imports';
import {
  convertNxGenerator,
  wrapAngularDevkitSchematic,
} from '../devkit-imports';
import {
  addESLintTargetToProject__NX,
  createESLintConfigForProject__NX,
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
  addESLintTargetToProject__NX(tree, options.name, 'lint');

  createESLintConfigForProject__NX(
    tree,
    options.name,
    options.setParserOptionsProject ?? false,
  );
});
